"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  orderId: string;
  initialNote: string | null;
};

export default function AdminOrderNotes({
  orderId,
  initialNote,
}: Props) {
  const supabase = createClient();

  const [note, setNote] = useState(initialNote ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveNote() {
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("orders")
      .update({
        admin_note: note.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Admin note saved.");
    }

    setSaving(false);
  }

  return (
    <section className="rounded-2xl border border-transparent bg-white p-6 shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Admin Note
      </h2>

      <p className="mt-1 text-sm text-gray-500 dark:text-green-200/70">
        Internal note for order handling and delivery.
      </p>

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={5}
        placeholder="Example: Call customer before delivery..."
        className="mt-4 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/60 dark:focus:border-lime-400 dark:focus:ring-green-950"
      />

      <div className="mt-3 flex items-center justify-between gap-4">
        <p
          className={`text-sm ${message
              ? "text-green-700 dark:text-lime-300"
              : "text-gray-600 dark:text-green-200/70"
            }`}
        >
          {message}
        </p>

        <button
          type="button"
          onClick={saveNote}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
        >
          {saving && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}

          {saving ? "Saving..." : "Save Note"}
        </button>
      </div>
    </section>
  );
}