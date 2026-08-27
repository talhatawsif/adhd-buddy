import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  const label = data.user.email ?? data.user.id;

  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">ADHD Buddy</p>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Logged in as {label}
          </p>
        </div>
        <SignOutButton />
      </header>
      <section className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        Nothing here yet. Quick Capture comes in Phase 1.
      </section>
    </main>
  );
}
