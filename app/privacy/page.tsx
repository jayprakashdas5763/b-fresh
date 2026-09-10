import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for B-Fresh.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Last updated: September 10, 2026
        </p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-gray-700">
          <section>
            <h2 className="text-lg font-bold text-gray-950">
              1. Information We Collect
            </h2>
            <p className="mt-2">
              We may collect information such as your name, phone number,
              email address, delivery address, order information and account
              activity needed to provide B-Fresh services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950">
              2. How We Use Your Information
            </h2>
            <p className="mt-2">
              Information may be used to create and manage your account,
              process orders, arrange delivery, provide customer support,
              communicate order updates and improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950">
              3. Payments
            </h2>
            <p className="mt-2">
              Payment information may be processed by third-party payment
              providers when online payments are enabled. B-Fresh does not
              need to store your complete card credentials to provide the
              service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950">
              4. Data Security
            </h2>
            <p className="mt-2">
              We use reasonable technical and organizational measures to
              protect account and transaction information. No internet-based
              service can guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950">
              5. Data Sharing
            </h2>
            <p className="mt-2">
              Information may be shared with service providers where necessary
              to operate B-Fresh, such as infrastructure, email, payment and
              delivery services, subject to applicable requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950">
              6. Your Choices
            </h2>
            <p className="mt-2">
              You may review and update certain account information through
              your B-Fresh account. Requests regarding your personal
              information can be made through the available B-Fresh contact
              channels.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950">
              7. Policy Updates
            </h2>
            <p className="mt-2">
              This policy may be updated when our services or legal
              requirements change. The latest version will be published here.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950">
              8. Contact
            </h2>
            <p className="mt-2">
              For privacy-related questions or requests, please contact
              B-Fresh using the contact information provided on the website.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}