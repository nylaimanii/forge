create table if not exists forms (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'untitled form',
  fields jsonb not null default '[]'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now()
);

alter table forms enable row level security;
alter table form_submissions enable row level security;

create policy "users own forms" on forms for all using (auth.uid() = user_id);
create policy "public can insert submissions" on form_submissions for insert with check (
  form_id in (select id from forms where is_public = true)
);
create policy "users own submissions" on form_submissions for select using (
  form_id in (select id from forms where user_id = auth.uid())
);
