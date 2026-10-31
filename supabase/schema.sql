-- StudyFlow — database schema + Row Level Security
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- It is idempotent-ish: safe to re-run; drops and recreates the policies.

-- 1. Tasks table -------------------------------------------------------------
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) > 0),
  description text,
  due_date    date,
  priority    text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status      text not null default 'todo'   check (status   in ('todo', 'in_progress', 'done')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists tasks_user_created_idx
  on public.tasks (user_id, created_at desc);

-- 2. Row Level Security ------------------------------------------------------
-- This is what enforces data isolation (AC-04): every policy restricts rows to
-- the signed-in user via auth.uid(). Without RLS the Data API would expose all
-- rows to any authenticated client.
alter table public.tasks enable row level security;

drop policy if exists "tasks_select_own" on public.tasks;
drop policy if exists "tasks_insert_own" on public.tasks;
drop policy if exists "tasks_update_own" on public.tasks;
drop policy if exists "tasks_delete_own" on public.tasks;

create policy "tasks_select_own" on public.tasks
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "tasks_insert_own" on public.tasks
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- UPDATE needs both USING and WITH CHECK, otherwise a user could reassign a
-- row's user_id to someone else.
create policy "tasks_update_own" on public.tasks
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "tasks_delete_own" on public.tasks
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- 3. Keep updated_at fresh ---------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();
