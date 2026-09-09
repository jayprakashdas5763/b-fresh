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

const emptyForm = {
  label: "Home",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "Odisha",
  postalCode: "",
};

export default function AddressManager() {
  const supabase = createClient();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [label, setLabel] = useState(emptyForm.label);
  const [fullName, setFullName] = useState(emptyForm.fullName);
  const [phone, setPhone] = useState(emptyForm.phone);
  const [addressLine1, setAddressLine1] = useState(
    emptyForm.addressLine1
  );
  const [addressLine2, setAddressLine2] = useState(
    emptyForm.addressLine2
  );
  const [landmark, setLandmark] = useState(emptyForm.landmark);
  const [city, setCity] = useState(emptyForm.city);
  const [state, setState] = useState(emptyForm.state);
  const [postalCode, setPostalCode] = useState(
    emptyForm.postalCode
  );

  function resetForm() {
    setLabel("Home");
    setFullName("");
    setPhone("");
    setAddressLine1("");
    setAddressLine2("");
    setLandmark("");
    setCity("");
    setState("Odisha");
    setPostalCode("");
    setEditingId(null);
  }

  async function loadAddresses() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAddresses([]);
      setError("You must be logged in to view your addresses.");
      setLoading(false);
      return;
    }

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
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setAddresses(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  function startEdit(address: Address) {
    setEditingId(address.id);
    setLabel(address.label);
    setFullName(address.full_name);
    setPhone(address.phone);
    setAddressLine1(address.address_line1);
    setAddressLine2(address.address_line2 ?? "");
    setLandmark(address.landmark ?? "");
    setCity(address.city);
    setState(address.state);
    setPostalCode(address.postal_code);

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    const cleanFullName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanAddressLine1 = addressLine1.trim();
    const cleanAddressLine2 = addressLine2.trim();
    const cleanLandmark = landmark.trim();
    const cleanCity = city.trim();
    const cleanState = state.trim() || "Odisha";
    const cleanPostalCode = postalCode.trim();

    if (
      !cleanFullName ||
      !cleanPhone ||
      !cleanAddressLine1 ||
      !cleanCity ||
      !cleanPostalCode
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError("Please enter a valid Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(cleanPostalCode)) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    const { data: deliveryZones, error: deliveryZoneError } =
      await supabase
        .from("delivery_zones")
        .select("postal_codes")
        .eq("is_active", true);

    if (deliveryZoneError) {
      setError("Unable to verify delivery availability. Please try again.");
      return;
    }

    const isDeliverable =
      deliveryZones?.some((zone) =>
        zone.postal_codes
          .split(",")
          .map((pin: string) => pin.trim())
          .includes(cleanPostalCode)
      ) ?? false;

    if (!isDeliverable) {
      setError(
        "Sorry, B-Fresh does not currently deliver to this PIN code."
      );
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "You must be logged in to manage addresses."
        );
      }

      if (editingId) {
        const { error: updateError } = await supabase
          .from("addresses")
          .update({
            label: label.trim() || "Home",
            full_name: cleanFullName,
            phone: cleanPhone,
            address_line1: cleanAddressLine1,
            address_line2: cleanAddressLine2 || null,
            landmark: cleanLandmark || null,
            city: cleanCity,
            state: cleanState,
            postal_code: cleanPostalCode,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .eq("user_id", user.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        setMessage("Address updated successfully.");
      } else {
        const shouldBeDefault = addresses.length === 0;

        const { error: insertError } = await supabase
          .from("addresses")
          .insert({
            user_id: user.id,
            label: label.trim() || "Home",
            full_name: cleanFullName,
            phone: cleanPhone,
            address_line1: cleanAddressLine1,
            address_line2: cleanAddressLine2 || null,
            landmark: cleanLandmark || null,
            city: cleanCity,
            state: cleanState,
            postal_code: cleanPostalCode,
            is_default: shouldBeDefault,
          });

        if (insertError) {
          throw new Error(insertError.message);
        }

        setMessage("Address added successfully.");
      }

      resetForm();
      await loadAddresses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save address."
      );
    } finally {
      setSaving(false);
    }
  }

  async function setDefaultAddress(id: string) {
    setMessage("");
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    const { error: resetError } = await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .neq("id", id);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Default address updated.");
    await loadAddresses();
  }

  async function deleteAddress(id: string) {
    const address = addresses.find(
      (item) => item.id === id
    );

    if (!address) return;

    if (addresses.length === 1) {
      setError(
        "You cannot delete your only saved address. Add another address first."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete your ${address.label} address?`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      setError(error.message);
      return;
    }

    if (address.is_default) {
      const remainingAddress = addresses.find(
        (item) => item.id !== id
      );

      if (remainingAddress) {
        await supabase
          .from("addresses")
          .update({ is_default: true })
          .eq("id", remainingAddress.id)
          .eq("user_id", user.id);
      }
    }

    setMessage("Address deleted.");
    await loadAddresses();
  }

  return (
    <section className="mt-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Delivery Addresses
        </h2>

        <p className="mt-2 text-gray-600">
          Save your delivery addresses for faster checkout.
        </p>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Address form */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? "Edit Address" : "Add Address"}
            </h3>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Cancel
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-5 space-y-4"
          >
            <select
              value={label}
              onChange={(event) =>
                setLabel(event.target.value)
              }
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
              onChange={(event) =>
                setFullName(event.target.value)
              }
              maxLength={100}
              required
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            />

            <input
              type="tel"
              inputMode="numeric"
              placeholder="10-digit phone number"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10)
                )
              }
              maxLength={10}
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
              maxLength={200}
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
              maxLength={200}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            />

            <input
              type="text"
              placeholder="Landmark (optional)"
              value={landmark}
              onChange={(event) =>
                setLandmark(event.target.value)
              }
              maxLength={150}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(event) =>
                  setCity(event.target.value)
                }
                maxLength={100}
                required
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
              />

              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={(event) =>
                  setState(event.target.value)
                }
                maxLength={100}
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
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              required
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-green-700 px-5 py-3 font-medium text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Address"
                  : "Save Address"}
            </button>
          </form>

          {message && (
            <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {message}
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        {/* Saved addresses */}
        <div>
          {loading ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">
                Loading addresses...
              </p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-white p-8 text-center">
              <p className="font-medium text-gray-900">
                No saved addresses yet.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Add your first delivery address using the form.
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
                      <div className="flex flex-wrap items-center gap-2">
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

                    <div className="flex flex-wrap gap-3">
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
                        onClick={() => startEdit(address)}
                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        Edit
                      </button>

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