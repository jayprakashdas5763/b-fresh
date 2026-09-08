"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (signUpError) {
          throw new Error(signUpError.message);
        }

        setMessage(
          "Account created. Please check your email to confirm your account."
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
        throw new Error("Unable to sign in.");
      }

      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setLoading(true);
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Enter your email address first.");
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          }
        );

      if (resetError) {
        throw new Error(resetError.message);
      }

      setMessage(
        "Password reset instructions have been sent to your email."
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
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="text-center">
            <Link
              href="/"
              className="text-3xl font-bold tracking-tight text-gray-900"
            >
              B-Fresh
            </Link>

            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              {mode === "login"
                ? "Sign in to continue shopping."
                : "Create your B-Fresh customer account."}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
                setError("");
              }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                mode === "login"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setMessage("");
                setError("");
              }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                mode === "signup"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
          >
            {mode === "signup" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  placeholder="Your full name"
                  required
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  required
                  minLength={8}
                  autoComplete={
                    mode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 pr-20 text-gray-900 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="text-sm font-medium text-green-700 hover:text-green-800 disabled:opacity-50"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : mode === "signup"
                  ? "Create Account"
                  : "Login"}
            </button>
          </form>

          {message && (
            <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 border-t pt-6 text-center">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ← Back to Store
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}