-- ─── schema_tables: unique (project_id, name) ──────────────────────────────
-- Backstop for the duplicate-name bug. The /createTable action also checks
-- before inserting, but a db-level constraint makes the rule impossible to
-- bypass (concurrent inserts, direct SQL writes, future code paths).
--
-- NOTE: run migration 013_cleanup_duplicate_tables.sql FIRST. Adding this
-- constraint against an existing duplicate row will fail.

ALTER TABLE schema_tables
ADD CONSTRAINT schema_tables_project_name_unique
UNIQUE (project_id, name);
