import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin-shell";

export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth");
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (error || profile?.role !== "admin") {
        redirect("/account");
    }

    async function signOut() {
        "use server";

        const supabase = await createClient();

        await supabase.auth.signOut();

        redirect("/auth");
    }

    return (
        <AdminShell signOut={signOut}>
            {children}
        </AdminShell>
    );
}