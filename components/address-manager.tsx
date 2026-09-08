"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Address = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
};

export default function AddressManager() {
  const supabase = createClient();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [label, setLabel] = useState("Home");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Odisha");
  const [postalCode, setPostalCode] = useState("");

  async function loadAddresses() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("addresses")
      .select(
        `
          id,
          label,
          full_name,
          phone,
          address_line1,
          address_line2,
          landmark,
          city,
          state,
          postal_code,
          is_default
        `
      )
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setAddresses(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !addressLine1.trim() ||
      !city.trim() ||
      !postalCode.trim()
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    if (!/^\d{6}$/.test(postalCode.trim())) {
      setMessage("Please enter a valid 6-digit PIN code.");
      return;
    }

    setSaving(true);

    try {
      const { data: existingAddresses, error: existingError } =
        await supabase
          .from("addresses")
          .select("id")
          .limit(1);

      if (existingError) {
        throw new Error(existingError.message);
      }

      const shouldBeDefault = (existingAddresses?.length ?? 0) === 0;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to save an address.");
      }

      const { error } = await supabase.from("addresses").insert({
        user_id: user.id,
        label: label.trim() || "Home",
        full_name: fullName.trim(),
        phone: phone.trim(),
        address_line1: addressLine1.trim(),
        address_line2: addressLine2.trim() || null,
        landmark: landmark.trim() || null,
        city: city.trim(),
        state: state.trim() || "Odisha",
        postal_code: postalCode.trim(),
        is_default: shouldBeDefault,
      });

      if (error) {
        throw new Error(error.message);
      }

      setLabel("Home");
      setFullName("");
      setPhone("");
      setAddressLine1("");
      setAddressLine2("");
      setLandmark("");
      setCity("");
      setState("Odisha");
      setPostalCode("");

      setMessage("Address added successfully.");
      await loadAddresses();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save address."
      );
    } finally {
      setSaving(false);
    }
  }

  async function setDefaultAddress(id: string) {
    setMessage("");

    const { error: resetError } = await supabase
      .from("addresses")
      .update({ is_default: false })
      .neq("id", id);

    if (resetError) {
      setMessage(resetError.message);
      return;
    }

    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadAddresses();
  }

  async function deleteAddress(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Address deleted.");
    await loadAddresses();
  }

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-gray-900">
        Delivery Addresses
      </h2>

      <p className="mt-2 text-gray-600">
        Save your delivery addresses for faster checkout.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Add address */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            Add Address
          </h3>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <select
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            >
              <option>Home</option>
              <option>Work</option>
              <option>Other</option>
            </select>

            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            />

            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            />

            <input
              type="text"
              placeholder="Address line 1"
              value={addressLine1}
              onChange={(event) =>
                setAddressLine1(event.target.value)
              }
              required
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            />

            <input
              type="text"
              placeholder="Address line 2 (optional)"
              value={addressLine2}
              onChange={(event) =>
                setAddressLine2(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            />

            <input
              type="text"
              placeholder="Landmark (optional)"
              value={landmark}
              onChange={(event) => setLandmark(event.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
              />

              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={(event) => setState(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
              />
            </div>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit PIN code"
              value={postalCode}
              onChange={(event) =>
                setPostalCode(
                  event.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              required
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-green-700 px-5 py-3 font-medium text-white transition hover:bg-green-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Address"}
            </button>
          </form>

          {message && (
            <p className="mt-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-700">
              {message}
            </p>
          )}
        </div>

        {/* Saved addresses */}
        <div>
          {loading ? (
            <p className="text-gray-500">Loading addresses...</p>
          ) : addresses.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              <p className="text-gray-600">
                No saved addresses yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {address.label}
                        </h3>

                        {address.is_default && (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {address.full_name}
                        <br />
                        {address.address_line1}
                        {address.address_line2
                          ? `, ${address.address_line2}`
                          : ""}
                        {address.landmark
                          ? `, ${address.landmark}`
                          : ""}
                        <br />
                        {address.city}, {address.state} -{" "}
                        {address.postal_code}
                        <br />
                        Phone: {address.phone}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      {!address.is_default && (
                        <button
                          type="button"
                          onClick={() =>
                            setDefaultAddress(address.id)
                          }
                          className="text-sm font-medium text-green-700 hover:text-green-800"
                        >
                          Make default
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteAddress(address.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}