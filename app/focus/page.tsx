import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FocusSession } from "@/components/focus-session";
import type { Entry } from "@/lib/entries";

export const dynamic = "force-dynamic";

export default async function FocusPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  const { data: entriesData } = await supabase
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: sessionsData } = await supabase
    .from("sessions")
    .select("*")
    .order("started_at", { ascending: false });

  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <div>
        <p className="text-sm text-zinc-500">ADHD Buddy</p>
        <h1 className="text-2xl font-semibold tracking-tight">Focus</h1>
      </div>
      <FocusSession
        userId={data.user.id}
        entries={(entriesData ?? []) as Entry[]}
        initialSessions={sessionsData ?? []}
      />
    </main>
  );
}
