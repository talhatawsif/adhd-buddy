import type { Entry } from "@/lib/entries";

type SubtaskLite = {
  completed_at?: string | null;
};

type TaskTimelineProps = {
  entries: Entry[];
  subtasksByEntry: Record<string, SubtaskLite[]>;
  limit?: number;
  title?: string;
  subtitle?: string;
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

function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "under a minute";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (hours < 24) {
    return remMinutes > 0 ? `${hours}h ${remMinutes}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
}

function firstCompletedAt(subtasks: SubtaskLite[] | undefined): string | null {
  if (!subtasks || subtasks.length === 0) return null;
  const times = subtasks
    .map((s) => s.completed_at)
    .filter((t): t is string => !!t)
    .sort();
  return times[0] ?? null;
}

export function TaskTimeline({
  entries,
  subtasksByEntry,
  limit,
  title = "Task Timeline",
  subtitle = "How long each step actually took, from plan to finish.",
}: TaskTimelineProps) {
  const sorted = entries
    .filter((e) => e.first_action_at)
    .sort((a, b) => (a.first_action_at! < b.first_action_at! ? 1 : -1));

  const timelineEntries =
    typeof limit === "number" ? sorted.slice(0, limit) : sorted;

  if (timelineEntries.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-zinc-500">{subtitle}</p>
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
              {entry.finished_at && entry.first_action_at ? (
                <p className="pl-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Total time:{" "}
                  {formatDuration(
                    new Date(entry.finished_at).getTime() -
                      new Date(entry.first_action_at).getTime(),
                  )}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
