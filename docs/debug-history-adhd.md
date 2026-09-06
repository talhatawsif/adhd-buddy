# ADHD Buddy — Debug History

A record of real issues hit during the build, and how each was resolved.
Useful as interview material (shows actual troubleshooting, not just
following a tutorial) and as a reference if similar issues come up again.

---

## Pattern Summary

Of the issues below, more than half (paste/heredoc reliability + environment
config) came from the **terminal-only workflow** or **credential/environment
configuration** — not from logic errors in the application code itself. The core app logic (RLS policies,
React state management, timer logic, backoff scheduling) worked correctly on
the first or second real attempt each time it was tested.

**Takeaway for future work:** when something breaks, check paste integrity
and env var state before assuming the logic is wrong.

---

## Git & GitHub Auth

### 1. `git push` failed — "'origin' does not appear to be a git repository"
**Cause:** `git remote add origin <url>` had silently not taken effect on
the first attempt.
**Fix:** Re-ran `git remote add origin <url>`, verified with `git remote -v`
before retrying the push.

### 2. `git push` hung with no prompt, no error
**Cause:** Turned out to be a DNS resolution failure (`ping github.com`
returned "Unknown host"), not a git/auth issue — the terminal command was
silently failing to reach the network at all.
**Fix:** Switched from wifi to mobile hotspot, which resolved the DNS issue
immediately. (Considered switching DNS servers to 8.8.8.8/8.8.4.4 as an
alternative fix, not needed once on hotspot.)

### 3. GitHub push authentication — 403 error with a fine-grained token
**Cause:** GitHub no longer accepts account passwords for git over HTTPS,
and requires a Personal Access Token instead. The first token generated was
a **fine-grained** token, which needs explicit per-repo permission grants
and didn't have the right scope configured.
**Fix:** Generated a **classic** Personal Access Token instead, with the
`repo` scope checked — this worked immediately. (The original fine-grained
token was revoked once exposed in chat, for safety, and never reused.)
**Note:** macOS Keychain had also cached the old token after the swap;
cleared it with `git credential-osxkeychain erase` (host=github.com,
protocol=https) before the new token would be prompted for correctly.

---

## Terminal & Paste Reliability

### 4. Heredoc (`cat > file << 'EOF' ... EOF`) got stuck at a `heredoc>` prompt
**Cause:** A large paste got interrupted or didn't fully complete before
the closing `EOF` was reached, leaving the terminal waiting for more input.
Happened twice — once during `quick-capture.tsx`, once during
`focus-session.tsx`.
**Fix:** Typed `EOF` manually and pressed enter to close it out, then
verified the file's actual content with `cat` before continuing. In cases
where the paste was incomplete, cancelled with Ctrl+C and re-pasted the
entire block in one go.

### 5. Build error: "Module not found: Can't resolve '@/components/focus-session'"
**Cause:** The heredoc creating `focus-session.tsx` had failed/been
interrupted, so the file never actually existed on disk even though
`app/focus/page.tsx` already imported it.
**Fix:** Confirmed with `ls components/` that the file was missing, then
re-ran the full heredoc command in one clean paste.

### 6. Build error: "Expected '</', got 'ident'" in `quick-capture.tsx`
**Cause:** A single line got corrupted during a paste — a `?` character and
surrounding syntax were dropped, turning
`{error ? <p>...</p> : null}` into `{error <p>...</p> : null}`.
**Fix:** Located the exact broken line with
`sed -n '185,192p' components/quick-capture.tsx`, then fixed it directly
with a targeted `sed -i` replacement rather than re-pasting the whole file.

### 11. Multi-line `<a>` tag lost its opening `<a` during a large paste
**Cause:** A JSX `<a>` tag written across multiple lines — `<a` alone on its
own line, attributes on the following lines — had that opening `<a` line
silently dropped during a big multi-command paste, even though the rest of
the block landed fine. Confirmed with `grep -n '<a'` on the file, which came
back empty, ruling out a display-only issue.
**Fix:** Rewrote the tag as a single line
(`<a href="..." className="...">Text</a>`) going forward — that style
pasted reliably every time afterward. To repair the file that was already
corrupted, used base64 as a one-off recovery: `base64 -i file | tr -d '\n'`
to produce one unbreakable line, then `echo "<base64>" | base64 -d > file`
to write it back — a single line can't be broken by the line-based paste
issue the way multi-line content can.
**Note:** macOS's BSD `cat` doesn't support the `-A` flag (that's GNU-only);
used `grep -n` and `sed -n` to inspect file content precisely instead.

---

## Vercel Deployment & Environment Config

### 7. Vercel: live app showed "missing Supabase env var" banner after first deploy
**Cause:** Environment variables weren't added in Vercel before the first
deploy — the app builds and deploys fine, but reads `undefined` for the
Supabase URL/key at runtime.
**Fix:** Added the env vars in Vercel's project settings, then redeployed
(env var changes only apply to new deployments, not retroactively).

### 8. Vercel: "Remove the public framework prefix to keep this value private" warning blocked Save
**Cause:** Vercel warns whenever a `NEXT_PUBLIC_` prefixed variable is set
as "Secret" type, since public-prefixed variables are exposed to the
browser regardless — the Secret type doesn't make sense for them, and an
already-saved Secret variable can't be converted to Config afterward
("Saved secrets are write-only").
**Fix:** Deleted the stuck variable entirely and re-added it fresh, choosing
**Config** type from the start (not Secret) before the first save. Config is
correct for `NEXT_PUBLIC_` values since they're meant to be public anyway
(the Supabase anon/publishable key is designed to be public-facing).

---

## Local Dev Environment

### 9. `npm run dev` — "Port 3000 is in use by process ###"
**Cause:** A previous dev server instance was already running in another
terminal/window from earlier in the session.
**Fix:** No action needed — used the already-running server at
`localhost:3000` instead of starting a second one on 3001.

---

## App Behavior (Not Actually a Bug)

### 10. `Reminders` component not appearing after being wired into the dashboard
**Cause:** Not a real bug — the "Remind me" button and reminder banner
require an actual due reminder (`next_trigger_at` in the past) to display
anything; a freshly created reminder defaults 10 minutes in the future.
**Fix:** Manually edited `next_trigger_at` in Supabase's Table Editor to a
past timestamp to trigger and test the banner without waiting.
