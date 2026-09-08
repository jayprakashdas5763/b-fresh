import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">My Account</h1>

      <div className="mt-6 rounded-xl border p-6">
        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <p className="mt-2">
          <strong>User ID:</strong> {user.id}
        </p>
      </div>
    </main>
  );
}