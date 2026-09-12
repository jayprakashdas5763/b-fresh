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
      setMessage("Your profile has been updated successfully.");
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full Name */}
      <div>
        <label
          htmlFor="fullName"
          className="mb-2 block text-sm font-bold text-gray-800 dark:text-green-100"
        >
          Full Name
        </label>

        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(event) =>
            setFullName(event.target.value)
          }
          placeholder="Enter your full name"
          autoComplete="name"
          required
          maxLength={100}
          className="w-full rounded-2xl border border-green-100 bg-[#fffdf7] px-4 py-3.5 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:border-green-900 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/60 dark:hover:border-green-700 dark:focus:border-lime-400 dark:focus:ring-green-950"
        />

        <p className="mt-1.5 text-xs text-gray-500 dark:text-green-200/60">
          Use the name you would like to use for your deliveries.
        </p>
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="mb-2 block text-sm font-bold text-gray-800 dark:text-green-100"
        >
          Phone Number
        </label>

        <div className="flex overflow-hidden rounded-2xl border border-green-100 bg-[#fffdf7] transition hover:border-green-200 focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-100 dark:border-green-900 dark:bg-[#102019] dark:hover:border-green-700 dark:focus-within:border-lime-400 dark:focus-within:ring-green-950">
          <div className="flex items-center border-r border-green-100 bg-green-50 px-3 text-sm font-bold text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-lime-300">
            +91
          </div>

          <input
            id="phone"
            type="tel"
            value={phone.replace(/^\+91\s?/, "")}
            onChange={(event) => {
              const digits = event.target.value
                .replace(/\D/g, "")
                .slice(0, 10);

              setPhone(
                digits
                  ? `+91${digits}`
                  : ""
              );
            }}
            placeholder="9876543210"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-green-400/60"
          />
        </div>

        <p className="mt-1.5 text-xs text-gray-500 dark:text-green-200/60">
          A valid mobile number helps with delivery updates.
        </p>
      </div>

      {/* Success */}
      {message && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3.5 text-sm font-medium text-green-800 dark:border-green-900 dark:bg-green-950/50 dark:text-green-300"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs text-white dark:bg-green-700">
            ✓
          </span>

          <span>{message}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs text-white dark:bg-red-700">
            !
          </span>

          <span>{error}</span>
        </div>
      )}

      {/* Save */}
      <button
        type="submit"
        disabled={saving}
        className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-green-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm dark:bg-green-700 dark:hover:bg-green-600"
      >
        {saving ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Saving changes...
          </>
        ) : (
          "Save Profile"
        )}
      </button>
    </form>
  );
}