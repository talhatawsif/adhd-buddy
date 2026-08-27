import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (data?.claims) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-medium text-zinc-500">ADHD Buddy</p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Capture thoughts. Break them down. Focus.
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        A small companion for dumping ideas, turning them into next actions, and
        actually sitting down to work.
      </p>
      {!hasSupabaseEnv() ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Add your Supabase URL and publishable key to{" "}
          <code className="font-mono">.env.local</code> before signing up.
        </p>
      ) : null}
      <div className="flex gap-3">
        <Link
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          href="/signup"
        >
          Sign up
        </Link>
        <Link
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
          href="/login"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}
