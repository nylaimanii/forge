-- ─── relationship lines between schema tables ─────────────────────────────────
-- run after 003_schema_tables.sql

create table if not exists schema_relationships (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id)       on delete cascade,
  from_table_id uuid not null references schema_tables(id)  on delete cascade,
  from_field_id uuid not null references schema_fields(id)  on delete cascade,
  to_table_id   uuid not null references schema_tables(id)  on delete cascade,
  to_field_id   uuid not null references schema_fields(id)  on delete cascade,
  relation_type text not null default 'one-to-many'
    check (relation_type in ('one-to-one', 'one-to-many', 'many-to-many')),
  created_at    timestamptz not null default now()
);

alter table schema_relationships enable row level security;

create policy "users own schema_relationships"
  on schema_relationships for all
  using (
    project_id in (select id from projects where user_id = auth.uid())
  );
