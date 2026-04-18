-- ─── card configs for visualize tab ──────────────────────────────────────────
-- stores per-table field-mapping config for the pokemon card view

create table if not exists card_configs (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  table_name  text not null,
  config      jsonb not null default '{}',
  updated_at  timestamptz not null default now(),
  unique (project_id, table_name)
);

alter table card_configs enable row level security;

create policy "users own card_configs"
  on card_configs for all
  using (
    project_id in (select id from projects where user_id = auth.uid())
  );
