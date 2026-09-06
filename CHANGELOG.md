# Changelog

All notable changes to ADHD Buddy are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/).

## [0.2.0] - 2026-09-06

### Added
- Time-to-initiation tracking: `first_action_at` (when a task is first
  categorized) and `first_focus_started_at` (when a focus session actually
  begins on that task).
- Per-step completion timestamps (`completed_at` on subtasks) and
  auto-completion (`finished_at` on the parent task once every step is
  checked).
- A per-task completion checkbox for solo tasks that never went through
  breakdown into subtasks.
- **Task Timeline** panel on the dashboard — four milestones (planned,
  started focusing, first step done, finished) shown with human-readable
  deltas ("20m later", "2d later") instead of raw timestamps, plus a total
  time summary once a task is fully done.
- Dedicated `/history` page showing the full timeline for every task, not
  just the five most recent shown on the dashboard.
- Persistent "← Dashboard" navigation link on every page except the
  dashboard itself.
- Delete controls for tasks and steps, each gated behind a confirmation
  prompt.

### Fixed
- Task Timeline now shows a clear explanation ("earlier than the previous
  step") instead of a bare dash when a step's timestamp is out of order.

## [0.1.0] - 2026-08-28

### Added
- Initial release: auth, quick capture with category sorting, manual task
  breakdown into subtasks, focus sessions with a 5-minute runway timer,
  focus streak tracking, and adaptive (backing-off) reminders.
- README, blog post on the adaptive reminder design, and debug history
  documentation.
