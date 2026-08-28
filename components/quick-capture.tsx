"use client";

import { useState } from "react";
import {
  ENTRY_CATEGORIES,
  suggestCategory,
  type Entry,
  type EntryCategory,
} from "@/lib/entries";
import { createClient } from "@/lib/supabase/client";

type QuickCaptureProps = {
  userId: string;
  initialEntries: Entry[];
};

export function QuickCapture({ userId, initialEntries }: QuickCaptureProps) {
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState(initialEntries);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function capture(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || saving) {
      return;
    }

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
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <p className="whitespace-pre-wrap text-sm">{entry.content}</p>
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
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
