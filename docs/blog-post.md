# Why I made ADHD Buddy's reminders get *less* insistent, not more

Most apps handle a missed reminder the same way: repeat it. Same message,
same interval, again and again until you either do the thing or turn
notifications off entirely. For ADHD specifically, this tends to backfire —
identical repeated alerts are exactly the kind of pattern the brain learns
to tune out. The tenth "Do the thing!" notification gets dismissed as
reflexively as the second one, often without even reading it.

So when I built the reminder system for ADHD Buddy, I wanted to test a
different approach: reminders that back off instead of repeat.

## How it works

Each reminder starts at a 10-minute interval. If it's dismissed with
"remind me later," it doesn't just fire again in 10 minutes — it moves to
the next step in a fixed schedule: 10 minutes → 30 minutes → 1 hour → next
day. Every snooze pushes it further out, not just later by the same amount.

```
const BACKOFF = [10, 30, 60, 1440]; // minutes

async function snooze(reminder) {
  const nextIndex = Math.min(reminder.snooze_count + 1, BACKOFF.length - 1);
  const minutes = BACKOFF[nextIndex];
  const nextTrigger = new Date(Date.now() + minutes * 60000);
  // update next_trigger_at and increment snooze_count
}
```

The database side is simple: a `reminders` table with `next_trigger_at`,
`interval_minutes`, and `snooze_count`, scoped via Row Level Security through
the reminder's parent task rather than carrying its own `user_id` — since a
reminder only ever exists in relation to a task someone owns.

## Why this design, specifically

The goal wasn't to make the app less annoying for its own sake — it was to
test whether *changing* the reminder pattern actually holds attention better
than repeating it. A fixed-interval reminder becomes background noise fast;
a reminder that shows up at a different distance each time is harder to
pattern-match and dismiss without engaging with it.

There's a real cost to getting this wrong in either direction. Too
persistent, and it's ignored like everything else. Too permissive, and the
task quietly falls off the radar entirely (a `next_trigger_at` of "next day"
is already a compromise — a task that keeps getting punted a day at a time
needs a different intervention than a reminder anyway).

## What I'd build next

Right now this is in-app only — a banner shown when you open the dashboard,
not a push notification. That's a real limitation, not an oversight: iOS
Safari's PWA notification permissions are restrictive enough that reliable
push reminders would need a different approach (likely a native wrapper or
Android-first rollout) to work consistently. Worth being upfront about that
constraint rather than claiming push notifications that don't actually work
reliably across devices.

---

*ADHD Buddy is a small task-management tool I built end to end — Next.js,
Supabase (Postgres + Row Level Security), deployed on Vercel. Live at
[adhd-buddy.vercel.app](https://adhd-buddy.vercel.app).*
