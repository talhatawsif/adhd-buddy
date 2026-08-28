import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import { QuickCapture } from "@/components/quick-capture";
import type { Entry } from "@/lib/entries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  const label = data.user.email ?? data.user.id;

  const { data: entriesData } = await supabase
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false });

  const initialEntries = (entriesData ?? []) as Entry[];

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
      <QuickCapture userId={data.user.id} initialEntries={initialEntries} />
    </main>
  );
}
