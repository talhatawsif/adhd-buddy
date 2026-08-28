create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  category text,
  created_at timestamptz not null default now()
);

create index entries_user_created_at_idx
  on public.entries (user_id, created_at desc);

alter table public.entries enable row level security;

create policy "Users can select their own entries"
  on public.entries
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own entries"
  on public.entries
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own entries"
  on public.entries
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own entries"
  on public.entries
  for delete
  to authenticated
  using (auth.uid() = user_id);

revoke all on table public.entries from anon, public;
grant select, insert, update, delete on table public.entries to authenticated;
grant all on table public.entries to service_role;
