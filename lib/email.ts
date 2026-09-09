import "server-only";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type OrderEmailItem = {
  product_name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type OrderConfirmationEmailData = {
  to: string;
  attachment?: Buffer;
  orderNumber: number;
  customerName: string;
  items: OrderEmailItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postalCode: string;
};

export async function sendOrderConfirmationEmail(
  data: OrderConfirmationEmailData,
) {
  const itemsHtml = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;">
            ${item.product_name}
            <br />
            <span style="color:#666;font-size:12px;">
              ${item.quantity} × ₹${Number(item.unit_price).toFixed(2)}
              ${item.unit ? ` / ${item.unit}` : ""}
            </span>
          </td>
          <td style="padding:8px 0;text-align:right;">
            ₹${Number(item.total_price).toFixed(2)}
          </td>
        </tr>
      `,
    )
    .join("");

  const addressParts = [
    data.addressLine1,
    data.addressLine2,
    data.landmark,
  ].filter(Boolean);

  const addressHtml = `
    ${addressParts.join(", ")}
    <br />
    ${data.city}, ${data.state} - ${data.postalCode}
  `;

  const { data: result, error } = await resend.emails.send({
    from: "B-Fresh <onboarding@resend.dev>",
    to: data.to,
    subject: `B-Fresh Order #${data.orderNumber} confirmed`,
    attachments: data.attachment
      ? [
          {
            filename: `B-Fresh-Order-${data.orderNumber}.pdf`,
            content: data.attachment,
          },
        ]
      : undefined,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#222;">
        <h1 style="color:#15803d;">B-Fresh</h1>

        <h2>Order Confirmed</h2>

        <p>
          Hi ${data.customerName},
        </p>

        <p>
          Thank you for your order. Your B-Fresh order
          <strong>#${data.orderNumber}</strong> has been received.
        </p>

        <h3>Order Details</h3>

        <table style="width:100%;border-collapse:collapse;">
          <tbody>
            ${itemsHtml}

            <tr>
              <td style="padding:8px 0;">Subtotal</td>
              <td style="padding:8px 0;text-align:right;">
                ₹${Number(data.subtotal).toFixed(2)}
              </td>
            </tr>

            <tr>
              <td style="padding:8px 0;">Delivery</td>
              <td style="padding:8px 0;text-align:right;">
                ₹${Number(data.deliveryFee).toFixed(2)}
              </td>
            </tr>

            <tr>
              <td style="padding:8px 0;">Discount</td>
              <td style="padding:8px 0;text-align:right;">
                ₹${Number(data.discountAmount).toFixed(2)}
              </td>
            </tr>

            <tr>
              <td style="padding:12px 0;border-top:1px solid #ddd;font-weight:bold;">
                Total
              </td>
              <td style="padding:12px 0;border-top:1px solid #ddd;text-align:right;font-weight:bold;">
                ₹${Number(data.totalAmount).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        <h3>Payment</h3>
        <p>
          ${
            data.paymentMethod === "cod"
              ? "Cash on Delivery"
              : data.paymentMethod
          }
        </p>

        <h3>Delivery Address</h3>
        <p>${addressHtml}</p>

        <p style="margin-top:32px;color:#666;font-size:13px;">
          Thank you for choosing B-Fresh.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }

  return result;
}
