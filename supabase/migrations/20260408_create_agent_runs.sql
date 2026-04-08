create extension if not exists pgcrypto;

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  agent_name text not null,
  input_data jsonb not null default '{}'::jsonb,
  output_data jsonb not null default '{}'::jsonb,
  timestamp timestamp with time zone not null default timezone('utc', now()),
  created_at timestamp with time zone not null default timezone('utc', now())
);

create index if not exists agent_runs_user_id_idx on public.agent_runs (user_id);
create index if not exists agent_runs_agent_name_idx on public.agent_runs (agent_name);
create index if not exists agent_runs_timestamp_idx on public.agent_runs (timestamp desc);

alter table public.agent_runs enable row level security;

create policy "Users can view their own agent runs"
on public.agent_runs
for select
using (auth.uid() = user_id);

create policy "Users can insert their own agent runs"
on public.agent_runs
for insert
with check (auth.uid() = user_id);
