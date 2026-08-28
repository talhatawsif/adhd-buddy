"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Entry } from "@/lib/entries";

type Session = {
  id: string;
  entry_id: string | null;
  planned_minutes: number;
  actual_minutes: number | null;
  started_at: string;
  ended_at: string | null;
  notes: string | null;
};

type Phase = "idle" | "runway" | "active" | "logging";

const DURATIONS = [5, 15, 25, 45];
const RUNWAY_SECONDS = 5 * 60;

type FocusSessionProps = {
  userId: string;
  entries: Entry[];
  initialSessions: Session[];
};

export function FocusSession({
  userId,
  entries,
  initialSessions,
}: FocusSessionProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [plannedMinutes, setPlannedMinutes] = useState(25);
  const [selectedEntryId, setSelectedEntryId] = useState<string | "">("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [sessions, setSessions] = useState(initialSessions);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function startRunway() {
    setPhase("runway");
    setSecondsLeft(RUNWAY_SECONDS);
    clearTimer();
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearTimer();
          beginActive();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  function skipRunway() {
    clearTimer();
    beginActive();
  }

  function beginActive() {
    setPhase("active");
    setStartedAt(new Date());
    setSecondsLeft(plannedMinutes * 60);
    clearTimer();
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearTimer();
          endSession();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  function stopEarly() {
    clearTimer();
    endSession();
  }

  function endSession() {
    setPhase("logging");
  }

  async function saveSession() {
    if (!startedAt) return;
    const endedAt = new Date();
    const actualMinutes = Math.max(
      1,
      Math.round((endedAt.getTime() - startedAt.getTime()) / 60000),
    );

    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("sessions")
      .insert({
        user_id: userId,
        entry_id: selectedEntryId || null,
        planned_minutes: plannedMinutes,
        actual_minutes: actualMinutes,
        started_at: startedAt.toISOString(),
        ended_at: endedAt.toISOString(),
        notes: notes.trim() || null,
      })
      .select()
      .single();

    if (insertError || !data) {
      setError(insertError?.message ?? "Could not save session.");
      return;
    }

    setSessions((current) => [data as Session, ...current]);
    setPhase("idle");
    setNotes("");
    setSelectedEntryId("");
    setStartedAt(null);
  }

  function formatTime(totalSeconds: number) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const completedCount = sessions.filter((s) => s.ended_at).length;

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Focus Session</h2>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {phase === "idle" ? (
        <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <div>
            <p className="mb-2 text-sm text-zinc-500">Duration</p>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setPlannedMinutes(d)}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    plannedMinutes === d
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm text-zinc-500">Task (optional)</p>
            <select
              value={selectedEntryId}
              onChange={(e) => setSelectedEntryId(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700"
            >
              <option value="">No specific task</option>
              {entries.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.content.slice(0, 60)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={startRunway}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Start
          </button>
        </div>
      ) : null}

      {phase === "runway" ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-zinc-200 p-8 text-center dark:border-zinc-800">
          <p className="text-sm text-zinc-500">
            Just start. Five minutes, no pressure.
          </p>
          <p className="text-4xl font-semibold tabular-nums">
            {formatTime(secondsLeft)}
          </p>
          <button
            onClick={skipRunway}
            className="text-sm text-zinc-500 underline"
          >
            Skip and go straight to the timer
          </button>
        </div>
      ) : null}

      {phase === "active" ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-zinc-200 p-8 text-center dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Focusing</p>
          <p className="text-5xl font-semibold tabular-nums">
            {formatTime(secondsLeft)}
          </p>
          <button
            onClick={stopEarly}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
          >
            Stop
          </button>
        </div>
      ) : null}

      {phase === "logging" ? (
        <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm font-medium">What did you actually get done?</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional, but useful later"
            className="min-h-[80px] rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700"
            autoFocus
          />
          <button
            onClick={saveSession}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Save session
          </button>
        </div>
      ) : null}

      <div>
        <p className="mb-2 text-sm text-zinc-500">
          {completedCount} session{completedCount === 1 ? "" : "s"} completed
        </p>
        {sessions.length === 0 ? (
          <p className="text-sm text-zinc-500">No sessions yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sessions.slice(0, 10).map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
              >
                <span>
                  Planned {s.planned_minutes}m
                  {s.actual_minutes ? ` · Actual ${s.actual_minutes}m` : ""}
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date(s.started_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
