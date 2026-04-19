create table if not exists scripts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'untitled script',
  trigger_type text not null default 'manual',
  trigger_config jsonb not null default '{}'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  last_run_at timestamptz,
  created_at timestamptz not null default now()
);

alter table scripts enable row level security;
create policy "users own scripts" on scripts for all using (auth.uid() = user_id);
