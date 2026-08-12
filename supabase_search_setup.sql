-- ============================================================
-- MATCHA MD - EXACT SUPABASE SQL SETUP FOR MULTI-SEARCH
-- Safe to re-run multiple times (drops existing views/functions first)
-- ============================================================

-- ------------------------------------------------------------
-- 1. DROP EXISTING VIEWS & FUNCTION TO PREVENT COLUMN RE-ORDERING ERRORS (42P16)
-- ------------------------------------------------------------
DROP VIEW IF EXISTS search_locations CASCADE;
DROP VIEW IF EXISTS search_specialties CASCADE;
DROP FUNCTION IF EXISTS search_programs CASCADE;

-- ------------------------------------------------------------
-- 2. ENSURE ALL REQUIRED COLUMNS EXIST ON THE PROGRAMS TABLE
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'specialty') THEN
    ALTER TABLE programs ADD COLUMN specialty text[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'city') THEN
    ALTER TABLE programs ADD COLUMN city text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'state') THEN
    ALTER TABLE programs ADD COLUMN state text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'program_type') THEN
    ALTER TABLE programs ADD COLUMN program_type text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'is_acgme_accredited') THEN
    ALTER TABLE programs ADD COLUMN is_acgme_accredited boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'ecfmg_pathway_eligible') THEN
    ALTER TABLE programs ADD COLUMN ecfmg_pathway_eligible boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'visa_j1') THEN
    ALTER TABLE programs ADD COLUMN visa_j1 boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'visa_h1b') THEN
    ALTER TABLE programs ADD COLUMN visa_h1b boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'eras_participating') THEN
    ALTER TABLE programs ADD COLUMN eras_participating boolean DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'nrmp_participating') THEN
    ALTER TABLE programs ADD COLUMN nrmp_participating boolean DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'verified') THEN
    ALTER TABLE programs ADD COLUMN verified boolean DEFAULT false;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 3. INDEXES FOR FAST QUERYING
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_programs_specialty_gin ON programs USING GIN (specialty);
CREATE INDEX IF NOT EXISTS idx_programs_city_state ON programs (city, state);
CREATE INDEX IF NOT EXISTS idx_programs_verified ON programs (verified);
CREATE INDEX IF NOT EXISTS idx_programs_program_type ON programs (program_type);

-- ------------------------------------------------------------
-- 4. VIEW: search_specialties
-- Returns distinct specialties with program counts for typeahead
-- ------------------------------------------------------------
CREATE VIEW search_specialties AS
SELECT 
  TRIM(s) AS specialty,
  TRIM(s) AS name,
  COUNT(*)::bigint AS program_count
FROM programs,
  UNNEST(
    CASE 
      WHEN pg_typeof(specialty)::text = 'text[]' THEN specialty
      WHEN specialty IS NOT NULL THEN ARRAY[specialty::text]
      ELSE ARRAY[]::text[]
    END
  ) AS s
WHERE s IS NOT NULL AND TRIM(s) <> ''
GROUP BY TRIM(s)
ORDER BY program_count DESC, specialty ASC;

GRANT SELECT ON search_specialties TO anon, authenticated;

-- ------------------------------------------------------------
-- 5. VIEW: search_locations
-- Matches location-typeahead.js (selects city, state, location_label, program_count)
-- ------------------------------------------------------------
CREATE VIEW search_locations AS
SELECT 
  TRIM(city) AS city,
  TRIM(state) AS state,
  TRIM(city) || ', ' || TRIM(state) AS location_label,
  TRIM(city) || ', ' || TRIM(state) AS location,
  TRIM(city) || ', ' || TRIM(state) AS label,
  COUNT(*)::bigint AS program_count
FROM programs
WHERE city IS NOT NULL 
  AND state IS NOT NULL 
  AND TRIM(city) <> '' 
  AND TRIM(state) <> ''
GROUP BY TRIM(city), TRIM(state)
ORDER BY program_count DESC, location_label ASC;

GRANT SELECT ON search_locations TO anon, authenticated;

