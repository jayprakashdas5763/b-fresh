"use server";

import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail } from "@/lib/email";

type OrderItem = {
  product_name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export async function createOrderAction(
  addressId: string,
  customerNote: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in to place an order.");
  }

  if (!addressId) {
    throw new Error("Please select a delivery address.");
  }

  const { data: orderId, error: orderError } = await supabase.rpc(
    "create_order_from_cart",
    {
      p_address_id: addressId,
      p_customer_note: customerNote.trim() || null,
    }
  );

  if (orderError) {
    throw new Error(orderError.message);
  }

  if (!orderId) {
    throw new Error("Order could not be created.");
  }

  // Fetch the newly created order for the confirmation email.
  const { data: order, error: fetchOrderError } = await supabase
    .from("orders")
    .select(
      `
        id,
        order_number,
        payment_method,
        subtotal,
        delivery_fee,
        discount_amount,
        total_amount,
        shipping_full_name,
        shipping_address_line1,
        shipping_address_line2,
        shipping_landmark,
        shipping_city,
        shipping_state,
        shipping_postal_code,
        order_items (
          product_name,
          unit,
          quantity,
          unit_price,
          total_price
        )
      `
    )
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (fetchOrderError || !order) {
    console.error(
      "Order was created, but order details could not be fetched for email:",
      fetchOrderError
    );

    // The order itself was already successfully created.
    return orderId;
  }

  // Email is deliberately non-blocking.
  // If Resend fails, the customer's order must remain successful.
  if (user.email) {
    try {
      await sendOrderConfirmationEmail({
        to: user.email,
        orderNumber: order.order_number,
        customerName: order.shipping_full_name,
        items: (order.order_items ?? []) as OrderItem[],
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.delivery_fee),
        discountAmount: Number(order.discount_amount),
        totalAmount: Number(order.total_amount),
        paymentMethod: order.payment_method,
        addressLine1: order.shipping_address_line1,
        addressLine2: order.shipping_address_line2,
        landmark: order.shipping_landmark,
        city: order.shipping_city,
        state: order.shipping_state,
        postalCode: order.shipping_postal_code,
      });
    } catch (emailError) {
      console.error(
        `Order #${order.order_number} was created, but confirmation email failed:`,
        emailError
      );
    }
  }

  return orderId;
}