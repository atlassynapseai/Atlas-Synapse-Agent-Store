grant usage on schema public to authenticated, service_role;

grant select, insert on table public.agent_runs to authenticated;
grant all privileges on table public.agent_runs to service_role;

notify pgrst, 'reload schema';
