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
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Admin Note
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Internal note for order handling and delivery.
      </p>

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={5}
        placeholder="Example: Call customer before delivery..."
        className="mt-4 w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
      />

      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          {message}
        </p>

        <button
          type="button"
          onClick={saveNote}
          disabled={saving}
          className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Note"}
        </button>
      </div>
    </section>
  );
}