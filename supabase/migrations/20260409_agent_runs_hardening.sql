alter table if exists public.agent_runs
  add column if not exists status text not null default 'success',
  add column if not exists duration_ms integer;

create index if not exists agent_runs_user_timestamp_idx
  on public.agent_runs (user_id, timestamp desc);

create index if not exists agent_runs_status_idx
  on public.agent_runs (status);
