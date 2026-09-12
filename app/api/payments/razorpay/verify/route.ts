import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
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

    const addressId = typeof body.addressId === "string" ? body.addressId : "";

    const customerNote =
      typeof body.customerNote === "string" ? body.customerNote : "";

    const razorpayOrderId =
      typeof body.razorpayOrderId === "string" ? body.razorpayOrderId : "";

    const razorpayPaymentId =
      typeof body.razorpayPaymentId === "string" ? body.razorpayPaymentId : "";

    const razorpaySignature =
      typeof body.razorpaySignature === "string" ? body.razorpaySignature : "";

    if (
      !addressId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        { error: "Incomplete Razorpay payment details." },
        { status: 400 },
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const receivedBuffer = Buffer.from(razorpaySignature);
    const generatedBuffer = Buffer.from(generatedSignature);

    if (
      receivedBuffer.length !== generatedBuffer.length ||
      !crypto.timingSafeEqual(receivedBuffer, generatedBuffer)
    ) {
      return NextResponse.json(
        { error: "Razorpay payment verification failed." },
        { status: 400 },
      );
    }

    const { data: orderId, error: orderError } = await supabase.rpc(
      "create_paid_order_from_cart",
      {
        p_address_id: addressId,
        p_razorpay_order_id: razorpayOrderId,
        p_razorpay_payment_id: razorpayPaymentId,
        p_customer_note: customerNote.trim() || null,
      },
    );

    if (orderError) {
      console.error(
        "Paid order creation failed after Razorpay verification:",
        orderError,
      );

      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json(
        { error: "Paid order could not be created." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
    });
  } catch (error) {
    console.error("Razorpay verification error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to verify payment.",
      },
      { status: 500 },
    );
  }
}