-- ------------------------------------------------------------
-- 6. FUNCTION: search_programs
-- RPC matching parameters built by multi-search.js buildSearchParams()
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION search_programs(
  p_program_types TEXT[] DEFAULT NULL,
  p_specialties TEXT[] DEFAULT NULL,
  p_cities TEXT[] DEFAULT NULL,
  p_states TEXT[] DEFAULT NULL,
  p_locations TEXT[] DEFAULT NULL,
  p_acgme_accredited BOOLEAN DEFAULT NULL,
  p_ecfmg_pathway BOOLEAN DEFAULT NULL,
  p_j1_visa BOOLEAN DEFAULT NULL,
  p_h1b_visa BOOLEAN DEFAULT NULL,
  p_eras_participating BOOLEAN DEFAULT NULL,
  p_nrmp_participating BOOLEAN DEFAULT NULL,
  p_verified_only BOOLEAN DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  institution text,
  city text,
  state text,
  specialty text[],
  program_type text,
  is_acgme_accredited boolean,
  ecfmg_pathway_eligible boolean,
  visa_j1 boolean,
  visa_h1b boolean,
  eras_participating boolean,
  nrmp_participating boolean,
  website text,
  contact_email text,
  description text,
  submitted_by uuid,
  verified boolean,
  created_at timestamptz,
  program_notes_count bigint,
  scam_reports_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.institution,
    p.city,
    p.state,
    p.specialty,
    p.program_type,
    p.is_acgme_accredited,
    p.ecfmg_pathway_eligible,
    p.visa_j1,
    p.visa_h1b,
    p.eras_participating,
    p.nrmp_participating,
    p.website,
    p.contact_email,
    p.description,
    p.submitted_by,
    p.verified,
    p.created_at,
    COALESCE(pn.cnt, 0)::bigint AS program_notes_count,
    COALESCE(sr.cnt, 0)::bigint AS scam_reports_count
  FROM programs p
  LEFT JOIN (
    SELECT program_id, COUNT(*) AS cnt 
    FROM program_notes 
    GROUP BY program_id
  ) pn ON pn.program_id = p.id
  LEFT JOIN (
    SELECT program_id, COUNT(*) AS cnt 
    FROM scam_reports 
    GROUP BY program_id
  ) sr ON sr.program_id = p.id
  WHERE
    -- Program Types filter (empty array or null = all)
    (p_program_types IS NULL OR CARDINALITY(p_program_types) = 0 OR p.program_type = ANY(p_program_types))
    
    -- Specialties filter (array overlap)
    AND (p_specialties IS NULL OR CARDINALITY(p_specialties) = 0 OR p.specialty && p_specialties)
    
    -- Cities filter
    AND (p_cities IS NULL OR CARDINALITY(p_cities) = 0 OR p.city = ANY(p_cities))
    
    -- States filter
    AND (p_states IS NULL OR CARDINALITY(p_states) = 0 OR p.state = ANY(p_states))
    
    -- Locations filter (if passed directly as "City, ST" strings)
    AND (
      p_locations IS NULL OR CARDINALITY(p_locations) = 0 OR EXISTS (
        SELECT 1 FROM UNNEST(p_locations) loc
        WHERE (TRIM(p.city) || ', ' || TRIM(p.state)) ILIKE loc
           OR p.city ILIKE loc
           OR p.state ILIKE loc
      )
    )
    
    -- Boolean Filters (null = don't filter, true = only true, false = only false)
    AND (p_acgme_accredited IS NULL OR p.is_acgme_accredited = p_acgme_accredited)
    AND (p_ecfmg_pathway IS NULL OR p.ecfmg_pathway_eligible = p_ecfmg_pathway)
    AND (p_j1_visa IS NULL OR p.visa_j1 = p_j1_visa)
    AND (p_h1b_visa IS NULL OR p.visa_h1b = p_h1b_visa)
    AND (p_eras_participating IS NULL OR p.eras_participating = p_eras_participating)
    AND (p_nrmp_participating IS NULL OR p.nrmp_participating = p_nrmp_participating)
    AND (p_verified_only IS NULL OR p.verified = p_verified_only)
    
    -- Free text search
    AND (
      p_search IS NULL OR TRIM(p_search) = '' OR (
        p.name ILIKE '%' || p_search || '%' OR
        p.institution ILIKE '%' || p_search || '%' OR
        p.city ILIKE '%' || p_search || '%' OR
        p.state ILIKE '%' || p_search || '%' OR
        p.description ILIKE '%' || p_search || '%'
      )
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION search_programs TO anon, authenticated;

-- ------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'programs' AND policyname = 'Anyone can search programs'
  ) THEN
    CREATE POLICY "Anyone can search programs" ON programs FOR SELECT USING (true);
  END IF;
END $$;
