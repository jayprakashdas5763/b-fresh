import { NextResponse } from "next/server";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { supabaseAdmin } from "@/lib/supabase/admin";

function eventTimestamp(payload: any): string {
  if (
    typeof payload?.created_at === "number" &&
    Number.isFinite(payload.created_at)
  ) {
    return new Date(payload.created_at * 1000).toISOString();
  }

  return new Date().toISOString();
}

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSecret || !razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        {
          error: "Razorpay webhook configuration is missing.",
        },
        { status: 500 },
      );
    }

    const rawBody = await request.text();

    const signature = request.headers.get("x-razorpay-signature");

    const eventId = request.headers.get("x-razorpay-event-id");
    if (!eventId) {
      return NextResponse.json(
        { error: "Missing Razorpay event ID." },
        { status: 400 },
      );
    }

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
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 },
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload?.event;

    const { data: existingEvent, error: existingEventError } =
      await supabaseAdmin
        .from("order_payment_events")
        .select("id")
        .eq("event_id", eventId)
        .maybeSingle();

    if (existingEventError) {
      console.error(
        "Unable to check Razorpay webhook event:",
        existingEventError,
      );

      return NextResponse.json(
        { error: "Unable to validate webhook event." },
        { status: 500 },
      );
    }

    if (existingEvent) {
      return NextResponse.json({
        received: true,
        alreadyProcessed: true,
      });
    }

    if (!event) {
      return NextResponse.json({
        received: true,
      });
    }

    /*
     * PAYMENT FAILED
     */
    if (event === "payment.failed") {
      const payment = payload?.payload?.payment?.entity;

      const paymentId = typeof payment?.id === "string" ? payment.id : "";

      const razorpayOrderId =
        typeof payment?.order_id === "string" ? payment.order_id : "";

      if (paymentId && razorpayOrderId) {
        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("id")
          .eq("razorpay_order_id", razorpayOrderId)
          .maybeSingle();

        if (order) {
          await supabaseAdmin.from("order_payment_events").upsert(
            {
              order_id: order.id,
              event_type: "payment.failed",
              event_time: eventTimestamp(payload),
              amount:
                typeof payment.amount === "number"
                  ? payment.amount / 100
                  : null,
              currency:
                typeof payment.currency === "string" ? payment.currency : "INR",
              razorpay_payment_id: paymentId,
              razorpay_order_id: razorpayOrderId,
              event_id: eventId,
              metadata: {
                error_code: payment.error_code ?? null,
                error_description: payment.error_description ?? null,
              },
            },
            {
              onConflict: "event_id",
            },
          );
        }
      }

      return NextResponse.json({
        received: true,
      });
    }

    /*
     * REFUND EVENTS
     */
    if (
      event === "refund.created" ||
      event === "refund.processed" ||
      event === "refund.failed"
    ) {
      const refund = payload?.payload?.refund?.entity;

      const refundId = typeof refund?.id === "string" ? refund.id : "";

      const paymentId =
        typeof refund?.payment_id === "string" ? refund.payment_id : "";

      if (!refundId || !paymentId) {
        return NextResponse.json(
          {
            error: "Missing refund identifiers.",
          },
          { status: 400 },
        );
      }

      const { data: order } = await supabaseAdmin
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

      if (!order) {
        return NextResponse.json(
          { error: "Order not found." },
          { status: 404 },
        );
      }

      const refundEventType =
        event === "refund.created" ? "refund.requested" : event;

      await supabaseAdmin.from("order_payment_events").upsert(
        {
          order_id: order.id,
          event_type: refundEventType,
          event_time: eventTimestamp(payload),
          amount:
            typeof refund.amount === "number" ? refund.amount / 100 : null,
          currency:
            typeof refund.currency === "string" ? refund.currency : "INR",
          razorpay_payment_id: paymentId,
          razorpay_refund_id: refundId,
          event_id: eventId,
          metadata: {
            refund_status: refund.status ?? null,
            speed_processed: refund.speed_processed ?? null,
          },
        },
        {
          onConflict: "event_id",
        },
      );

      /*
       * Refund processed
       */
      if (event === "refund.processed") {
        if (
          order.payment_status !== "refunded" ||
          order.status !== "cancelled"
        ) {
          const { data: items } = await supabaseAdmin
            .from("order_items")
            .select("product_id, quantity")
            .eq("order_id", order.id)
            .not("product_id", "is", null);

          for (const item of items ?? []) {
            if (!item.product_id) {
              continue;
            }

            await supabaseAdmin.rpc("restore_product_stock", {
              p_product_id: item.product_id,
              p_quantity: item.quantity,
            });
          }
        }

        await supabaseAdmin
          .from("orders")
          .update({
            status: "cancelled",
            payment_status: "refunded",
            refund_status: "processed",
            razorpay_refund_id: refundId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);
      }

      /*
       * Refund created / requested
       */
      if (event === "refund.created") {
        await supabaseAdmin
          .from("orders")
          .update({
            refund_status: refund?.status ?? "pending",
            razorpay_refund_id: refundId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);
      }

      /*
       * Refund failed
       */
      if (event === "refund.failed") {
        await supabaseAdmin
          .from("orders")
          .update({
            refund_status: "failed",
            razorpay_refund_id: refundId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);
      }

      return NextResponse.json({
        received: true,
      });
    }

    /*
     * PAYMENT AUTHORIZED / CAPTURED
     */
    if (event === "payment.authorized" || event === "payment.captured") {
      const payment = payload?.payload?.payment?.entity;

      const paymentId = typeof payment?.id === "string" ? payment.id : "";

      const razorpayOrderId =
        typeof payment?.order_id === "string" ? payment.order_id : "";

      if (!paymentId || !razorpayOrderId) {
        return NextResponse.json(
          {
            error: "Missing payment identifiers.",
          },
          { status: 400 },
        );
      }

      const { data: order } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("razorpay_order_id", razorpayOrderId)
        .maybeSingle();

      if (order) {
        await supabaseAdmin.from("order_payment_events").upsert(
          {
            order_id: order.id,
            event_type: event,
            event_time: eventTimestamp(payload),
            amount:
              typeof payment.amount === "number" ? payment.amount / 100 : null,
            currency:
              typeof payment.currency === "string" ? payment.currency : "INR",
            razorpay_payment_id: paymentId,
            razorpay_order_id: razorpayOrderId,
            event_id: eventId,
            metadata: {
              payment_status: payment.status ?? null,
            },
          },
          {
            onConflict: "event_id",
          },
        );
      }

      return NextResponse.json({
        received: true,
      });
    }

    /*
     * ORDER PAID
     *
     * Keep the event for the timeline, but do not create another
     * B-Fresh order if the browser verification already did so.
     */
    if (event === "order.paid") {
      const payment = payload?.payload?.payment?.entity;

      const orderEntity = payload?.payload?.order?.entity;

      const razorpayOrderId = payment?.order_id ?? orderEntity?.id ?? "";

      const razorpayPaymentId = payment?.id ?? "";

      if (!razorpayOrderId || !razorpayPaymentId) {
        return NextResponse.json({
          received: true,
        });
      }

      const { data: existingOrder } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("razorpay_order_id", razorpayOrderId)
        .maybeSingle();

      if (existingOrder) {
        await supabaseAdmin.from("order_payment_events").upsert(
          {
            order_id: existingOrder.id,
            event_type: "order.paid",
            event_time: eventTimestamp(payload),
            amount:
              typeof payment?.amount === "number" ? payment.amount / 100 : null,
            currency:
              typeof payment?.currency === "string" ? payment.currency : "INR",
            razorpay_payment_id: razorpayPaymentId,
            razorpay_order_id: razorpayOrderId,
            event_id: eventId,
          },
          {
            onConflict: "event_id",
          },
        );

        return NextResponse.json({
          received: true,
          alreadyProcessed: true,
        });
      }

      /*
       * Fallback: create the order from Razorpay metadata.
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
        return NextResponse.json(
          {
            error: "Missing order metadata.",
          },
          { status: 400 },
        );
      }

      const { data: createdOrderId, error } = await supabaseAdmin.rpc(
        "create_paid_order_from_cart",
        {
          p_address_id: addressId,
          p_razorpay_order_id: razorpayOrderId,
          p_razorpay_payment_id: razorpayPaymentId,
          p_customer_note: customerNote || null,
        },
      );

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (createdOrderId) {
        await supabaseAdmin.from("order_payment_events").upsert(
          {
            order_id: createdOrderId,
            event_type: "order.paid",
            event_time: eventTimestamp(payload),
            amount:
              typeof payment?.amount === "number" ? payment.amount / 100 : null,
            currency:
              typeof payment?.currency === "string" ? payment.currency : "INR",
            razorpay_payment_id: razorpayPaymentId,
            razorpay_order_id: razorpayOrderId,
            event_id: eventId,
          },
          {
            onConflict: "event_id",
          },
        );
      }

      return NextResponse.json({
        received: true,
        orderId: createdOrderId,
      });
    }

    return NextResponse.json({
      received: true,
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
