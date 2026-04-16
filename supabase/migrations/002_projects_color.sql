-- add optional accent color to projects (hex string, e.g. '#6c63ff')
-- run in supabase sql editor after 001_initial.sql

alter table projects
  add column if not exists color text default '#6c63ff';
