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

export default function CheckoutForm({ addresses }: Props) {
    const router = useRouter();
    const defaultAddress =
        addresses.find((address) => address.is_default) ?? addresses[0];

    const [selectedAddressId, setSelectedAddressId] = useState(
        defaultAddress?.id ?? ""
    );
    const [customerNote, setCustomerNote] = useState("");

    function selectAddress(id: string) {
        setSelectedAddressId(id);
        router.replace(`/checkout?address=${id}`);
    }

    return (
        <div className="space-y-6">
            {/* Delivery Address */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Delivery Address
                        </h2>

                        <p className="mt-1 text-sm text-gray-600">
                            Select where you want your order delivered.
                        </p>
                    </div>

                    <Link
                        href="/account"
                        className="text-sm font-medium text-green-700 hover:text-green-800"
                    >
                        Manage addresses
                    </Link>
                </div>

                {addresses.length > 0 ? (
                    <div className="mt-5 space-y-3">
                        {addresses.map((address) => {
                            const selected = selectedAddressId === address.id;

                            return (
                                <label
                                    key={address.id}
                                    className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition ${selected
                                        ? "border-green-600 bg-green-50"
                                        : "border-gray-200 hover:border-green-500"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="checkout-address"
                                        value={address.id}
                                        checked={selected}
                                        onChange={() => selectAddress(address.id)}
                                        className="mt-1"
                                    />

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-900">
                                                {address.label}
                                            </p>

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
                                            {address.landmark ? `, ${address.landmark}` : ""}
                                            <br />
                                            {address.city}, {address.state} -{" "}
                                            {address.postal_code}
                                            <br />
                                            Phone: {address.phone}
                                        </p>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-5 rounded-xl border border-dashed p-6 text-center">
                        <p className="text-gray-600">
                            You don't have a saved delivery address.
                        </p>

                        <Link
                            href="/account"
                            className="mt-4 inline-block rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
                        >
                            Add Address
                        </Link>
                    </div>
                )}
            </section>

            {/* Payment */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">
                    Payment Method
                </h2>

                <div className="mt-4 rounded-xl border border-green-600 bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                        <input
                            type="radio"
                            checked
                            readOnly
                            className="mt-1"
                        />

                        <div>
                            <p className="font-semibold text-gray-900">
                                Cash on Delivery
                            </p>

                            <p className="mt-1 text-sm text-gray-600">
                                Pay when your B-Fresh order is delivered.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Customer Note */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">
                    Delivery Instructions
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Add any instructions that may help us deliver your order.
                </p>

                <textarea
                    value={customerNote}
                    onChange={(event) => setCustomerNote(event.target.value)}
                    rows={4}
                    maxLength={500}
                    placeholder="Example: Please call before delivery."
                    className="mt-4 w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                />

                <p className="mt-2 text-right text-xs text-gray-500">
                    {customerNote.length}/500
                </p>
            </section>
            {/* Place order */}
            {addresses.length > 0 && (
                <PlaceOrderButton
                    addressId={selectedAddressId}
                    customerNote={customerNote}
                />
            )}
        </div>
    );
}