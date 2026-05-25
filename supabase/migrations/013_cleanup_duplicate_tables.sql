-- ─── cleanup: collapse duplicate schema_tables rows ────────────────────────
-- Caused by failed DDL syncs in the visual schema builder where the metadata
-- save always succeeded but each retry inserted a fresh schema_tables row
-- under the same (project_id, name).
--
-- Keeps the most recently created row per (project_id, name) pair and drops
-- the older copies. CASCADE on schema_fields / schema_relationships handles
-- the dependent rows automatically.
--
-- RUN THIS BEFORE 012_schema_tables_unique_name.sql.

DELETE FROM schema_tables
WHERE id NOT IN (
  SELECT DISTINCT ON (project_id, name) id
  FROM schema_tables
  ORDER BY project_id, name, created_at DESC
);
