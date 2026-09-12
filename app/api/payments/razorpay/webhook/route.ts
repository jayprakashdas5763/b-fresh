import { NextResponse } from "next/server";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
     * Razorpay signature verification must use the raw request body.
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
      console.error("Invalid Razorpay webhook signature.", {
        eventId,
      });

      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 },
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload?.event;

    if (!event) {
      return NextResponse.json({ received: true });
    }

    /*
     * Payment events
     */
    if (event === "payment.failed") {
      return NextResponse.json({ received: true });
    }

    /*
     * Refund events
     */
    if (event === "refund.processed" || event === "refund.failed") {
      const refundEntity = payload?.payload?.refund?.entity;

      const refundId =
        typeof refundEntity?.id === "string" ? refundEntity.id : "";

      const paymentId =
        typeof refundEntity?.payment_id === "string"
          ? refundEntity.payment_id
          : "";

      if (!refundId || !paymentId) {
        console.error("Refund webhook missing refund/payment IDs.", {
          event,
          eventId,
        });

        return NextResponse.json(
          { error: "Missing refund identifiers." },
          { status: 400 },
        );
      }

      const { data: order, error: orderLookupError } = await supabaseAdmin
        .from("orders")
        .select(
          `
              id,
              status,
              payment_status,
              razorpay_payment_id,
              razorpay_refund_id,
              refund_status
            `,
        )
        .eq("razorpay_payment_id", paymentId)
        .maybeSingle();

      if (orderLookupError) {
        console.error(
          "Unable to find order for Razorpay refund:",
          orderLookupError,
        );

        return NextResponse.json(
          { error: "Unable to reconcile refund." },
          { status: 500 },
        );
      }

      if (!order) {
        console.error(
          "No B-Fresh order found for Razorpay payment:",
          paymentId,
        );

        return NextResponse.json(
          { error: "Order not found for refund." },
          { status: 404 },
        );
      }

      /*
       * Idempotency: ignore duplicate webhook delivery.
       */
      if (
        order.razorpay_refund_id === refundId &&
        order.refund_status ===
          (event === "refund.processed" ? "processed" : "failed")
      ) {
        return NextResponse.json({
          received: true,
          alreadyProcessed: true,
        });
      }

      /*
       * REFUND PROCESSED
       */
      if (event === "refund.processed") {
        /*
         * Restore stock only if the order has not already been
         * finalized as cancelled/refunded.
         */
        if (
          order.payment_status !== "refunded" ||
          order.status !== "cancelled"
        ) {
          const { data: items, error: itemsError } = await supabaseAdmin
            .from("order_items")
            .select("product_id, quantity")
            .eq("order_id", order.id)
            .not("product_id", "is", null);

          if (itemsError) {
            console.error("Unable to load order items for refund:", itemsError);

            return NextResponse.json(
              { error: "Unable to restore stock." },
              { status: 500 },
            );
          }

          for (const item of items ?? []) {
            if (!item.product_id) {
              continue;
            }

            const { error: stockError } = await supabaseAdmin.rpc(
              "restore_product_stock",
              {
                p_product_id: item.product_id,
                p_quantity: item.quantity,
              },
            );

            if (stockError) {
              console.error("Stock restoration failed:", stockError);

              return NextResponse.json(
                { error: "Unable to restore stock." },
                { status: 500 },
              );
            }
          }
        }

        const { error: updateError } = await supabaseAdmin
          .from("orders")
          .update({
            status: "cancelled",
            payment_status: "refunded",
            refund_status: "processed",
            razorpay_refund_id: refundId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        if (updateError) {
          console.error("Unable to finalize refunded order:", updateError);

          return NextResponse.json(
            {
              error: "Unable to finalize refunded order.",
            },
            { status: 500 },
          );
        }

        return NextResponse.json({
          received: true,
          refundProcessed: true,
        });
      }

      /*
       * REFUND FAILED
       *
       * Keep the order active and payment marked as paid.
       */
      const { error: failedUpdateError } = await supabaseAdmin
        .from("orders")
        .update({
          refund_status: "failed",
          razorpay_refund_id: refundId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (failedUpdateError) {
        console.error("Unable to record failed refund:", failedUpdateError);

        return NextResponse.json(
          {
            error: "Unable to record refund failure.",
          },
          { status: 500 },
        );
      }

      return NextResponse.json({
        received: true,
        refundFailed: true,
      });
    }

    /*
     * Payment/order events.
     */
    if (event !== "order.paid" && event !== "payment.captured") {
      return NextResponse.json({ received: true });
    }

    const paymentEntity = payload?.payload?.payment?.entity ?? null;

    const orderEntity = payload?.payload?.order?.entity ?? null;

    const razorpayOrderId = paymentEntity?.order_id ?? orderEntity?.id ?? "";

    const razorpayPaymentId = paymentEntity?.id ?? "";

    if (!razorpayOrderId || !razorpayPaymentId) {
      console.error("Razorpay webhook missing order/payment IDs.", {
        event,
        eventId,
      });

      return NextResponse.json(
        { error: "Missing payment identifiers." },
        { status: 400 },
      );
    }

    /*
     * Check whether the payment was already processed by
     * the browser verification route.
     */
    const { data: existingOrder, error: existingOrderError } =
      await supabaseAdmin
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
     * Recover order metadata from Razorpay.
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
        "Razorpay order is missing address_id metadata.",
        razorpayOrderId,
      );

      return NextResponse.json(
        { error: "Missing order metadata." },
        { status: 400 },
      );
    }

    /*
     * Create the B-Fresh paid order.
     */
    const { data: orderId, error: createOrderError } = await supabaseAdmin.rpc(
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
       * The browser verification route may have created
       * the order at nearly the same time.
       */
      const { data: processedOrder } = await supabaseAdmin
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
        {
          error: "Paid order reconciliation failed.",
        },
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
