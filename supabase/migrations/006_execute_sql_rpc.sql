-- ─── execute_sql RPC ──────────────────────────────────────────────────────────
-- SAFETY NOTE: this function runs with SECURITY DEFINER which means it executes
-- with the privileges of the function owner (postgres). For a production app,
-- add query validation, row-count limits, and rate limiting before exposing this.
-- For Forge it is a dev tool used only by the authenticated project owner.

CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE 'SELECT json_agg(t) FROM (' || query || ') t' INTO result;
  RETURN COALESCE(result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION execute_sql TO authenticated;
