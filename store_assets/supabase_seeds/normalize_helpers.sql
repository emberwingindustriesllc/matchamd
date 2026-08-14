-- ============================================================
-- Helper functions for search_programs()
-- normalize_query: normalize a search query string
-- normalize_alias: normalize an alias string
-- ============================================================

-- Normalize a query string for consistent matching
-- Lowercase, collapse whitespace, normalize punctuation (/ - & → space)
CREATE OR REPLACE FUNCTION normalize_query(q text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both ' ' from 
    regexp_replace(
      lower(trim(q)),
      '[\/\-&]',
      ' ',
      'g'
    )
  );
$$;

-- Normalize an alias for storage/comparison
-- Same as normalize_query but used for alias normalization specifically
CREATE OR REPLACE FUNCTION normalize_alias(alias text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT normalize_query(alias);
$$;

-- Grant access
GRANT EXECUTE ON FUNCTION normalize_query TO anon, authenticated;
GRANT EXECUTE ON FUNCTION normalize_alias TO anon, authenticated;
