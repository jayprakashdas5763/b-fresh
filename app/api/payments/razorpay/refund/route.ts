import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay is not configured on the server." },
        { status: 500 },
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const orderId = typeof body.orderId === "string" ? body.orderId : "";

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 },
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
          id,
          user_id,
          status,
          payment_method,
          payment_status,
          razorpay_payment_id,
          razorpay_refund_id,
          refund_status
        `,
      )
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (
      !["pending", "confirmed", "processing", "packed"].includes(order.status)
    ) {
      return NextResponse.json(
        { error: "This order can no longer be cancelled." },
        { status: 400 },
      );
    }

    if (order.payment_method !== "razorpay") {
      return NextResponse.json(
        { error: "This order does not use Razorpay." },
        { status: 400 },
      );
    }

    if (order.payment_status !== "paid") {
      return NextResponse.json(
        { error: "This payment is not eligible for a refund." },
        { status: 400 },
      );
    }

    if (!order.razorpay_payment_id) {
      return NextResponse.json(
        { error: "Razorpay payment ID is missing." },
        { status: 400 },
      );
    }

    if (
      order.refund_status === "pending" ||
      order.refund_status === "processed"
    ) {
      return NextResponse.json(
        { error: "A refund has already been requested for this order." },
        { status: 400 },
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const refund = await razorpay.payments.refund(order.razorpay_payment_id, {
      notes: {
        b_fresh_order_id: order.id,
      },
    });

    const refundStatus =
      typeof refund.status === "string" ? refund.status : "pending";

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        razorpay_refund_id: refund.id,
        refund_status: refundStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error(
        "Refund created but order could not be updated:",
        updateError,
      );

      return NextResponse.json(
        {
          error:
            "Refund was created, but the order could not be updated. Please contact support.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      refundStatus,
    });
  } catch (error) {
    console.error("Razorpay refund error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to request the refund.",
      },
      { status: 500 },
    );
  }
}
