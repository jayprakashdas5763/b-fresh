"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
    const router = useRouter();

    const supabase = createClient();

    const [mode, setMode] = useState<"login" | "signup">("login");

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [fieldErrors, setFieldErrors] = useState<{
        fullName?: string;
        phone?: string;
        email?: string;
        password?: string;
    }>({});

    function clearMessages() {
        setMessage("");
        setError("");
        setFieldErrors({});
    }

    function switchMode(newMode: "login" | "signup") {
        setMode(newMode);
        clearMessages();
        setPassword("");
        setAcceptedTerms(false);
    }

    function validateForm() {
        const errors: typeof fieldErrors = {};

        if (mode === "signup") {
            const trimmedName = fullName.trim();

            if (!trimmedName) {
                errors.fullName = "Please enter your full name.";
            } else if (trimmedName.length < 2) {
                errors.fullName = "Please enter at least 2 characters.";
            }

            const phoneDigits = phone.replace(/\D/g, "");

            if (!phoneDigits) {
                errors.phone = "Please enter your mobile number.";
            } else if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
                errors.phone = "Enter a valid 10-digit Indian mobile number.";
            }
        }

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            errors.email = "Please enter your email address.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            errors.email = "Please enter a valid email address.";
        }

        if (!password) {
            errors.password = "Please enter your password.";
        } else if (password.length < 8) {
            errors.password = "Password must contain at least 8 characters.";
        }

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        clearMessages();

        if (!validateForm()) {
            return;
        }

        if (mode === "signup" && !acceptedTerms) {
            setError(
                "Please accept the Terms & Conditions and Privacy Policy to create your account."
            );
            return;
        }

        setLoading(true);

        try {
            if (mode === "signup") {
                const phoneDigits = phone.replace(/\D/g, "");

                const { error: signUpError } = await supabase.auth.signUp({
                    email: email.trim(),
                    password,
                    options: {
                        data: {
                            full_name: fullName.trim(),
                            phone: `+91${phoneDigits}`,
                        },
                    },
                });

                if (signUpError) {
                    throw new Error(signUpError.message);
                }

                setMessage(
                    "Your account has been created. Please check your email to verify your B-Fresh account."
                );

                setPassword("");
                return;
            }

            const { data, error: loginError } =
                await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                });

            if (loginError) {
                throw new Error(loginError.message);
            }

            if (!data.user) {
                throw new Error("Unable to sign in. Please try again.");
            }

            const params = new URLSearchParams(window.location.search);
            const requestedNext = params.get("next");

            const destination =
                requestedNext &&
                requestedNext.startsWith("/") &&
                !requestedNext.startsWith("//")
                    ? requestedNext
                    : "/account";

            router.push(destination);
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleForgotPassword() {
        setLoading(true);
        setMessage("");
        setError("");
        setFieldErrors({});

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setFieldErrors({
                email: "Enter your email address first.",
            });
            setLoading(false);
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setFieldErrors({
                email: "Please enter a valid email address.",
            });
            setLoading(false);
            return;
        }

        try {
            const { error: resetError } =
                await supabase.auth.resetPasswordForEmail(trimmedEmail, {
                    redirectTo: `${window.location.origin}/auth/reset-password`,
                });

            if (resetError) {
                throw new Error(resetError.message);
            }

            setMessage(
                "Password reset instructions have been sent to your email address."
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to send password reset email."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-green-50/70 via-white to-white px-4 py-10 transition-colors dark:from-[#0b1d13] dark:via-[#07140d] dark:to-[#07140d] sm:py-14">
            <div className="mx-auto w-full max-w-md">
                <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-900/5 transition-colors dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/20">
                    <div className="px-6 py-8 sm:px-8 sm:py-10">
                        {/* Brand */}
                        <div className="text-center">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 dark:focus:ring-lime-400 dark:focus:ring-offset-green-950"
                            >
                                <Image
                                    src="/icon-192.png"
                                    alt="B-Fresh"
                                    width={42}
                                    height={42}
                                    className="rounded-xl"
                                />

                                <span className="text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white">
                                    B-Fresh
                                </span>
                            </Link>

                            <h1 className="mt-7 text-2xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
                                {mode === "login"
                                    ? "Welcome back"
                                    : "Create your account"}
                            </h1>

                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-600 dark:text-gray-300">
                                {mode === "login"
                                    ? "Sign in to manage your orders and continue shopping."
                                    : "Join B-Fresh for fresh food, dairy and everyday essentials delivered to your doorstep."}
                            </p>
                        </div>

                        {/* Mode switcher */}
                        <div className="mt-7 rounded-xl bg-gray-100 p-1 dark:bg-green-900/60">
                            <div className="grid grid-cols-2 gap-1">
                                <button
                                    type="button"
                                    onClick={() => switchMode("login")}
                                    className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-1 dark:focus:ring-lime-400 ${
                                        mode === "login"
                                            ? "bg-white text-gray-950 shadow-sm dark:bg-green-800 dark:text-white"
                                            : "text-gray-600 hover:text-gray-900 dark:text-green-200 dark:hover:text-white"
                                    }`}
                                >
                                    Sign In
                                </button>

                                <button
                                    type="button"
                                    onClick={() => switchMode("signup")}
                                    className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-1 dark:focus:ring-lime-400 ${
                                        mode === "signup"
                                            ? "bg-white text-gray-950 shadow-sm dark:bg-green-800 dark:text-white"
                                            : "text-gray-600 hover:text-gray-900 dark:text-green-200 dark:hover:text-white"
                                    }`}
                                >
                                    Create Account
                                </button>
                            </div>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-7 space-y-5"
                            noValidate
                        >
                            {/* Full Name */}
                            {mode === "signup" && (
                                <div>
                                    <label
                                        htmlFor="full-name"
                                        className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200"
                                    >
                                        Full Name
                                    </label>

                                    <input
                                        id="full-name"
                                        type="text"
                                        value={fullName}
                                        onChange={(event) => {
                                            setFullName(event.target.value);

                                            if (fieldErrors.fullName) {
                                                setFieldErrors((current) => ({
                                                    ...current,
                                                    fullName: undefined,
                                                }));
                                            }
                                        }}
                                        placeholder="Enter your full name"
                                        autoComplete="name"
                                        aria-invalid={Boolean(
                                            fieldErrors.fullName
                                        )}
                                        aria-describedby={
                                            fieldErrors.fullName
                                                ? "full-name-error"
                                                : undefined
                                        }
                                        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:ring-2 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/70 ${
                                            fieldErrors.fullName
                                                ? "border-red-400 focus:border-red-500 focus:ring-red-100 dark:border-red-500/70 dark:focus:ring-red-950"
                                                : "border-gray-300 focus:border-green-600 focus:ring-green-100 dark:border-green-800 dark:focus:border-lime-400 dark:focus:ring-green-950"
                                        }`}
                                    />

                                    {fieldErrors.fullName && (
                                        <p
                                            id="full-name-error"
                                            className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400"
                                        >
                                            {fieldErrors.fullName}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Phone */}
                            {mode === "signup" && (
                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200"
                                    >
                                        Phone Number
                                    </label>

                                    <div
                                        className={`flex overflow-hidden rounded-xl border bg-white transition dark:bg-[#102019] ${
                                            fieldErrors.phone
                                                ? "border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 dark:border-red-500/70 dark:focus-within:ring-red-950"
                                                : "border-gray-300 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 dark:border-green-800 dark:focus-within:border-lime-400 dark:focus-within:ring-green-950"
                                        }`}
                                    >
                                        <div className="flex items-center border-r border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 dark:border-green-800 dark:bg-green-900/60 dark:text-green-100">
                                            +91
                                        </div>

                                        <input
                                            id="phone"
                                            type="tel"
                                            inputMode="numeric"
                                            value={phone}
                                            onChange={(event) => {
                                                const digits =
                                                    event.target.value
                                                        .replace(/\D/g, "")
                                                        .slice(0, 10);

                                                setPhone(digits);

                                                if (fieldErrors.phone) {
                                                    setFieldErrors((current) => ({
                                                        ...current,
                                                        phone: undefined,
                                                    }));
                                                }
                                            }}
                                            placeholder="10-digit mobile number"
                                            autoComplete="tel-national"
                                            maxLength={10}
                                            aria-invalid={Boolean(
                                                fieldErrors.phone
                                            )}
                                            aria-describedby={
                                                fieldErrors.phone
                                                    ? "phone-error"
                                                    : "phone-help"
                                            }
                                            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-gray-950 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-green-400/70"
                                        />
                                    </div>

                                    {fieldErrors.phone ? (
                                        <p
                                            id="phone-error"
                                            className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400"
                                        >
                                            {fieldErrors.phone}
                                        </p>
                                    ) : (
                                        <p
                                            id="phone-help"
                                            className="mt-1.5 text-xs text-gray-500 dark:text-gray-400"
                                        >
                                            Used for order updates and delivery
                                            communication.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200"
                                >
                                    Email Address
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);

                                        if (fieldErrors.email) {
                                            setFieldErrors((current) => ({
                                                ...current,
                                                email: undefined,
                                            }));
                                        }
                                    }}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    aria-invalid={Boolean(fieldErrors.email)}
                                    aria-describedby={
                                        fieldErrors.email
                                            ? "email-error"
                                            : undefined
                                    }
                                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:ring-2 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/70 ${
                                        fieldErrors.email
                                            ? "border-red-400 focus:border-red-500 focus:ring-red-100 dark:border-red-500/70 dark:focus:ring-red-950"
                                            : "border-gray-300 focus:border-green-600 focus:ring-green-100 dark:border-green-800 dark:focus:border-lime-400 dark:focus:ring-green-950"
                                    }`}
                                />

                                {fieldErrors.email && (
                                    <p
                                        id="email-error"
                                        className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400"
                                    >
                                        {fieldErrors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="mb-1.5 flex items-center justify-between gap-3">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                                    >
                                        Password
                                    </label>

                                    {mode === "login" && (
                                        <button
                                            type="button"
                                            onClick={handleForgotPassword}
                                            disabled={loading}
                                            className="text-xs font-semibold text-green-700 transition hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-lime-300 dark:hover:text-lime-200"
                                        >
                                            Forgot password?
                                        </button>
                                    )}
                                </div>

                                <div
                                    className={`relative rounded-xl border bg-white transition dark:bg-[#102019] ${
                                        fieldErrors.password
                                            ? "border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 dark:border-red-500/70 dark:focus-within:ring-red-950"
                                            : "border-gray-300 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 dark:border-green-800 dark:focus-within:border-lime-400 dark:focus-within:ring-green-950"
                                    }`}
                                >
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(event) => {
                                            setPassword(event.target.value);

                                            if (fieldErrors.password) {
                                                setFieldErrors((current) => ({
                                                    ...current,
                                                    password: undefined,
                                                }));
                                            }
                                        }}
                                        placeholder="Enter your password"
                                        required
                                        minLength={8}
                                        autoComplete={
                                            mode === "login"
                                                ? "current-password"
                                                : "new-password"
                                        }
                                        aria-invalid={Boolean(
                                            fieldErrors.password
                                        )}
                                        aria-describedby={
                                            fieldErrors.password
                                                ? "password-error"
                                                : mode === "signup"
                                                  ? "password-help"
                                                  : undefined
                                        }
                                        className="w-full rounded-xl bg-transparent px-4 py-3 pr-20 text-sm text-gray-950 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-green-400/70"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (current) => !current
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-600 dark:text-green-200 dark:hover:bg-green-900 dark:hover:text-white dark:focus:ring-lime-400"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>

                                {fieldErrors.password ? (
                                    <p
                                        id="password-error"
                                        className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400"
                                    >
                                        {fieldErrors.password}
                                    </p>
                                ) : mode === "signup" ? (
                                    <p
                                        id="password-help"
                                        className="mt-1.5 text-xs text-gray-500 dark:text-gray-400"
                                    >
                                        Use at least 8 characters for your
                                        password.
                                    </p>
                                ) : null}
                            </div>

                            {/* Terms */}
                            {mode === "signup" && (
                                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 dark:border-green-800 dark:bg-green-900/40">
                                    <div className="flex items-start gap-3">
                                        <input
                                            id="terms"
                                            type="checkbox"
                                            checked={acceptedTerms}
                                            onChange={(event) => {
                                                setAcceptedTerms(
                                                    event.target.checked
                                                );

                                                if (event.target.checked) {
                                                    setError("");
                                                }
                                            }}
                                            className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-green-700 focus:ring-2 focus:ring-green-600 dark:border-green-700 dark:bg-green-950 dark:focus:ring-lime-400"
                                        />

                                        <label
                                            htmlFor="terms"
                                            className="text-xs leading-5 text-gray-600 dark:text-gray-300"
                                        >
                                            I agree to the{" "}
                                            <Link
                                                href="/terms"
                                                target="_blank"
                                                className="font-semibold text-green-700 hover:text-green-800 dark:text-lime-300 dark:hover:text-lime-200"
                                            >
                                                Terms & Conditions
                                            </Link>{" "}
                                            and{" "}
                                            <Link
                                                href="/privacy"
                                                target="_blank"
                                                className="font-semibold text-green-700 hover:text-green-800 dark:text-lime-300 dark:hover:text-lime-200"
                                            >
                                                Privacy Policy
                                            </Link>
                                            .
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-700/15 transition hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-green-700 dark:hover:bg-green-600 dark:focus:ring-lime-400 dark:focus:ring-offset-green-950"
                            >
                                {loading && (
                                    <span
                                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                                        aria-hidden="true"
                                    />
                                )}

                                {loading
                                    ? "Please wait..."
                                    : mode === "signup"
                                      ? "Create Account"
                                      : "Sign In"}
                            </button>
                        </form>

                        {mode === "signup" && (
                            <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-300">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => switchMode("login")}
                                    className="font-semibold text-green-700 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 dark:text-lime-300 dark:hover:text-lime-200 dark:focus:ring-lime-400 dark:focus:ring-offset-green-950"
                                >
                                    Sign in
                                </button>
                            </p>
                        )}

                        {/* Messages */}
                        {message && (
                            <div
                                role="status"
                                className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/70"
                            >
                                <p className="text-sm font-medium leading-6 text-green-800 dark:text-green-200">
                                    {message}
                                </p>
                            </div>
                        )}

                        {error && (
                            <div
                                role="alert"
                                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/60"
                            >
                                <p className="text-sm font-medium leading-6 text-red-700 dark:text-red-300">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-7 border-t border-gray-200 pt-6 text-center dark:border-green-900">
                            <Link
                                href="/"
                                className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-600 dark:text-gray-300 dark:hover:bg-green-900/60 dark:hover:text-white dark:focus:ring-lime-400"
                            >
                                ← Back to Store
                            </Link>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 bg-gray-50/70 px-6 py-4 text-center dark:border-green-900 dark:bg-green-900/30 sm:px-8">
                        <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
                            Your information is used to manage your B-Fresh
                            account, orders and delivery.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}