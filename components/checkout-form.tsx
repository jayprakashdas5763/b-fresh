"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PlaceOrderButton from "@/components/place-order-button";

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

type Props = {
    addresses: Address[];
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

function CashIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <rect x="3" y="6" width="18" height="12" rx="2" />
            <circle cx="12" cy="12" r="2.5" />
            <path d="M7 9h.01M17 15h.01" />
        </svg>
    );
}

function NoteIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <path d="M5 4h14v16H5z" />
            <path d="M8 8h8" />
            <path d="M8 12h8" />
            <path d="M8 16h5" />
        </svg>
    );
}

export default function CheckoutForm({ addresses }: Props) {
    const router = useRouter();

    const defaultAddress =
        addresses.find((address) => address.is_default) ??
        addresses[0];

    const [selectedAddressId, setSelectedAddressId] = useState(
        defaultAddress?.id ?? "",
    );

    const [customerNote, setCustomerNote] = useState("");

    function selectAddress(id: string) {
        setSelectedAddressId(id);
        router.replace(`/checkout?address=${id}`);
    }

    return (
        <div className="space-y-5">
            {/* DELIVERY ADDRESS */}
            <section className="overflow-hidden rounded-[2rem] border border-green-100 bg-[#fffdf7] shadow-sm dark:border-green-900/70 dark:bg-green-950/70">
                <div className="border-b border-green-100 bg-gradient-to-r from-green-50 to-lime-50 px-5 py-5 dark:border-green-900 dark:from-green-950 dark:to-[#102019] sm:px-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-white shadow-sm">
                                <LocationIcon />
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-green-700 dark:text-lime-300">
                                    Step 1
                                </p>

                                <h2 className="mt-1 text-xl font-black text-gray-950 dark:text-white">
                                    Delivery address
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-green-200/70">
                                    Choose where you'd like your fresh order
                                    delivered.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/account"
                            className="inline-flex w-fit items-center rounded-full bg-white px-4 py-2 text-xs font-bold text-green-800 shadow-sm ring-1 ring-green-100 transition hover:bg-green-50 dark:bg-green-950 dark:text-lime-300 dark:ring-green-800 dark:hover:bg-green-900"
                        >
                            Manage addresses →
                        </Link>
                    </div>
                </div>

                <div className="p-5 sm:p-7">
                    {addresses.length > 0 ? (
                        <div className="space-y-3">
                            {addresses.map((address) => {
                                const selected =
                                    selectedAddressId === address.id;

                                return (
                                    <label
                                        key={address.id}
                                        className={`relative flex cursor-pointer gap-3 rounded-2xl border p-4 transition sm:p-5 ${selected
                                                ? "border-green-500 bg-green-50 shadow-sm shadow-green-900/5 dark:border-lime-500 dark:bg-green-900/40"
                                                : "border-green-100 bg-white hover:border-green-200 hover:bg-green-50/30 dark:border-green-900 dark:bg-green-950/40 dark:hover:border-green-700 dark:hover:bg-green-900/30"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="checkout-address"
                                            value={address.id}
                                            checked={selected}
                                            onChange={() =>
                                                selectAddress(address.id)
                                            }
                                            className="mt-1 h-4 w-4 shrink-0 accent-green-700"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-black text-gray-950 dark:text-white">
                                                    {address.label}
                                                </p>

                                                {address.is_default && (
                                                    <span className="rounded-full bg-green-100 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-green-800 dark:bg-green-950 dark:text-lime-300">
                                                        Default
                                                    </span>
                                                )}

                                                {selected && (
                                                    <span className="rounded-full bg-green-700 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white dark:bg-lime-400 dark:text-green-950">
                                                        Selected
                                                    </span>
                                                )}
                                            </div>

                                            <div
                                                className={`mt-3 rounded-xl p-3 text-xs leading-6 sm:p-4 sm:text-sm ${selected
                                                        ? "bg-white/80 dark:bg-[#102019]/80"
                                                        : "bg-green-50/50 dark:bg-green-900/30"
                                                    }`}
                                            >
                                                <p className="font-bold text-gray-900 dark:text-white">
                                                    {address.full_name}
                                                </p>

                                                <p className="mt-1 text-gray-600 dark:text-green-100/75">
                                                    {address.address_line1}
                                                    {address.address_line2
                                                        ? `, ${address.address_line2}`
                                                        : ""}
                                                    {address.landmark
                                                        ? `, ${address.landmark}`
                                                        : ""}
                                                </p>

                                                <p className="text-gray-600 dark:text-green-100/75">
                                                    {address.city},{" "}
                                                    {address.state} —{" "}
                                                    {address.postal_code}
                                                </p>

                                                <p className="mt-1 font-medium text-gray-500 dark:text-green-200/60">
                                                    +91 {address.phone}
                                                </p>
                                            </div>

                                            {selected && (
                                                <p className="mt-2 text-[11px] font-semibold text-green-700 dark:text-lime-300">
                                                    ✓ This address will be used
                                                    for delivery
                                                </p>
                                            )}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-green-200 bg-green-50/60 px-5 py-10 text-center dark:border-green-900 dark:bg-green-950/50">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm dark:bg-green-900">
                                📍
                            </div>

                            <h3 className="mt-4 font-black text-gray-950 dark:text-white">
                                No delivery address yet
                            </h3>

                            <p className="mt-1 text-sm text-gray-500 dark:text-green-200/70">
                                Add an address before placing your order.
                            </p>

                            <Link
                                href="/account"
                                className="mt-5 inline-flex min-h-11 items-center rounded-full bg-green-700 px-6 text-sm font-bold text-white transition hover:bg-green-800 dark:bg-green-700 dark:hover:bg-green-600"
                            >
                                Add address
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* PAYMENT */}
            <section className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-sm dark:border-green-900/70 dark:bg-green-950/70">
                <div className="border-b border-gray-100 px-5 py-5 dark:border-green-900 sm:px-7">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-50 text-green-800 dark:bg-lime-950 dark:text-lime-300">
                            <CashIcon />
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-green-700 dark:text-lime-300">
                                Step 2
                            </p>

                            <h2 className="mt-1 text-xl font-black text-gray-950 dark:text-white">
                                Payment method
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="p-5 sm:p-7">
                    <div className="rounded-2xl border border-green-400 bg-green-50/70 p-4 shadow-sm dark:border-green-700 dark:bg-green-950/50">
                        <div className="flex items-start gap-3">
                            <input
                                type="radio"
                                checked
                                readOnly
                                aria-label="Cash on Delivery"
                                className="mt-1 h-4 w-4 accent-green-700"
                            />

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-black text-gray-950 dark:text-white">
                                        Cash on Delivery
                                    </p>

                                    <span className="rounded-full bg-white px-2 py-1 text-[9px] font-black uppercase tracking-wider text-green-700 shadow-sm dark:bg-green-900 dark:text-lime-300">
                                        Available
                                    </span>
                                </div>

                                <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-green-100/70 sm:text-sm">
                                    Pay when your B-Fresh order arrives at your
                                    doorstep.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DELIVERY NOTE */}
            <section className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-sm dark:border-green-900/70 dark:bg-green-950/70">
                <div className="border-b border-gray-100 px-5 py-5 dark:border-green-900 sm:px-7">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <NoteIcon />
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-green-700 dark:text-lime-300">
                                Optional
                            </p>

                            <h2 className="mt-1 text-xl font-black text-gray-950 dark:text-white">
                                Delivery instructions
                            </h2>

                            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-green-200/70">
                                Help us make delivery easier with a quick note.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 sm:p-7">
                    <textarea
                        value={customerNote}
                        onChange={(event) =>
                            setCustomerNote(event.target.value)
                        }
                        rows={4}
                        maxLength={500}
                        placeholder="Example: Please call before delivery."
                        className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/60 dark:focus:border-lime-400 dark:focus:bg-green-950 dark:focus:ring-green-950"
                    />

                    <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-xs text-gray-400 dark:text-green-200/50">
                            You can leave this blank.
                        </p>

                        <p className="text-xs font-bold text-gray-400 dark:text-green-200/50">
                            {customerNote.length}/500
                        </p>
                    </div>
                </div>
            </section>

            {/* PLACE ORDER */}
            {addresses.length > 0 && (
                <div className="rounded-[2rem] border border-green-200 bg-gradient-to-br from-green-50 to-lime-50 p-4 shadow-sm dark:border-green-800 dark:from-green-950/70 dark:to-[#102019] sm:p-5">
                    <div className="mb-4 flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm dark:bg-green-900">
                            ✓
                        </div>

                        <div>
                            <p className="text-sm font-black text-green-950 dark:text-white">
                                Ready to place your order?
                            </p>

                            <p className="mt-0.5 text-xs leading-5 text-green-900/70 dark:text-green-100/65">
                                Your stock, delivery charge and order details
                                will be verified before the order is created.
                            </p>
                        </div>
                    </div>

                    <PlaceOrderButton
                        addressId={selectedAddressId}
                        customerNote={customerNote}
                    />
                </div>
            )}
        </div>
    );
}