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

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M20 10.2c0 5.2-8 10.8-8 10.8S4 15.4 4 10.2a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M7 3h3l1.5 4-2 1.5a14 14 0 0 0 6 6l1.5-2L21 14v3c0 1.1-.9 2-2 2C10.7 19 5 13.3 5 5a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export default function AddressManager() {
  const supabase = createClient();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingDefault, setUpdatingDefault] = useState<string | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [label, setLabel] = useState(emptyForm.label);
  const [fullName, setFullName] = useState(emptyForm.fullName);
  const [phone, setPhone] = useState(emptyForm.phone);
  const [addressLine1, setAddressLine1] = useState(
    emptyForm.addressLine1,
  );
  const [addressLine2, setAddressLine2] = useState(
    emptyForm.addressLine2,
  );
  const [landmark, setLandmark] = useState(emptyForm.landmark);
  const [city, setCity] = useState(emptyForm.city);
  const [state, setState] = useState(emptyForm.state);
  const [postalCode, setPostalCode] = useState(emptyForm.postalCode);

  function clearFeedback() {
    setMessage("");
    setError("");
  }

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
            `,
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
    setPhone(address.phone.replace(/\D/g, "").slice(0, 10));
    setAddressLine1(address.address_line1);
    setAddressLine2(address.address_line2 ?? "");
    setLandmark(address.landmark ?? "");
    setCity(address.city);
    setState(address.state);
    setPostalCode(address.postal_code);

    clearFeedback();

    document
      .getElementById("address-form")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    clearFeedback();

    const cleanFullName = fullName.trim();
    const cleanPhone = phone.replace(/\D/g, "");
    const cleanAddressLine1 = addressLine1.trim();
    const cleanAddressLine2 = addressLine2.trim();
    const cleanLandmark = landmark.trim();
    const cleanCity = city.trim();
    const cleanState = state.trim() || "Odisha";
    const cleanPostalCode = postalCode.replace(/\D/g, "");

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
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(cleanPostalCode)) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to manage addresses.");
      }

      // Verify delivery availability.
      const {
        data: deliveryZones,
        error: deliveryZoneError,
      } = await supabase
        .from("delivery_zones")
        .select("postal_codes")
        .eq("is_active", true);

      if (deliveryZoneError) {
        throw new Error(
          "Unable to verify delivery availability. Please try again.",
        );
      }

      const isDeliverable =
        deliveryZones?.some((zone) =>
          zone.postal_codes
            .split(",")
            .map((pin: string) => pin.trim())
            .includes(cleanPostalCode),
        ) ?? false;

      if (!isDeliverable) {
        throw new Error(
          "Sorry, B-Fresh does not currently deliver to this PIN code.",
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
          : "Unable to save address.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function setDefaultAddress(id: string) {
    clearFeedback();
    setUpdatingDefault(id);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in.");
      }

      const { error: resetError } = await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .neq("id", id);

      if (resetError) {
        throw new Error(resetError.message);
      }

      const { error: updateError } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setMessage("Default address updated.");
      await loadAddresses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the default address.",
      );
    } finally {
      setUpdatingDefault(null);
    }
  }

  async function deleteAddress(id: string) {
    const address = addresses.find((item) => item.id === id);

    if (!address) return;

    if (addresses.length === 1) {
      setError(
        "You cannot delete your only saved address. Add another address first.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete your ${address.label} address?`,
    );

    if (!confirmed) return;

    clearFeedback();
    setDeletingId(id);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in.");
      }

      const { error: deleteError } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      if (address.is_default) {
        const remainingAddress = addresses.find(
          (item) => item.id !== id,
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
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete address.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handlePhoneChange(value: string) {
    setPhone(value.replace(/\D/g, "").slice(0, 10));
  }

  function handlePostalCodeChange(value: string) {
    setPostalCode(value.replace(/\D/g, "").slice(0, 6));
  }

  return (
    <section className="mt-10">
      {/* Section intro */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800 dark:bg-green-950 dark:text-lime-300">
            <LocationIcon />
            Delivery
          </div>

          <h2 className="mt-3 text-2xl font-black tracking-tight text-gray-950 dark:text-white sm:text-3xl">
            Your addresses
          </h2>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-gray-500 dark:text-green-200/70">
            Save your delivery addresses for faster and easier
            checkout.
          </p>
        </div>

        {addresses.length > 0 && (
          <div className="rounded-2xl bg-green-50 px-4 py-2.5 text-xs font-semibold text-green-800 dark:bg-green-950 dark:text-lime-300">
            {addresses.length}{" "}
            {addresses.length === 1
              ? "saved address"
              : "saved addresses"}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* Address form */}
        <div
          id="address-form"
          className="scroll-mt-28 overflow-hidden rounded-3xl border border-green-100 bg-[#fffdf7] shadow-sm dark:border-green-900/70 dark:bg-green-950/70"
        >
          <div className="border-b border-green-100 bg-gradient-to-br from-green-50 to-lime-50 px-5 py-5 dark:border-green-900 dark:from-green-950 dark:to-[#102019] sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-green-700 dark:text-lime-300">
                  {editingId
                    ? "Update address"
                    : "New address"}
                </p>

                <h3 className="mt-1 text-xl font-black text-gray-950 dark:text-white">
                  {editingId
                    ? "Edit Address"
                    : "Add Address"}
                </h3>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl px-3 py-2 text-xs font-bold text-gray-600 transition hover:bg-white hover:text-gray-900 disabled:opacity-50 dark:text-green-200/70 dark:hover:bg-green-900 dark:hover:text-white"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 p-5 sm:p-6"
          >
            {/* Label */}
            <div>
              <label
                htmlFor="addressLabel"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-green-100"
              >
                Address Type
              </label>

              <select
                id="addressLabel"
                value={label}
                onChange={(event) =>
                  setLabel(event.target.value)
                }
                disabled={saving}
                className="w-full rounded-2xl border border-green-100 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition hover:border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-900 dark:bg-[#102019] dark:text-white dark:hover:border-green-700 dark:focus:border-lime-400 dark:focus:ring-green-950"
              >
                <option>Home</option>
                <option>Work</option>
                <option>Other</option>
              </select>
            </div>

            {/* Full name */}
            <div>
              <label
                htmlFor="addressFullName"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-green-100"
              >
                Full Name
              </label>

              <input
                id="addressFullName"
                type="text"
                placeholder="Name for delivery"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                maxLength={100}
                required
                disabled={saving}
                autoComplete="name"
                className="w-full rounded-2xl border border-green-100 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-900 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/60 dark:hover:border-green-700 dark:focus:border-lime-400 dark:focus:ring-green-950"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="addressPhone"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-green-100"
              >
                Phone Number
              </label>

              <div className="flex overflow-hidden rounded-2xl border border-green-100 bg-white transition hover:border-green-200 focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-100 dark:border-green-900 dark:bg-[#102019] dark:hover:border-green-700 dark:focus-within:border-lime-400 dark:focus-within:ring-green-950">
                <div className="flex items-center gap-1.5 border-r border-green-100 bg-green-50 px-3 text-sm font-bold text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-lime-300">
                  <PhoneIcon />
                  +91
                </div>

                <input
                  id="addressPhone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(event) =>
                    handlePhoneChange(
                      event.target.value,
                    )
                  }
                  maxLength={10}
                  required
                  disabled={saving}
                  autoComplete="tel"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed dark:text-white dark:placeholder:text-green-400/60"
                />
              </div>
            </div>

            {/* Address line 1 */}
            <div>
              <label
                htmlFor="addressLine1"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-green-100"
              >
                Address Line 1
              </label>

              <input
                id="addressLine1"
                type="text"
                placeholder="House / Flat / Street"
                value={addressLine1}
                onChange={(event) =>
                  setAddressLine1(event.target.value)
                }
                maxLength={200}
                required
                disabled={saving}
                autoComplete="street-address"
                className="w-full rounded-2xl border border-green-100 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-900 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/60 dark:hover:border-green-700 dark:focus:border-lime-400 dark:focus:ring-green-950"
              />
            </div>

            {/* Address line 2 */}
            <div>
              <label
                htmlFor="addressLine2"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-green-100"
              >
                Address Line 2{" "}
                <span className="font-normal normal-case text-gray-400">
                  (optional)
                </span>
              </label>

              <input
                id="addressLine2"
                type="text"
                placeholder="Apartment, area, locality"
                value={addressLine2}
                onChange={(event) =>
                  setAddressLine2(event.target.value)
                }
                maxLength={200}
                disabled={saving}
                className="w-full rounded-2xl border border-green-100 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-900 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/60 dark:hover:border-green-700 dark:focus:border-lime-400 dark:focus:ring-green-950"
              />
            </div>

            {/* Landmark */}
            <div>
              <label
                htmlFor="landmark"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-green-100"
              >
                Landmark{" "}
                <span className="font-normal normal-case text-gray-400">
                  (optional)
                </span>
              </label>

              <input
                id="landmark"
                type="text"
                placeholder="Nearby landmark"
                value={landmark}
                onChange={(event) =>
                  setLandmark(event.target.value)
                }
                maxLength={150}
                disabled={saving}
                className="w-full rounded-2xl border border-green-100 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-900 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/60 dark:hover:border-green-700 dark:focus:border-lime-400 dark:focus:ring-green-950"
              />
            </div>

            {/* City / State */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="city"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-green-100"
                >
                  City
                </label>

                <input
                  id="city"
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(event) =>
                    setCity(event.target.value)
                  }
                  maxLength={100}
                  required
                  disabled={saving}
                  autoComplete="address-level2"
                  className="w-full rounded-2xl border border-green-100 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-900 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/60 dark:hover:border-green-700 dark:focus:border-lime-400 dark:focus:ring-green-950"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-green-100"
                >
                  State
                </label>

                <input
                  id="state"
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(event) =>
                    setState(event.target.value)
                  }
                  maxLength={100}
                  required
                  disabled={saving}
                  autoComplete="address-level1"
                  className="w-full rounded-2xl border border-green-100 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-900 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/60 dark:hover:border-green-700 dark:focus:border-lime-400 dark:focus:ring-green-950"
                />
              </div>
            </div>

            {/* PIN */}
            <div>
              <label
                htmlFor="postalCode"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-green-100"
              >
                PIN Code
              </label>

              <input
                id="postalCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit PIN code"
                value={postalCode}
                onChange={(event) =>
                  handlePostalCodeChange(
                    event.target.value,
                  )
                }
                required
                disabled={saving}
                autoComplete="postal-code"
                className="w-full rounded-2xl border border-green-100 bg-white px-4 py-3 text-sm font-medium tracking-wide text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-900 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/60 dark:hover:border-green-700 dark:focus:border-lime-400 dark:focus:ring-green-950"
              />

              <p className="mt-1.5 text-xs text-gray-400 dark:text-green-200/50">
                We'll check whether B-Fresh delivers to this
                PIN.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-green-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-md disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 dark:bg-green-700 dark:hover:bg-green-600"
            >
              {saving ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  {editingId
                    ? "Updating address..."
                    : "Saving address..."}
                </>
              ) : editingId ? (
                "Update Address"
              ) : (
                "Save Address"
              )}
            </button>
          </form>

          {/* Feedback */}
          {message && (
            <div
              role="status"
              className="mx-5 mb-5 flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3.5 text-sm font-medium text-green-800 dark:border-green-900 dark:bg-green-950/50 dark:text-green-300 sm:mx-6"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs text-white dark:bg-green-700">
                ✓
              </span>
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mx-5 mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 sm:mx-6"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs text-white dark:bg-red-700">
                !
              </span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Saved addresses */}
        <div>
          {loading ? (
            <div className="rounded-3xl border border-green-100 bg-[#fffdf7] p-8 text-center shadow-sm dark:border-green-900/70 dark:bg-green-950/70">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-green-200 border-t-green-700 dark:border-green-800 dark:border-t-lime-300" />
              </div>

              <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-green-100">
                Loading your addresses...
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-green-200/60">
                Just a moment.
              </p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-green-200 bg-[#fffdf7] px-6 py-12 text-center shadow-sm dark:border-green-900 dark:bg-green-950/70">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-green-100 text-green-700 dark:bg-green-900 dark:text-lime-300">
                <LocationIcon />
              </div>

              <h3 className="mt-5 text-xl font-black text-gray-900 dark:text-white">
                No saved addresses yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:text-green-200/70">
                Add your first delivery address and your next
                B-Fresh checkout will be much faster.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <article
                  key={address.id}
                  className={`overflow-hidden rounded-3xl border bg-[#fffdf7] shadow-sm transition dark:bg-green-950/70 ${address.is_default
                      ? "border-green-200 shadow-green-900/5 dark:border-green-700"
                      : "border-green-100 hover:border-green-200 hover:shadow-md dark:border-green-900 dark:hover:border-green-700"
                    }`}
                >
                  {/* Card header */}
                  <div
                    className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${address.is_default
                        ? "border-green-100 bg-green-50/80 dark:border-green-900 dark:bg-green-950"
                        : "border-green-100 bg-white/60 dark:border-green-900 dark:bg-green-950/40"
                      }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${address.is_default
                            ? "bg-green-700 text-white"
                            : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-lime-300"
                          }`}
                      >
                        <HomeIcon />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black text-gray-900 dark:text-white">
                            {address.label}
                          </h3>

                          {address.is_default && (
                            <span className="rounded-full bg-green-700 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 text-xs text-gray-500 dark:text-green-200/60">
                          {address.city},{" "}
                          {address.state}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address body */}
                  <div className="p-5 sm:p-6">
                    <div className="rounded-2xl bg-green-50/60 p-4 dark:bg-green-900/30">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {address.full_name}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-green-100/80">
                        {address.address_line1}
                        {address.address_line2
                          ? `, ${address.address_line2}`
                          : ""}
                        {address.landmark
                          ? `, ${address.landmark}`
                          : ""}
                        <br />
                        {address.city},{" "}
                        {address.state} -{" "}
                        {address.postal_code}
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-green-200/70">
                        <PhoneIcon />
                        <span>
                          +91 {address.phone}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {!address.is_default && (
                        <button
                          type="button"
                          onClick={() =>
                            setDefaultAddress(
                              address.id,
                            )
                          }
                          disabled={
                            updatingDefault !==
                            null ||
                            deletingId !== null
                          }
                          className="rounded-xl bg-green-50 px-3.5 py-2.5 text-xs font-bold text-green-800 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-950 dark:text-lime-300 dark:hover:bg-green-900"
                        >
                          {updatingDefault ===
                            address.id
                            ? "Setting..."
                            : "Make Default"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          startEdit(address)
                        }
                        disabled={
                          updatingDefault !== null ||
                          deletingId !== null ||
                          saving
                        }
                        className="rounded-xl border border-green-100 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 transition hover:border-green-200 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-800 dark:bg-green-950/60 dark:text-green-100 dark:hover:border-green-700 dark:hover:bg-green-900"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteAddress(address.id)
                        }
                        disabled={
                          deletingId !== null ||
                          updatingDefault !== null ||
                          saving
                        }
                        className="rounded-xl border border-red-100 bg-white px-3.5 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/60"
                      >
                        {deletingId === address.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}