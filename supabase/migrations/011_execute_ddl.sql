-- ─── execute_ddl RPC ──────────────────────────────────────────────────────────
-- Used by the visual schema builder to sync CREATE TABLE / ALTER TABLE / DROP
-- against real postgres after the metadata save lands in schema_tables.
--
-- We can't use execute_sql for this because that function wraps incoming SQL
-- in `SELECT json_agg(t) FROM (<query>) t`, which fails for any statement
-- that doesn't return rows (DDL doesn't).
--
-- search_path is pinned so SECURITY DEFINER doesn't pick up a caller's
-- search_path and route CREATE TABLE into an unexpected schema. Grants are
-- explicit on the (text) signature so postgrest's rpc lookup can resolve it.
--
-- SAFETY NOTE: SECURITY DEFINER runs as the function owner (postgres). The
-- /api/sql/mutate endpoint gates DDL behind an authenticated session + a
-- firstWord allowlist (CREATE, ALTER). For a production app, also add
-- per-project / per-table scoping and rate limiting before exposing this.

CREATE OR REPLACE FUNCTION public.execute_ddl(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

GRANT EXECUTE ON FUNCTION public.execute_ddl(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_ddl(text) TO anon;
GRANT EXECUTE ON FUNCTION public.execute_ddl(text) TO service_role;
