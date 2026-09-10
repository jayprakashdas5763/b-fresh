import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using B-Fresh.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <article className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
        <Link
          href="/"
          className="text-sm font-semibold text-green-700 hover:text-green-800"
        >
          ← Back to B-Fresh
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-950">
          Terms & Conditions
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Last updated: September 10, 2026
        </p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-gray-700">
          <section>
            <h2 className="text-lg font-bold text-gray-950">
              1. About B-Fresh
            </h2>
            <p className="mt-2">
              B-Fresh provides fresh food, dairy products, groceries and
              everyday essentials for delivery to eligible locations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950">
              2. Accounts
            </h2>
            <p className="mt-2">
              You are responsible for providing accurate account information
              and for keeping your login credentials secure. You must notify
              B-Fresh if you believe your account has been used without
              authorization.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950">
              3. Orders and Pricing
            </h2>
            <p className="mt-2">
              Product availability, prices and delivery charges may change.
              An order is subject to availability and confirmation by
              B-Fresh.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950">
              4. Delivery
            </h2>
            <p className="mt-2">
              Delivery availability and charges depend on the delivery
              location and applicable delivery zone. Customers should provide
              accurate contact and delivery information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950">
              5. Cancellations and Refunds
            </h2>
            <p className="mt-2">
              Cancellation and refund eligibility depends on the order status,
              payment method and applicable B-Fresh policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950">
              6. Acceptable Use
            </h2>
            <p className="mt-2">
              You must not misuse the website, attempt unauthorized access,
              interfere with its operation, or use the service for unlawful
              purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950">
              7. Changes
            </h2>
            <p className="mt-2">
              B-Fresh may update these terms from time to time. Updated terms
              will be published on this page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950">
              8. Contact
            </h2>
            <p className="mt-2">
              For questions about these terms, please contact B-Fresh through
              the contact information provided on the website.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}