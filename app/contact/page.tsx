import Link from "next/link";

export const metadata = {
    title: "Contact Us | B-Fresh",
    description: "Contact B-Fresh for order and customer support.",
};

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-[#07140d]">
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">
                        B-Fresh Support
                    </p>

                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Contact Us
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-300">
                        We are here to help with your B-Fresh orders, deliveries, account,
                        and other questions.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-green-900 dark:bg-[#0b1c12]">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Order Support
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                            Need help with an existing order, delivery, or order status?
                            Visit your orders section to review your order information.
                        </p>

                        <Link
                            href="/orders"
                            className="mt-5 inline-block font-medium text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        >
                            View My Orders →
                        </Link>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-green-900 dark:bg-[#0b1c12]">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Account Support
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                            For account-related information, sign in and visit your account
                            page.
                        </p>

                        <Link
                            href="/account"
                            className="mt-5 inline-block font-medium text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        >
                            Go to My Account →
                        </Link>
                    </div>
                </div>

                <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-[#0b1c12]">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        General Enquiries
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                        For general enquiries, please use the official B-Fresh support
                        channel provided by the business. Contact details will be published
                        here once the official support information is finalized.
                    </p>
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