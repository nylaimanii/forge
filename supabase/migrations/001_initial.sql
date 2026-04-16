-- ─── forge initial schema ─────────────────────────────────────────────────────
-- run this in the supabase sql editor, or via: supabase db push
-- rls is enabled on all tables — users can only access their own rows.

-- ─── projects ─────────────────────────────────────────────────────────────────
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  schema_json jsonb default '{}'::jsonb,   -- visual/ai-generated schema state
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table projects enable row level security;

create policy "users can view their own projects"
  on projects for select
  using (auth.uid() = user_id);

create policy "users can insert their own projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "users can update their own projects"
  on projects for update
  using (auth.uid() = user_id);

create policy "users can delete their own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- ─── whiteboards ──────────────────────────────────────────────────────────────
create table if not exists whiteboards (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  canvas_json jsonb default '{}'::jsonb,   -- tldraw canvas state snapshot
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table whiteboards enable row level security;

create policy "users can view their own whiteboards"
  on whiteboards for select
  using (auth.uid() = user_id);

create policy "users can insert their own whiteboards"
  on whiteboards for insert
  with check (auth.uid() = user_id);

create policy "users can update their own whiteboards"
  on whiteboards for update
  using (auth.uid() = user_id);

create policy "users can delete their own whiteboards"
  on whiteboards for delete
  using (auth.uid() = user_id);

-- ─── card_configs ──────────────────────────────────────────────────────────────
-- stores per-project card display configs (pokemon style, avatar, etc.)
create table if not exists card_configs (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  table_name  text not null,        -- which db table this card config targets
  config_json jsonb default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (project_id, table_name)
);

alter table card_configs enable row level security;

create policy "users can view their own card configs"
  on card_configs for select
  using (auth.uid() = user_id);

create policy "users can insert their own card configs"
  on card_configs for insert
  with check (auth.uid() = user_id);

create policy "users can update their own card configs"
  on card_configs for update
  using (auth.uid() = user_id);

create policy "users can delete their own card configs"
  on card_configs for delete
  using (auth.uid() = user_id);

-- ─── query_history ────────────────────────────────────────────────────────────
create table if not exists query_history (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  sql         text not null,
  source      text not null check (source in ('manual', 'ai')),
  ran_at      timestamptz not null default now()
);

alter table query_history enable row level security;

create policy "users can view their own query history"
  on query_history for select
  using (auth.uid() = user_id);

create policy "users can insert their own query history"
  on query_history for insert
  with check (auth.uid() = user_id);

create policy "users can delete their own query history"
  on query_history for delete
  using (auth.uid() = user_id);

-- ─── updated_at trigger ───────────────────────────────────────────────────────
-- auto-updates updated_at on row changes for projects, whiteboards, card_configs

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute function set_updated_at();

create trigger whiteboards_updated_at
  before update on whiteboards
  for each row execute function set_updated_at();

create trigger card_configs_updated_at
  before update on card_configs
  for each row execute function set_updated_at();
