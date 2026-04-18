-- ─── whiteboard canvas state ──────────────────────────────────────────────────
-- one row per project, stores tldraw snapshot JSON

create table if not exists whiteboards (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null unique references projects(id) on delete cascade,
  canvas_json text,
  updated_at  timestamptz not null default now()
);

alter table whiteboards enable row level security;

create policy "users own whiteboards"
  on whiteboards for all
  using (
    project_id in (select id from projects where user_id = auth.uid())
  );
