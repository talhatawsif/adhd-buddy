import type { Entry } from "@/lib/entries";

type SubtaskLite = {
  completed_at?: string | null;
};

type TaskTimelineProps = {
  entries: Entry[];
  subtasksByEntry: Record<string, SubtaskLite[]>;
};

function formatAbsolute(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDelta(fromIso: string, toIso: string): string {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  if (ms < 0) return "—";
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "moments later";
  if (minutes < 60) return `${minutes}m later`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (hours < 24) {
    return remMinutes > 0
      ? `${hours}h ${remMinutes}m later`
      : `${hours}h later`;
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d ${remHours}h later` : `${days}d later`;
}

function firstCompletedAt(subtasks: SubtaskLite[] | undefined): string | null {
  if (!subtasks || subtasks.length === 0) return null;
  const times = subtasks
    .map((s) => s.completed_at)
    .filter((t): t is string => !!t)
    .sort();
  return times[0] ?? null;
}

export function TaskTimeline({ entries, subtasksByEntry }: TaskTimelineProps) {
  const timelineEntries = entries
    .filter((e) => e.first_action_at)
    .sort((a, b) => (a.first_action_at! < b.first_action_at! ? 1 : -1))
    .slice(0, 5);

  if (timelineEntries.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div>
        <h2 className="text-lg font-semibold">Task Timeline</h2>
        <p className="text-sm text-zinc-500">
          How long each step actually took, from plan to finish.
        </p>
      </div>
      <ul className="flex flex-col gap-5">
        {timelineEntries.map((entry) => {
          const steps: {
            label: string;
            icon: string;
            timestamp: string | null;
          }[] = [
            { label: "Planned", icon: "📝", timestamp: entry.first_action_at },
            {
              label: "Started focusing",
              icon: "🎯",
              timestamp: entry.first_focus_started_at,
            },
            {
              label: "First step done",
              icon: "✅",
              timestamp: firstCompletedAt(subtasksByEntry[entry.id]),
            },
            { label: "Finished", icon: "🏁", timestamp: entry.finished_at },
          ];

          let previousTimestamp: string | null = null;

          return (
            <li key={entry.id} className="flex flex-col gap-2">
              <p className="text-sm font-medium">
                {entry.content.slice(0, 70)}
              </p>
              <ol className="flex flex-col gap-1.5 border-l border-zinc-200 pl-4 dark:border-zinc-800">
                {steps.map((step) => {
                  const reached = !!step.timestamp;
                  const display = reached
                    ? previousTimestamp
                      ? formatDelta(previousTimestamp, step.timestamp!)
                      : formatAbsolute(step.timestamp!)
                    : "Not yet";
                  if (reached) {
                    previousTimestamp = step.timestamp;
                  }
                  return (
                    <li
                      key={step.label}
                      className={`flex items-center gap-2 text-sm ${
                        reached
                          ? "text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-400 dark:text-zinc-600"
                      }`}
                    >
                      <span>{step.icon}</span>
                      <span className="w-28 shrink-0">{step.label}</span>
                      <span>{display}</span>
                    </li>
                  );
                })}
              </ol>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
