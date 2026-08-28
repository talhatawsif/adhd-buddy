"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Reminder = {
  id: string;
  entry_id: string;
  next_trigger_at: string;
  interval_minutes: number;
  snooze_count: number;
  is_active: boolean;
};

type ReminderWithContent = Reminder & { entry_content: string };

const BACKOFF = [10, 30, 60, 1440];

export function Reminders({ userId }: { userId: string }) {
  const [due, setDue] = useState<ReminderWithContent[]>([]);

  async function loadDue() {
    const supabase = createClient();
    const { data } = await supabase
      .from("reminders")
      .select("*, entries(content)")
      .eq("is_active", true)
      .lte("next_trigger_at", new Date().toISOString())
      .order("next_trigger_at", { ascending: true });

    const mapped = (data ?? []).map((r: any) => ({
      ...r,
      entry_content: r.entries?.content ?? "Untitled task",
    }));
    setDue(mapped);
  }

  useEffect(() => {
    loadDue();
    const interval = setInterval(loadDue, 30000);
    return () => clearInterval(interval);
  }, []);

  async function markDone(id: string) {
    const supabase = createClient();
    await supabase.from("reminders").update({ is_active: false }).eq("id", id);
    setDue((current) => current.filter((r) => r.id !== id));
  }

  async function snooze(reminder: ReminderWithContent) {
    const nextIndex = Math.min(reminder.snooze_count + 1, BACKOFF.length - 1);
    const minutes = BACKOFF[nextIndex];
    const nextTrigger = new Date(Date.now() + minutes * 60000);

    const supabase = createClient();
    await supabase
      .from("reminders")
      .update({
        next_trigger_at: nextTrigger.toISOString(),
        snooze_count: reminder.snooze_count + 1,
      })
      .eq("id", reminder.id);

    setDue((current) => current.filter((r) => r.id !== reminder.id));
  }

  if (due.length === 0) return null;

  const top = due[0];

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm dark:border-amber-800 dark:bg-amber-950">
      <span className="text-amber-900 dark:text-amber-200">
        Still on your list: {top.entry_content}
      </span>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => snooze(top)}
          className="rounded-md border border-amber-400 px-2 py-1 text-xs text-amber-800 dark:border-amber-700 dark:text-amber-200"
        >
          Remind me later
        </button>
        <button
          onClick={() => markDone(top.id)}
          className="rounded-md bg-amber-900 px-2 py-1 text-xs text-white dark:bg-amber-200 dark:text-amber-950"
        >
          Done
        </button>
      </div>
    </div>
  );
}
