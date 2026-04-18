-- ─── query history ─────────────────────────────────────────────────────────────
-- stores SQL queries run by the user for a given project

create table if not exists query_history (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  sql        text not null,
  source     text not null default 'manual'
    check (source in ('manual', 'ai')),
  ran_at     timestamptz not null default now()
);

alter table query_history enable row level security;

create policy "users own query_history"
  on query_history for all
  using (user_id = auth.uid());

create index query_history_project_idx on query_history (project_id, ran_at desc);
