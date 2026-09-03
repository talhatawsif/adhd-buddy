export const ENTRY_CATEGORIES = [
  "Urgent",
  "Someday",
  "Needs breakdown",
] as const;

export type EntryCategory = (typeof ENTRY_CATEGORIES)[number];

export type Entry = {
  id: string;
  user_id: string;
  content: string;
  category: string | null;
  created_at: string;
  first_action_at: string | null;
};

const urgentHints = [
  "deadline",
  "due",
  "asap",
  "urgent",
  "today",
  "tomorrow",
];

const breakdownHints = ["figure out", "plan", "somehow", "maybe", "should"];

export function suggestCategory(content: string): EntryCategory | null {
  const lower = content.toLowerCase();
  if (urgentHints.some((hint) => lower.includes(hint))) {
    return "Urgent";
  }
  if (breakdownHints.some((hint) => lower.includes(hint))) {
    return "Needs breakdown";
  }
  return null;
}
