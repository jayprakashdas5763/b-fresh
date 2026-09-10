"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [checkingSession, setCheckingSession] =
    useState(true);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        setReady(true);
      } else {
        setError(
          "This password reset link is invalid or has expired."
        );
      }

      setCheckingSession(false);
    }

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (
          event === "PASSWORD_RECOVERY" &&
          session
        ) {
          setReady(true);
          setCheckingSession(false);
          setError("");
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setMessage(
        "Password updated successfully."
      );

      setPassword("");
      setConfirmPassword("");

      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#f4faef] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <Link
              href="/"
              className="inline-block text-3xl font-extrabold tracking-tight text-green-800"
            >
              B-Fresh
            </Link>

            <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-lime-400" />

            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Reset your password
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Create a new password for your B-Fresh
              account.
            </p>
          </div>

          {checkingSession ? (
            <div className="mt-6 rounded-2xl bg-[#f7fbf2] p-5 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-green-700 border-t-transparent" />
              <p className="mt-3 text-sm text-gray-600">
                Checking your password reset link...
              </p>
            </div>
          ) : ready ? (
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  New Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    minLength={8}
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 pr-20 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1 text-sm font-semibold text-green-700 hover:text-green-800"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>

                <p className="mt-1.5 text-xs text-gray-500">
                  Use at least 8 characters.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Confirm Password
                </label>

                <input
                  id="confirm-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  minLength={8}
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {message && (
                <div
                  role="status"
                  className="rounded-xl border border-green-100 bg-green-50 p-3 text-sm text-green-700"
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
              <p className="text-sm leading-6 text-red-700">
                {error}
              </p>

              <Link
                href="/auth"
                className="mt-4 inline-block text-sm font-semibold text-green-700 hover:text-green-800"
              >
                Request a new reset link
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/auth"
              className="text-sm font-semibold text-green-700 hover:text-green-800"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}