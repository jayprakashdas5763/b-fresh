"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
    interface Window {
        Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

type RazorpayOptions = {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    theme?: {
        color?: string;
    };
    modal?: {
        ondismiss?: () => void;
    };
    handler: (response: RazorpayResponse) => void;
};

type RazorpayResponse = {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
};

type RazorpayInstance = {
    open: () => void;
};

type Props = {
    addressId: string;
    customerNote: string;
};

const RAZORPAY_SCRIPT_URL =
    "https://checkout.razorpay.com/v1/checkout.js";

function Spinner() {
    return (
        <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-green-700/30 border-t-green-700 dark:border-lime-300/30 dark:border-t-lime-300"
            aria-hidden="true"
        />
    );
}

export default function RazorpayCheckout({
    addressId,
    customerNote,
}: Props) {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [scriptReady, setScriptReady] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (window.Razorpay) {
            setScriptReady(true);
            return;
        }

        const existingScript = document.querySelector(
            `script[src="${RAZORPAY_SCRIPT_URL}"]`,
        );

        if (existingScript) {
            existingScript.addEventListener("load", () =>
                setScriptReady(true),
            );

            return () => {
                existingScript.removeEventListener("load", () =>
                    setScriptReady(true),
                );
            };
        }

        const script = document.createElement("script");
        script.src = RAZORPAY_SCRIPT_URL;
        script.async = true;

        script.onload = () => {
            setScriptReady(true);
        };

        script.onerror = () => {
            setError(
                "Unable to load secure payment checkout. Please try again.",
            );
        };

        document.body.appendChild(script);

        return () => {
            script.onload = null;
            script.onerror = null;
        };
    }, []);

    async function handlePayment() {
        if (!addressId) {
            setError("Please select a delivery address.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            if (!scriptReady || !window.Razorpay) {
                throw new Error(
                    "Payment checkout is still loading. Please try again in a moment.",
                );
            }

            const createResponse = await fetch(
                "/api/payments/razorpay/create-order",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        addressId,
                        customerNote,
                    }),
                },
            );

            const createData = await createResponse.json();

            if (!createResponse.ok) {
                throw new Error(
                    createData.error || "Unable to start online payment.",
                );
            }

            const razorpay = new window.Razorpay({
                key: createData.keyId,
                amount: createData.amount,
                currency: createData.currency,
                name: "B-Fresh",
                description: "Fresh food and everyday essentials",
                order_id: createData.razorpayOrderId,

                theme: {
                    color: "#15803d",
                },

                handler: async (response) => {
                    try {
                        setLoading(true);
                        setError("");

                        const verifyResponse = await fetch(
                            "/api/payments/razorpay/verify",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    addressId,
                                    customerNote,
                                    razorpayOrderId:
                                        response.razorpay_order_id,
                                    razorpayPaymentId:
                                        response.razorpay_payment_id,
                                    razorpaySignature:
                                        response.razorpay_signature,
                                }),
                            },
                        );

                        const verifyData = await verifyResponse.json();

                        if (!verifyResponse.ok) {
                            throw new Error(
                                verifyData.error ||
                                "Payment verification failed.",
                            );
                        }

                        if (!verifyData.orderId) {
                            throw new Error(
                                "Payment succeeded, but the B-Fresh order could not be created.",
                            );
                        }

                        router.push(`/orders/${verifyData.orderId}`);
                        router.refresh();
                    } catch (verificationError) {
                        setLoading(false);
                        setError(
                            verificationError instanceof Error
                                ? verificationError.message
                                : "Unable to verify your payment.",
                        );
                    }
                },

                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    },
                },
            });

            razorpay.open();
        } catch (paymentError) {
            setLoading(false);
            setError(
                paymentError instanceof Error
                    ? paymentError.message
                    : "Unable to start payment.",
            );
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={handlePayment}
                disabled={loading || !addressId}
                aria-busy={loading}
                className="group flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-green-700 px-5 text-sm font-black text-white shadow-lg shadow-green-800/10 transition duration-300 hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none dark:bg-lime-400 dark:text-green-950 dark:hover:bg-lime-300 dark:focus:ring-lime-900"
            >
                {loading ? (
                    <>
                        <Spinner />
                        <span>Preparing secure payment...</span>
                    </>
                ) : (
                    <>
                        <span>Pay securely online</span>
                        <span className="text-green-200 dark:text-green-900">
                            •
                        </span>
                        <span>Razorpay</span>
                    </>
                )}
            </button>

            {error && (
                <div
                    role="alert"
                    className="mt-3 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm leading-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                        !
                    </span>

                    <span>{error}</span>
                </div>
            )}

            <p className="mt-3 text-center text-[10px] font-medium leading-5 text-gray-400 dark:text-green-200/50">
                Secure payment powered by Razorpay. UPI, cards and
                supported online payment methods are handled securely.
            </p>
        </div>
    );
}