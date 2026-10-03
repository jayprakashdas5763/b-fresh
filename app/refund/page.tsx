import Link from "next/link";

export const metadata = {
    title: "Refund Policy | B-Fresh",
    description: "B-Fresh refund and cancellation policy.",
};

export default function RefundPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-[#07140d]">
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">
                        B-Fresh Policies
                    </p>

                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Refund & Cancellation Policy
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-300">
                        Information about cancellations, refunds, and order-related
                        support.
                    </p>
                </div>

                <div className="mt-12 space-y-6">
                    <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-green-900 dark:bg-[#0b1c12]">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Refund Eligibility
                        </h2>

                        <p className="mt-3 leading-7 text-gray-600 dark:text-gray-300">
                            Refund eligibility depends on the status of the order, the
                            payment method used, and the applicable B-Fresh policies.
                        </p>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-green-900 dark:bg-[#0b1c12]">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Order Cancellation
                        </h2>

                        <p className="mt-3 leading-7 text-gray-600 dark:text-gray-300">
                            Cancellation requests are handled according to the current
                            status of the order and applicable B-Fresh policies. A
                            cancellation may not be possible once an order has progressed
                            beyond the applicable processing stage.
                        </p>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-green-900 dark:bg-[#0b1c12]">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Payment & Refund Processing
                        </h2>

                        <p className="mt-3 leading-7 text-gray-600 dark:text-gray-300">
                            Where a refund is applicable, the processing method and timing
                            may depend on the original payment method and the applicable
                            payment or banking service.
                        </p>
                    </section>

                    <section className="rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-[#0b1c12]">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Need Help?
                        </h2>

                        <p className="mt-3 leading-7 text-gray-600 dark:text-gray-300">
                            If you have a question about a specific order or refund, please
                            review your order information and contact B-Fresh support.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-4">
                            <Link
                                href="/orders"
                                className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-800"
                            >
                                View My Orders
                            </Link>

                            <Link
                                href="/contact"
                                className="rounded-lg border border-green-700 px-5 py-2.5 text-sm font-medium text-green-700 transition hover:bg-green-100 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </section>
                </div>

                <div className="mt-10 text-center">
                    <Link
                        href="/"
                        className="font-medium text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    >
                        ← Back to B-Fresh
                    </Link>
                </div>
            </div>
        </main>
    );
}