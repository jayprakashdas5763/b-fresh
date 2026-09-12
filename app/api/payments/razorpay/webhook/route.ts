import { NextResponse } from "next/server";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSecret || !razorpayKeyId || !razorpayKeySecret) {
      console.error("Razorpay webhook is not configured.");
      return NextResponse.json(
        { error: "Webhook configuration is missing." },
        { status: 500 },
      );
    }

    /*
     * IMPORTANT:
     * Razorpay requires the RAW request body for signature validation.
     * Do not call request.json() before this verification.
     */
    const rawBody = await request.text();

    const signature = request.headers.get("x-razorpay-signature");
    const eventId = request.headers.get("x-razorpay-event-id");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Razorpay signature." },
        { status: 400 },
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const receivedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      console.error("Invalid Razorpay webhook signature.");

      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 },
      );
    }

    /*
     * We have now authenticated Razorpay.
     */
    const payload = JSON.parse(rawBody);

    const event = payload?.event;

    if (!event) {
      return NextResponse.json({ received: true });
    }

    /*
     * Ignore events we are not currently using.
     */
    if (
      event !== "order.paid" &&
      event !== "payment.captured" &&
      event !== "payment.failed"
    ) {
      return NextResponse.json({ received: true });
    }

    const supabase = await createClient();

    /*
     * payment.failed does not create a B-Fresh order.
     */
    if (event === "payment.failed") {
      return NextResponse.json({ received: true });
    }

    const paymentEntity = payload?.payload?.payment?.entity ?? null;

    const orderEntity = payload?.payload?.order?.entity ?? null;

    const razorpayOrderId = paymentEntity?.order_id ?? orderEntity?.id ?? "";

    const razorpayPaymentId = paymentEntity?.id ?? "";

    if (!razorpayOrderId || !razorpayPaymentId) {
      console.error("Razorpay webhook missing order/payment IDs.", {
        event,
      });

      return NextResponse.json(
        { error: "Missing payment identifiers." },
        { status: 400 },
      );
    }

    /*
     * Check whether this payment has already been processed.
     *
     * This makes the webhook safe when Razorpay retries the same
     * event or when the Checkout handler already created the order.
     */
    const { data: existingOrder, error: existingOrderError } = await supabase
      .from("orders")
      .select("id, payment_status")
      .eq("razorpay_order_id", razorpayOrderId)
      .maybeSingle();

    if (existingOrderError) {
      console.error(
        "Unable to check existing Razorpay order:",
        existingOrderError,
      );

      return NextResponse.json(
        { error: "Unable to reconcile payment." },
        { status: 500 },
      );
    }

    if (existingOrder) {
      return NextResponse.json({
        received: true,
        alreadyProcessed: true,
      });
    }

    /*
     * Fetch the Razorpay Order to recover the metadata we stored
     * when the Checkout Order was created.
     */
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);

    const notes = razorpayOrder.notes ?? {};

    const addressId =
      typeof notes.address_id === "string" ? notes.address_id : "";

    const customerNote =
      typeof notes.customer_note === "string" ? notes.customer_note : "";

    if (!addressId) {
      console.error(
        "Razorpay webhook order is missing address_id metadata.",
        razorpayOrderId,
      );

      return NextResponse.json(
        { error: "Missing order metadata." },
        { status: 400 },
      );
    }

    /*
     * Create the B-Fresh paid order using the same secure database
     * validation used by the normal Checkout verification path.
     */
    const { data: orderId, error: createOrderError } = await supabase.rpc(
      "create_paid_order_from_cart",
      {
        p_address_id: addressId,
        p_razorpay_order_id: razorpayOrderId,
        p_razorpay_payment_id: razorpayPaymentId,
        p_customer_note: customerNote || null,
      },
    );

    if (createOrderError) {
      /*
       * The normal Checkout handler may have already created the
       * order between our first database check and this RPC.
       * Re-check before treating this as a failure.
       */
      const { data: processedOrder } = await supabase
        .from("orders")
        .select("id, payment_status")
        .eq("razorpay_order_id", razorpayOrderId)
        .maybeSingle();

      if (processedOrder) {
        return NextResponse.json({
          received: true,
          alreadyProcessed: true,
        });
      }

      console.error(
        "Unable to create paid B-Fresh order from webhook:",
        createOrderError,
        {
          eventId,
          razorpayOrderId,
          razorpayPaymentId,
        },
      );

      return NextResponse.json(
        { error: "Paid order reconciliation failed." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      received: true,
      orderId,
    });
  } catch (error) {
    console.error("Razorpay webhook error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook processing failed.",
      },
      { status: 500 },
    );
  }
}
