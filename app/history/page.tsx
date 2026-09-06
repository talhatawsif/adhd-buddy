import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TaskTimeline } from "@/components/task-timeline";
import type { Entry } from "@/lib/entries";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  const { data: entriesData } = await supabase
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false });

  const initialEntries = (entriesData ?? []) as Entry[];

  const entryIds = initialEntries.map((e) => e.id);
  const initialSubtasks: Record<string, any[]> = {};

  if (entryIds.length > 0) {
    const { data: subtasksData } = await supabase
      .from("subtasks")
      .select("*")
      .in("entry_id", entryIds)
      .order("order", { ascending: true });

    for (const subtask of subtasksData ?? []) {
      if (!initialSubtasks[subtask.entry_id]) {
        initialSubtasks[subtask.entry_id] = [];
      }
      initialSubtasks[subtask.entry_id].push(subtask);
    }
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <header>
        <p className="text-sm text-zinc-500">ADHD Buddy</p>
        <h1 className="text-2xl font-semibold tracking-tight">Task History</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Every task you have planned, worked on, or finished.
        </p>
      </header>
      <TaskTimeline
        entries={initialEntries}
        subtasksByEntry={initialSubtasks}
        title="All Tasks"
        subtitle="Full history, most recently planned first."
      />
    </main>
  );
}
