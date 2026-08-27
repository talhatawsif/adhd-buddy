"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setPending(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
          autoComplete="current-password"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
