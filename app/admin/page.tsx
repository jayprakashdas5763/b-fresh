import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") {
    redirect("/account");
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">B-Fresh Admin</h1>

      <div className="mt-6 rounded-xl border p-6">
        <p>
          <strong>Name:</strong> {profile.full_name || "Admin"}
        </p>

        <p className="mt-2">
          <strong>Email:</strong> {user.email}
        </p>

        <p className="mt-2">
          <strong>Role:</strong> {profile.role}
        </p>
      </div>
    </main>
  );
}