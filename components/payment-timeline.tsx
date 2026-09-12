type PaymentEvent = {
    id: string;
    event_type: string;
    event_time: string;
    amount: number | null;
    currency: string | null;
    razorpay_payment_id: string | null;
    razorpay_order_id: string | null;
    razorpay_refund_id: string | null;
};

type Props = {
    events: PaymentEvent[];
};

function formatEventTitle(eventType: string) {
    switch (eventType) {
        case "payment.created":
            return "Payment created";

        case "payment.authorized":
            return "Payment authorized";

        case "payment.captured":
            return "Payment captured";

        case "payment.failed":
            return "Payment failed";

        case "order.paid":
            return "Payment confirmed";

        case "refund.requested":
            return "Refund requested";

        case "refund.processed":
            return "Refund processed";

        case "refund.failed":
            return "Refund failed";

        default:
            return eventType
                .replaceAll(".", " ")
                .replace(/\b\w/g, (char) => char.toUpperCase());
    }
}

function formatEventDate(value: string) {
    return new Date(value).toLocaleString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function isNegativeEvent(eventType: string) {
    return eventType === "payment.failed" ||
        eventType === "refund.failed";
}

function isRefundEvent(eventType: string) {
    return (
        eventType === "refund.requested" ||
        eventType === "refund.processed" ||
        eventType === "refund.failed"
    );
}

export default function PaymentTimeline({ events }: Props) {
    if (events.length === 0) {
        return (
            <div className="rounded-2xl bg-green-50/70 p-4 text-sm text-gray-500 dark:bg-green-900/40 dark:text-green-200/70">
                Payment activity will appear here once available.
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="space-y-0">
                {events.map((event, index) => {
                    const refund = isRefundEvent(event.event_type);
                    const negative = isNegativeEvent(event.event_type);
                    const last = index === events.length - 1;

                    return (
                        <div
                            key={event.id}
                            className="relative flex gap-4"
                        >
                            <div className="flex w-8 shrink-0 flex-col items-center">
                                <div
                                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${negative
                                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                            : refund
                                                ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                                                : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-lime-300"
                                        }`}
                                >
                                    {negative ? "!" : refund ? "↻" : "✓"}
                                </div>

                                {!last && (
                                    <div className="min-h-12 w-px bg-green-200 dark:bg-green-900" />
                                )}
                            </div>

                            <div className={`min-w-0 flex-1 ${last ? "pb-1" : "pb-6"}`}>
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                    <div>
                                        <p
                                            className={`text-sm font-black ${negative
                                                    ? "text-red-800 dark:text-red-300"
                                                    : refund
                                                        ? "text-purple-800 dark:text-purple-300"
                                                        : "text-gray-900 dark:text-white"
                                                }`}
                                        >
                                            {formatEventTitle(event.event_type)}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500 dark:text-green-200/60">
                                            {formatEventDate(event.event_time)}
                                        </p>
                                    </div>

                                    {event.amount !== null && (
                                        <p
                                            className={`text-sm font-black sm:text-right ${refund
                                                    ? "text-purple-700 dark:text-purple-300"
                                                    : "text-green-800 dark:text-lime-300"
                                                }`}
                                        >
                                            {refund ? "₹-" : "₹"}
                                            {Number(event.amount).toFixed(2)}
                                        </p>
                                    )}
                                </div>

                                {event.event_type === "payment.captured" && (
                                    <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-green-200/60">
                                        Your payment was successfully captured.
                                    </p>
                                )}

                                {event.event_type === "refund.requested" && (
                                    <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-green-200/60">
                                        Your refund request has been submitted and is
                                        being processed.
                                    </p>
                                )}

                                {event.event_type === "refund.processed" && (
                                    <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-green-200/60">
                                        The refund has been successfully processed.
                                    </p>
                                )}

                                {event.event_type === "refund.failed" && (
                                    <p className="mt-2 text-xs leading-5 text-red-600 dark:text-red-300">
                                        The refund could not be processed. Please contact
                                        B-Fresh support.
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}