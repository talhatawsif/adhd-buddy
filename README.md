# ADHD Buddy

Capture thoughts. Break them down. Focus.

A small companion app for ADHD task management, built around a specific idea:
the hard part usually isn't finishing a task, it's starting one. Every feature
here targets that initiation gap rather than the usual "keep the user on
task" approach most productivity apps take.

**Live:** https://adhd-buddy.vercel.app

## Why this exists

Most task apps assume the bottleneck is discipline or sustained focus. For
ADHD specifically, task initiation is a distinct and well-documented
executive-function challenge, separate from sustaining attention once
started. Every feature below was designed around that gap, not bolted on
after the fact.

## Features

- **Quick Capture** — zero-friction input, no forced categorization at the
  moment of capture. Sort later, not while the thought is still forming.
- **Task Breakdown** — manual-first: the user writes their own 3-5 concrete
  next steps. Grounded in behavioral activation, an established therapeutic
  technique of reducing a task to its smallest actionable unit to lower the
  barrier to starting. (AI-assisted suggestions are a natural next step, but
  manual-first was chosen deliberately, so the mechanism stays understandable
  rather than being outsourced entirely to a model from day one.)
- **Focus Sessions** — a 5-minute "runway" countdown before the timer starts,
  aimed at bypassing initiation friction rather than jumping straight into a
  potentially intimidating 25-minute block. Sessions log planned vs. actual
  time and end with a short "what did you actually get done" prompt.
- **Focus Streak** — rewards consistency (days with at least one completed
  session), deliberately not raw session length. A "longest session ever"
  leaderboard would gamify hyperfocus, which for ADHD specifically can mean
  skipped meals, meds, or transitions — a risk pattern, not something to
  reward.
- **Adaptive Reminders** — reminders that back off instead of repeating
  identically (10 min → 30 min → 1 hr → next day) when dismissed, to avoid
  the notification-blindness effect of standard nagging reminders.

## Data & Privacy

Every table is scoped with Postgres Row Level Security — a user can only
read or write their own rows, enforced at the database level, not just in
application code. Subtasks and reminders are scoped through their parent
entry's ownership rather than carrying their own `user_id`, since they only
ever exist in relation to an entry.

This project doesn't handle real patient data and makes no clinical claims.
The data model was designed with an awareness of Australian privacy
principles (the Privacy Act) as a general practice for anything touching
personal information, not because this qualifies as regulated health
software.

## Tech stack

Next.js (App Router, TypeScript), Tailwind CSS, Supabase (Auth + Postgres,
Row Level Security), deployed on Vercel.

## Status

All core phases (auth, capture, breakdown, focus sessions, adaptive
reminders) are built, deployed, and tested end-to-end in production.
