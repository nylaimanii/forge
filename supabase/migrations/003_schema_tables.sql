-- ─── schema builder tables ────────────────────────────────────────────────────
-- stores the visual ERD state per project.
-- run after 002_projects_color.sql.

create table if not exists schema_tables (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  x           float not null default 100,
  y           float not null default 100,
  created_at  timestamptz not null default now()
);

create table if not exists schema_fields (
  id          uuid primary key default gen_random_uuid(),
  table_id    uuid not null references schema_tables(id) on delete cascade,
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null,
  type        text not null default 'text',
  is_primary  boolean not null default false,
  is_nullable boolean not null default true,
  position    integer not null default 0
);

alter table schema_tables enable row level security;
alter table schema_fields enable row level security;

-- users own their schema_tables rows
create policy "users own schema_tables"
  on schema_tables for all
  using (auth.uid() = user_id);

-- users own schema_fields rows via their tables
create policy "users own schema_fields"
  on schema_fields for all
  using (
    table_id in (select id from schema_tables where user_id = auth.uid())
  );
