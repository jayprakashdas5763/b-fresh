"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(
          "This password reset link is invalid or has expired."
        );
        return;
      }

      setReady(true);
    }

    checkSession();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setMessage(
        "Password updated successfully. Redirecting..."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/account");
        router.refresh();
      }, 1200);
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
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="text-center">
            <Link
              href="/"
              className="text-3xl font-bold text-gray-900"
            >
              B-Fresh
            </Link>

            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Reset Password
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Create a new password for your account.
            </p>
          </div>

          {ready ? (
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  New Password
                </label>

                <div className="relative">
                  <input
                    type={
                      showPassword ? "text" : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    minLength={8}
                    required
                    className="w-full rounded-lg border border-gray-300 p-3 pr-20 text-gray-900 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>

                <input
                  type={
                    showPassword ? "text" : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  minLength={8}
                  required
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
              >
                {loading
                  ? "Updating..."
                  : "Update Password"}
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-600">
              {error ||
                "Checking your password reset link..."}
            </div>
          )}

          {message && (
            <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {message}
            </p>
          )}

          {error && ready && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/auth"
              className="text-sm font-medium text-green-700 hover:text-green-800"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}