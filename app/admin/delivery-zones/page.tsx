"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type DeliveryZone = {
  id: string;
  name: string;
  postal_codes: string;
  delivery_fee: number;
  minimum_order_amount: number;
  is_active: boolean;
  created_at: string;
};

export default function DeliveryZonesPage() {
  const supabase = createClient();

  const [zones, setZones] = useState<DeliveryZone[]>([]);

  const [name, setName] = useState("");
  const [postalCodes, setPostalCodes] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [minimumOrder, setMinimumOrder] = useState("");

  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionZoneId, setActionZoneId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function loadZones() {
    setLoading(true);

    const { data, error } = await supabase
      .from("delivery_zones")
      .select(
        "id, name, postal_codes, delivery_fee, minimum_order_amount, is_active, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setZones(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadZones();
  }, []);

  function resetForm() {
    setName("");
    setPostalCodes("");
    setDeliveryFee("");
    setMinimumOrder("");
    setEditingZoneId(null);
  }

  function startEditing(zone: DeliveryZone) {
    setEditingZoneId(zone.id);
    setName(zone.name);
    setPostalCodes(zone.postal_codes);
    setDeliveryFee(String(zone.delivery_fee));
    setMinimumOrder(String(zone.minimum_order_amount));
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Zone name is required.");
      return;
    }

    if (!postalCodes.trim()) {
      setMessage("At least one PIN code is required.");
      return;
    }

    const fee = Number(deliveryFee);
    const minimum = Number(minimumOrder || 0);

    if (!Number.isFinite(fee) || fee < 0) {
      setMessage("Enter a valid delivery fee.");
      return;
    }

    if (!Number.isFinite(minimum) || minimum < 0) {
      setMessage("Enter a valid minimum order amount.");
      return;
    }

    setSaving(true);

    const cleanedPostalCodes = postalCodes
      .split(",")
      .map((code) => code.trim())
      .filter(Boolean)
      .join(",");

    try {
      if (editingZoneId) {
        const { error } = await supabase
          .from("delivery_zones")
          .update({
            name: name.trim(),
            postal_codes: cleanedPostalCodes,
            delivery_fee: fee,
            minimum_order_amount: minimum,
          })
          .eq("id", editingZoneId);

        if (error) {
          setMessage(error.message);
          return;
        }

        setMessage("Delivery zone updated successfully.");
      } else {
        const { error } = await supabase
          .from("delivery_zones")
          .insert({
            name: name.trim(),
            postal_codes: cleanedPostalCodes,
            delivery_fee: fee,
            minimum_order_amount: minimum,
          });

        if (error) {
          setMessage(error.message);
          return;
        }

        setMessage("Delivery zone created successfully.");
      }

      resetForm();
      await loadZones();
    } finally {
      setSaving(false);
    }
  }

  async function toggleZone(zone: DeliveryZone) {
    if (actionZoneId) return;

    setActionZoneId(zone.id);
    setMessage("");

    try {
      const { error } = await supabase
        .from("delivery_zones")
        .update({
          is_active: !zone.is_active,
        })
        .eq("id", zone.id);

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(
        zone.is_active
          ? "Delivery zone deactivated."
          : "Delivery zone activated."
      );

      await loadZones();
    } finally {
      setActionZoneId(null);
    }
  }

  async function deleteZone(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this delivery zone?"
    );

    if (!confirmed || actionZoneId) return;

    setActionZoneId(id);
    setMessage("");

    try {
      const { error } = await supabase
        .from("delivery_zones")
        .delete()
        .eq("id", id);

      if (error) {
        setMessage(error.message);
        return;
      }

      if (editingZoneId === id) {
        resetForm();
      }

      setMessage("Delivery zone deleted.");
      await loadZones();
    } finally {
      setActionZoneId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 transition-colors dark:bg-[#07140d] md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Delivery Zones
          </h1>

          <p className="mt-2 text-gray-600 dark:text-green-200/70">
            Manage service areas, delivery charges, and minimum
            order values.
          </p>
        </div>

        {/* Add / Edit Delivery Zone */}
        <section className="mb-8 rounded-2xl border border-transparent bg-white p-6 shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingZoneId
                ? "Edit Delivery Zone"
                : "Add Delivery Zone"}
            </h2>

            {editingZoneId && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMessage("");
                }}
                className="text-sm font-semibold text-gray-600 transition hover:text-gray-900 dark:text-green-200/70 dark:hover:text-white"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Zone name"
              required
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/60 dark:focus:border-lime-400 dark:focus:ring-green-950"
            />

            <input
              type="text"
              value={postalCodes}
              onChange={(event) =>
                setPostalCodes(event.target.value)
              }
              placeholder="PIN codes, e.g. 751001, 751002, 751003"
              required
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/60 dark:focus:border-lime-400 dark:focus:ring-green-950"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={deliveryFee}
                onChange={(event) =>
                  setDeliveryFee(event.target.value)
                }
                placeholder="Delivery fee (₹)"
                required
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:focus:border-lime-400 dark:focus:ring-green-950"
              />

              <input
                type="number"
                min="0"
                step="0.01"
                value={minimumOrder}
                onChange={(event) =>
                  setMinimumOrder(event.target.value)
                }
                placeholder="Minimum order amount (₹)"
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/60 dark:focus:border-lime-400 dark:focus:ring-green-950"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 font-medium text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
              >
                {saving && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}

                {saving
                  ? editingZoneId
                    ? "Saving..."
                    : "Adding..."
                  : editingZoneId
                    ? "Save Changes"
                    : "Add Delivery Zone"}
              </button>

              {editingZoneId && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    resetForm();
                    setMessage("");
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-800 dark:bg-green-950/60 dark:text-green-100 dark:hover:bg-green-900"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {message && (
            <p className="mt-4 rounded-lg border border-gray-200 bg-gray-100 p-3 text-sm text-gray-700 dark:border-green-900 dark:bg-green-900/40 dark:text-green-100">
              {message}
            </p>
          )}
        </section>

        {/* Existing Zones */}
        <section className="rounded-2xl border border-transparent bg-white p-6 shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10">
          <h2 className="mb-5 text-xl font-semibold text-gray-900 dark:text-white">
            Existing Zones
          </h2>

          {loading ? (
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-green-200/70">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-700 dark:border-green-800 dark:border-t-lime-300" />
              Loading delivery zones...
            </div>
          ) : zones.length === 0 ? (
            <p className="text-gray-500 dark:text-green-200/70">
              No delivery zones created yet.
            </p>
          ) : (
            <div className="space-y-4">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="rounded-xl border border-gray-200 p-5 transition-colors dark:border-green-900"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {zone.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600 dark:text-green-200/70">
                        PIN codes:{" "}
                        {zone.postal_codes}
                      </p>

                      <p className="mt-1 text-sm text-gray-600 dark:text-green-200/70">
                        Delivery fee: ₹
                        {Number(
                          zone.delivery_fee
                        ).toFixed(2)}
                      </p>

                      <p className="text-sm text-gray-600 dark:text-green-200/70">
                        Minimum order: ₹
                        {Number(
                          zone.minimum_order_amount
                        ).toFixed(2)}
                      </p>

                      <span
                        className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${zone.is_active
                            ? "bg-green-100 text-green-700 dark:bg-green-950/70 dark:text-green-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                      >
                        {zone.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() =>
                          startEditing(zone)
                        }
                        disabled={
                          actionZoneId !== null ||
                          saving
                        }
                        className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/60"
                      >
                        Edit
                      </button>

                      {/* Activate / Deactivate */}
                      <button
                        type="button"
                        onClick={() =>
                          toggleZone(zone)
                        }
                        disabled={
                          actionZoneId !== null ||
                          saving
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-800 dark:bg-green-950/60 dark:text-green-100 dark:hover:bg-green-900"
                      >
                        {actionZoneId === zone.id ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700 dark:border-green-700 dark:border-t-lime-300" />
                            {zone.is_active
                              ? "Deactivating..."
                              : "Activating..."}
                          </span>
                        ) : zone.is_active ? (
                          "Deactivate"
                        ) : (
                          "Activate"
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() =>
                          deleteZone(zone.id)
                        }
                        disabled={
                          actionZoneId !== null ||
                          saving
                        }
                        className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/60"
                      >
                        {actionZoneId === zone.id ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-200 border-t-red-600 dark:border-red-900 dark:border-t-red-300" />
                            Deleting...
                          </span>
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}