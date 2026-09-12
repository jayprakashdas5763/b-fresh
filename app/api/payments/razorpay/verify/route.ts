import { NextResponse } from "next/server";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

function toTimestamp(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value * 1000).toISOString();
  }

  return new Date().toISOString();
}

export async function POST(request: Request) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const keyId = process.env.RAZORPAY_KEY_ID;

    if (!keySecret || !keyId) {
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

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    /*
     * Fetch the payment from Razorpay so the timeline can use
     * Razorpay's actual payment creation timestamp/status.
     */
    const payment = await razorpay.payments.fetch(razorpayPaymentId);

    if (!payment || payment.order_id !== razorpayOrderId) {
      return NextResponse.json(
        { error: "Razorpay payment/order mismatch." },
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
      /*
       * The webhook or a retry may already have created the order.
       */
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("razorpay_payment_id", razorpayPaymentId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existingOrder) {
        return NextResponse.json(
          { error: orderError.message },
          { status: 400 },
        );
      }
    }

    const finalOrderId = orderId;

    if (!finalOrderId) {
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("razorpay_payment_id", razorpayPaymentId)
        .eq("user_id", user.id)
        .single();

      if (!existingOrder) {
        return NextResponse.json(
          {
            error:
              "Payment was verified, but the B-Fresh order could not be created.",
          },
          { status: 500 },
        );
      }

      /*
       * The existing order is safe to continue with.
       */
      const { error: createdEventError } = await supabase
        .from("order_payment_events")
        .upsert(
          {
            order_id: existingOrder.id,
            event_type: "payment.created",
            event_time: toTimestamp(payment.created_at),
            amount:
              typeof payment.amount === "number" ? payment.amount / 100 : null,
            currency:
              typeof payment.currency === "string" ? payment.currency : "INR",
            razorpay_payment_id: razorpayPaymentId,
            razorpay_order_id: razorpayOrderId,
            metadata: {
              payment_status: payment.status,
            },
          },
          {
            onConflict: "event_id",
          },
        );

      if (createdEventError) {
        console.error("Payment timeline event failed:", createdEventError);
      }

      return NextResponse.json({
        success: true,
        orderId: existingOrder.id,
      });
    }

    /*
     * Record the payment creation event.
     */
    const { error: createdEventError } = await supabase
      .from("order_payment_events")
      .insert({
        order_id: finalOrderId,
        event_type: "payment.created",
        event_time: toTimestamp(payment.created_at),
        amount:
          typeof payment.amount === "number" ? payment.amount / 100 : null,
        currency:
          typeof payment.currency === "string" ? payment.currency : "INR",
        razorpay_payment_id: razorpayPaymentId,
        razorpay_order_id: razorpayOrderId,
        metadata: {
          payment_status: payment.status,
        },
      });

    if (createdEventError) {
      console.error(
        "Unable to record payment.created timeline event:",
        createdEventError,
      );
    }

    /*
     * If the payment is already captured by the time the browser
     * verification occurs, record captured as well. Webhooks remain
     * responsible for authoritative lifecycle events.
     */
    if (payment.status === "captured") {
      const { error: capturedEventError } = await supabase
        .from("order_payment_events")
        .insert({
          order_id: finalOrderId,
          event_type: "payment.captured",
          event_time: new Date().toISOString(),
          amount:
            typeof payment.amount === "number" ? payment.amount / 100 : null,
          currency:
            typeof payment.currency === "string" ? payment.currency : "INR",
          razorpay_payment_id: razorpayPaymentId,
          razorpay_order_id: razorpayOrderId,
          metadata: {
            source: "payment_verification",
          },
        });

      if (capturedEventError) {
        console.error(
          "Unable to record payment.captured timeline event:",
          capturedEventError,
        );
      }
    }

    return NextResponse.json({
      success: true,
      orderId: finalOrderId,
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
