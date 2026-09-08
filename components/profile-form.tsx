"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileFormProps = {
    userId: string;
    initialFullName: string;
    initialPhone: string;
};

export default function ProfileForm({
    userId,
    initialFullName,
    initialPhone,
}: ProfileFormProps) {
    const supabase = createClient();

    const [fullName, setFullName] = useState(initialFullName);
    const [phone, setPhone] = useState(initialPhone);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setSaving(true);
        setMessage("");
        setError("");

        const cleanName = fullName.trim();
        const cleanPhone = phone.trim();

        if (!cleanName) {
            setError("Please enter your full name.");
            setSaving(false);
            return;
        }

        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                full_name: cleanName,
                phone: cleanPhone || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

        if (updateError) {
            setError(updateError.message);
        } else {
            setMessage("Profile updated successfully.");
        }

        setSaving(false);
    }

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
                <label
                    htmlFor="fullName"
                    className="mb-1 block text-sm font-medium text-gray-700"
                >
                    Full Name
                </label>

                <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your full name"
                    required
                    maxLength={100}
                    className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                />
            </div>

            <div>
                <label
                    htmlFor="phone"
                    className="mb-1 block text-sm font-medium text-gray-700"
                >
                    Phone Number
                </label>

                <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Your phone number"
                    maxLength={20}
                    autoComplete="tel"
                    className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                />
            </div>

            {message && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    {message}
                </div>
            )}

            {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {saving ? "Saving..." : "Save Profile"}
            </button>
        </form>
    );
}