"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        // Give the browser time to persist the auth session
        // before navigating to the protected server page.
        router.push("/account");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        if (data.session) {
          router.push("/account");
          router.refresh();
        } else {
          setMessage(
            "Account created. Please check your email to confirm your account."
          );
        }
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-2 text-3xl font-bold">B-Fresh</h1>

        <p className="mb-6 text-gray-600">
          {isLogin ? "Welcome back." : "Create your B-Fresh account."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-lg border p-3"
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border p-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            className="w-full rounded-lg border p-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black p-3 text-white disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Login"
                : "Create account"}
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-lg bg-gray-100 p-3 text-sm">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            setIsLogin((value) => !value);
            setMessage("");
          }}
          className="mt-6 w-full text-sm underline"
        >
          {isLogin
            ? "Create a new account"
            : "Already have an account? Login"}
        </button>
      </div>
    </main>
  );
}