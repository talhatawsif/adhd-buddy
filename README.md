# ADHD Buddy

Focus companion app: dump a thought, sort it later, break it into next actions, then sit down and work.

**Stack:** Next.js (App Router, TypeScript), Tailwind CSS, Supabase (Auth + Postgres), Vercel.

## Phase 0 status

Email/password sign-up, login, logout, and an empty dashboard. Quick Capture starts in Phase 1.

## Local setup

1. Copy env vars:

   ```bash
   cp .env.example .env.local
   ```

2. Create a free [Supabase](https://supabase.com) project (Sydney region). From **Project Settings → API**, paste:

   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Publishable key (or legacy anon key) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

3. In Supabase **Authentication → URL configuration**:

   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/confirm` (add the Vercel URL later)

4. For the fastest checkpoint, turn **off** “Confirm email” under **Authentication → Providers → Email** so a new user lands on the dashboard immediately.

5. Run the app:

   ```bash
   npm install
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000), sign up, log in, and confirm the dashboard shows **Logged in as** your email.

## Deploy

Connect this repo to Vercel. Add the same two `NEXT_PUBLIC_SUPABASE_*` env vars in the Vercel project, then add the production URL to Supabase redirect URLs (`https://your-app.vercel.app/auth/confirm`) and Site URL.
