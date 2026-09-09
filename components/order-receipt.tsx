"use client";

import { pdf } from "@react-pdf/renderer";
import ReceiptDocument, {
  type ReceiptData,
} from "@/components/receipt-document";

type Props = {
  order: ReceiptData;
};

export default function OrderReceipt({ order }: Props) {
  async function handleDownload() {
    const blob = await pdf(
      <ReceiptDocument order={order} />
    ).toBlob();

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `B-Fresh-Order-${order.orderNumber}.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center rounded-xl border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
    >
      Download Receipt
    </button>
  );
}