"use client";

import { useState } from "react";
import {
  ENTRY_CATEGORIES,
  suggestCategory,
  type Entry,
  type EntryCategory,
} from "@/lib/entries";
import { createClient } from "@/lib/supabase/client";

type Subtask = {
  id: string;
  entry_id: string;
  content: string;
  is_done: boolean;
  order: number;
};

type QuickCaptureProps = {
  userId: string;
  initialEntries: Entry[];
  initialSubtasks: Record<string, Subtask[]>;
};

export function QuickCapture({
  userId,
  initialEntries,
  initialSubtasks,
}: QuickCaptureProps) {
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState(initialEntries);
  const [subtasksByEntry, setSubtasksByEntry] =
    useState<Record<string, Subtask[]>>(initialSubtasks);
  const [breakdownOpenFor, setBreakdownOpenFor] = useState<string | null>(
    null,
  );
  const [breakdownText, setBreakdownText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function capture(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    setError(null);
    setContent("");

    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("entries")
      .insert({
        user_id: userId,
        content: trimmed,
        category: suggestCategory(trimmed),
      })
      .select()
      .single();

    if (insertError || !data) {
      setContent(trimmed);
      setError(insertError?.message ?? "Could not save that thought.");
      setSaving(false);
      return;
    }

    setEntries((current) => [data as Entry, ...current]);
    setSaving(false);
  }

  async function setCategory(id: string, category: EntryCategory) {
    const previous = entries;
    setEntries((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, category } : entry,
      ),
    );

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("entries")
      .update({ category })
      .eq("id", id);

    if (updateError) {
      setEntries(previous);
      setError(updateError.message);
    }
  }

  function openBreakdown(entryId: string) {
    setBreakdownOpenFor(entryId);
    setBreakdownText("");
  }

  async function saveBreakdown(entryId: string) {
    const lines = breakdownText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    const supabase = createClient();
    const rows = lines.map((line, i) => ({
      entry_id: entryId,
      content: line,
      order: i,
    }));

    const { data, error: insertError } = await supabase
      .from("subtasks")
      .insert(rows)
      .select();

    if (insertError || !data) {
      setError(insertError?.message ?? "Could not save breakdown.");
      return;
    }

    setSubtasksByEntry((current) => ({
      ...current,
      [entryId]: [...(current[entryId] ?? []), ...(data as Subtask[])],
    }));
    setBreakdownOpenFor(null);
    setBreakdownText("");
  }

  async function toggleSubtask(entryId: string, subtask: Subtask) {
    const previous = subtasksByEntry;
    setSubtasksByEntry((current) => ({
      ...current,
      [entryId]: current[entryId].map((s) =>
        s.id === subtask.id ? { ...s, is_done: !s.is_done } : s,
      ),
    }));

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("subtasks")
      .update({ is_done: !subtask.is_done })
      .eq("id", subtask.id);

    if (updateError) {
      setSubtasksByEntry(previous);
      setError(updateError.message);
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <form onSubmit={capture} className="flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900"
          type="text"
          name="content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Dump a thought…"
          autoComplete="off"
          autoFocus
        />
        <button
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
          type="submit"
          disabled={saving || content.trim().length === 0}
        >
          Capture
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {entries.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing captured yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => {
            const subtasks = subtasksByEntry[entry.id] ?? [];
            return (
              <li
                key={entry.id}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <p className="whitespacpre-wrap text-sm">{entry.content}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ENTRY_CATEGORIES.map((category) => {
                    const selected = entry.category === category;
                    return (
                      <button
                        key={category}
                        className={`rounded-full border px-2.5 py-1 text-xs ${
                          selected
                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                            : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        }`}
                        type="button"
                        onClick={() => setCategory(entry.id, category)}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>

                {entry.category === "Needs breakdown" ? (
                  <div className="mt-3">
                    {subtasks.length === 0 && breakdownOpenFor !== entry.id ? (
                      <button
                        type="button"
                        onClick={() => openBreakdown(entry.id)}
                        className="text-xs font-medium text-zinc-600 underline dark:text-zinc-400"
                      >
                        Break this down
                      </button>
                    ) : null}

                    {breakdownOpenFor === entry.id ? (
                      <div className="mt-2 flex flex-col gap-2">
                        <textarea
                          value={breakdownText}
                          onChange={(e) => setBreakdownText(e.target.value)}
                          placeholder={"One step per line, e.g.\nOpen the doc\nWrite the first sentence\nSave and close"}
                          className="min-h-[100px] rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveBreakdown(entry.id)}
                            className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                          >
                            Save steps
                          </button>
                          <button
                            type="button"
                            onClick={() => setBreakdownOpenFor(null)}
                            className="text-xs text-zinc-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {subtasks.length > 0 ? (
                      <ul className="mt-2 flex flex-col gap-1.5">
                        {subtasks.map((subtask) => (
                          <li
                            key={subtask.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={subtask.is_done}
                              onChange={() => toggleSubtask(entry.id, subtask)}
                            />
                            <span
                              className={
                                subtask.is_done
                                  ? "text-zinc-400 line-through"
                                  : ""
                              }
                            >
                              {subtask.content}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
