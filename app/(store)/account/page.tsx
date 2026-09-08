import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddressManager from "@/components/address-manager";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900">
          My Account
        </h1>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <p>
            <strong>Name:</strong>{" "}
            {profile?.full_name || "Customer"}
          </p>

          <p className="mt-2">
            <strong>Email:</strong> {user.email}
          </p>
        </div>

        <AddressManager />
      </div>
    </main>
  );
}