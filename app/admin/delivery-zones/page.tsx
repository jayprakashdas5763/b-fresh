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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

    const { error } = await supabase.from("delivery_zones").insert({
      name: name.trim(),
      postal_codes: cleanedPostalCodes,
      delivery_fee: fee,
      minimum_order_amount: minimum,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setName("");
      setPostalCodes("");
      setDeliveryFee("");
      setMinimumOrder("");

      setMessage("Delivery zone created successfully.");
      await loadZones();
    }

    setSaving(false);
  }

  async function toggleZone(zone: DeliveryZone) {
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

    await loadZones();
  }

  async function deleteZone(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this delivery zone?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("delivery_zones")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Delivery zone deleted.");
    await loadZones();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Delivery Zones
          </h1>

          <p className="mt-2 text-gray-600">
            Manage service areas, delivery charges, and minimum order values.
          </p>
        </div>

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-gray-900">
            Add Delivery Zone
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Zone name"
              required
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            />

            <input
              type="text"
              value={postalCodes}
              onChange={(event) => setPostalCodes(event.target.value)}
              placeholder="PIN codes, e.g. 751001, 751002, 751003"
              required
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={deliveryFee}
                onChange={(event) => setDeliveryFee(event.target.value)}
                placeholder="Delivery fee (₹)"
                required
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
              />

              <input
                type="number"
                min="0"
                step="0.01"
                value={minimumOrder}
                onChange={(event) => setMinimumOrder(event.target.value)}
                placeholder="Minimum order amount (₹)"
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-green-700 px-5 py-3 font-medium text-white transition hover:bg-green-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add Delivery Zone"}
            </button>
          </form>

          {message && (
            <p className="mt-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-700">
              {message}
            </p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-gray-900">
            Existing Zones
          </h2>

          {loading ? (
            <p className="text-gray-500">Loading delivery zones...</p>
          ) : zones.length === 0 ? (
            <p className="text-gray-500">
              No delivery zones created yet.
            </p>
          ) : (
            <div className="space-y-4">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {zone.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        PIN codes: {zone.postal_codes}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        Delivery fee: ₹
                        {Number(zone.delivery_fee).toFixed(2)}
                      </p>

                      <p className="text-sm text-gray-600">
                        Minimum order: ₹
                        {Number(zone.minimum_order_amount).toFixed(2)}
                      </p>

                      <span
                        className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          zone.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {zone.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleZone(zone)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      >
                        {zone.is_active ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteZone(zone.id)}
                        className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600"
                      >
                        Delete
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