import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: Request) {
  try {
    if (!razorpayKeyId || !razorpayKeySecret) {
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

    if (!addressId) {
      return NextResponse.json(
        { error: "Please select a delivery address." },
        { status: 400 },
      );
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    /*
     * Read the current cart and calculate the amount server-side.
     * We deliberately do not trust an amount supplied by the browser.
     */
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (cartError) {
      return NextResponse.json({ error: cartError.message }, { status: 500 });
    }

    if (!cart) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 },
      );
    }

    const { data: items, error: itemsError } = await supabase
      .from("cart_items")
      .select(
        `
          id,
          quantity,
          products (
            id,
            name,
            price,
            stock_quantity,
            is_active
          )
        `,
      )
      .eq("cart_id", cart.id);

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 },
      );
    }

    let subtotal = 0;

    for (const item of items) {
      const product = Array.isArray(item.products)
        ? item.products[0]
        : item.products;

      if (!product) {
        return NextResponse.json(
          { error: "A product in your cart is no longer available." },
          { status: 400 },
        );
      }

      if (!product.is_active) {
        return NextResponse.json(
          { error: `Product "${product.name}" is no longer available.` },
          { status: 400 },
        );
      }

      if (item.quantity <= 0) {
        return NextResponse.json(
          { error: `Invalid quantity for "${product.name}".` },
          { status: 400 },
        );
      }

      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Not enough stock for "${product.name}". Available: ${product.stock_quantity}.`,
          },
          { status: 400 },
        );
      }

      subtotal += Number(product.price) * item.quantity;
    }

    /*
     * Get the same delivery quote used by the checkout page.
     */
    const { data: quote, error: quoteError } = await supabase.rpc(
      "get_delivery_quote",
      {
        p_address_id: addressId,
      },
    );

    if (quoteError) {
      return NextResponse.json({ error: quoteError.message }, { status: 400 });
    }

    if (!quote?.length) {
      return NextResponse.json(
        { error: "Delivery is unavailable for this address." },
        { status: 400 },
      );
    }

    const deliveryFee = Number(quote[0].delivery_fee ?? 0);
    const minimumOrderAmount = Number(quote[0].minimum_order_amount ?? 0);

    if (subtotal < minimumOrderAmount) {
      return NextResponse.json(
        {
          error: `Minimum order amount for this delivery zone is ₹${minimumOrderAmount.toFixed(2)}.`,
        },
        { status: 400 },
      );
    }

    const total = subtotal + deliveryFee;

    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json(
        { error: "Invalid order total." },
        { status: 400 },
      );
    }

    /*
     * Razorpay expects the amount in the smallest currency unit.
     * INR → paise.
     */
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `bfresh_${Date.now()}`,
      notes: {
        user_id: user.id,
        address_id: addressId,
        customer_note: customerNote.slice(0, 500),
      },
    });

    return NextResponse.json({
      keyId: razorpayKeyId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("Razorpay create-order error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create Razorpay order.",
      },
      { status: 500 },
    );
  }
}
