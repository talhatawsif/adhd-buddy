"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const supabase = createClient();
    const origin = window.location.origin;
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/confirm`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setPending(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setMessage("Check your email to confirm your account, then log in.");
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900"
          type="email"
          name="email"
          required
          autoComplete="email"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Password
        <input
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900"
          type="password"
          name="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <button
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {pending ? "Creating account…" : "Sign up"}
      </button>
    </form>
  );
}
