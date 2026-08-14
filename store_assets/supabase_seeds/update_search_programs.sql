-- ============================================================
-- Updated search_programs() RPC with:
-- 1. Specialty alias matching
-- 2. Tokenized query parsing
-- 3. Relevance-based ranking (replaces created_at ordering)
-- 4. Program type inference from query text
-- ============================================================

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
  scam_reports_count bigint,
  relevance_score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- Extracted program type from query text (overrides p_program_types if present)
  inferred_program_type TEXT;
  -- Inferred specialty from alias table (supplements p_specialties)
  inferred_specialty TEXT;
  -- The free-text portion after stripping program type terms
  free_text_search TEXT;
BEGIN
  -- ── Step 1: Parse the search query ────────────────────────────────────────
  -- Determine if user typed a program type like "residency" or "fellowship"
  inferred_program_type := NULL;
  IF p_search IS NOT NULL AND TRIM(p_search) <> '' THEN
    -- Check for program type keywords in the query
    -- Order matters: check longer phrases first ("medical school" before "med school")
    IF lower(p_search) LIKE '%medical school%' OR lower(p_search) LIKE '%med school%' OR lower(p_search) LIKE '%medschool%' THEN
      inferred_program_type := 'medical_school';
    ELSIF lower(p_search) LIKE '%residency%' OR lower(p_search) LIKE '%residencies%' OR lower(p_search) LIKE '%res %' OR lower(p_search) = 'res' THEN
      inferred_program_type := 'residency';
    ELSIF lower(p_search) LIKE '%fellowship%' OR lower(p_search) LIKE '%fellows%' OR lower(p_search) = 'fellow' THEN
      inferred_program_type := 'fellowship';
    ELSIF lower(p_search) LIKE '%observership%' THEN
      inferred_program_type := 'observership';
    ELSIF lower(p_search) LIKE '%research%' THEN
      inferred_program_type := 'research';
    ELSIF lower(p_search) LIKE '%elective%' THEN
      inferred_program_type := 'elective';
    END IF;
  END IF;

  -- Determine inferred specialty from alias table
  inferred_specialty := NULL;
  IF p_search IS NOT NULL AND TRIM(p_search) <> '' THEN
    -- Strip program type terms from the search to get the "free text" portion
    free_text_search := p_search;
    IF inferred_program_type IS NOT NULL THEN
      -- Remove the program type term from the search text for free-text matching
      free_text_search := regexp_replace(
        p_search,
        '\m(residency|residencies|res\s|fellowship|fellows|observership|research|elective|medical school|med school|medschool)\M',
        '',
        'gi'
      );
      free_text_search := trim(both ' ' from free_text_search);
    END IF;

    -- Look up specialty alias
    SELECT canonical_specialty INTO inferred_specialty
    FROM specialty_aliases
    WHERE normalized_alias = normalize_alias(free_text_search)
    LIMIT 1;
    
    -- If no exact normalized match, try fuzzy: check if the free text contains any alias
    IF inferred_specialty IS NULL AND free_text_search <> '' THEN
      SELECT canonical_specialty INTO inferred_specialty
      FROM specialty_aliases
      WHERE free_text_search ILIKE '%' || alias || '%'
         OR alias ILIKE '%' || free_text_search || '%'
      LIMIT 1;
    END IF;
  END IF;

  -- ── Step 2: Build the WHERE clause dynamically ─────────────────────────────
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
    COALESCE(sr.cnt, 0)::bigint AS scam_reports_count,
    -- Relevance scoring
    (
      -- 1000: Exact canonical specialty match (from alias or direct)
      CASE WHEN inferred_specialty IS NOT NULL AND 
           EXISTS (
             SELECT 1 FROM unnest(p.specialty) s 
             WHERE lower(s) = lower(inferred_specialty)
           )
      THEN 1000 ELSE 0 END
      +
      -- 950: Exact specialty match via alias (normalize the program specialty and compare)
      CASE WHEN inferred_specialty IS NOT NULL AND 
           EXISTS (
             SELECT 1 FROM specialty_aliases sa
             WHERE sa.canonical_specialty = ANY(p.specialty)
               AND (lower(free_text_search) = lower(sa.normalized_alias)
                    OR free_text_search ILIKE '%' || sa.alias || '%'
                    OR sa.alias ILIKE '%' || free_text_search || '%')
           )
      THEN 950 ELSE 0 END
      +
      -- 900: Exact program name match (normalized)
      CASE WHEN p_search IS NOT NULL AND TRIM(p_search) <> '' AND
           lower(p.name) = normalize_query(p_search)
      THEN 900 ELSE 0 END
      +
      -- 850: Program name contains the exact specialty alias
      CASE WHEN inferred_specialty IS NOT NULL AND
           lower(p.name) LIKE '%' || lower(inferred_specialty) || '%'
      THEN 850 ELSE 0 END
      +
      -- 800: Institution exact match
      CASE WHEN p_search IS NOT NULL AND TRIM(p_search) <> '' AND
           lower(p.institution) = normalize_query(p_search)
      THEN 800 ELSE 0 END
      +
      -- 750: Specialty alias match in program name
      CASE WHEN inferred_specialty IS NOT NULL AND
           lower(p.name) LIKE '%' || lower(inferred_specialty) || '%'
      THEN 750 ELSE 0 END
      +
      -- 700: Specialty alias match (program specialty matches alias)
      CASE WHEN inferred_specialty IS NOT NULL AND
           EXISTS (
             SELECT 1 FROM specialty_aliases sa
             WHERE sa.canonical_specialty = ANY(p.specialty)
               AND (
                 lower(free_text_search) = lower(sa.normalized_alias)
                 OR free_text_search ILIKE '%' || sa.alias || '%'
                 OR sa.alias ILIKE '%' || free_text_search || '%'
               )
           )
      THEN 700 ELSE 0 END
      +
      -- 650: Program name contains free-text search
      CASE WHEN p_search IS NOT NULL AND TRIM(p_search) <> '' AND
           free_text_search <> '' AND
           lower(p.name) LIKE '%' || lower(free_text_search) || '%'
      THEN 650 ELSE 0 END
      +
      -- 600: Program name ILIKE with search
      CASE WHEN p_search IS NOT NULL AND TRIM(p_search) <> '' AND
           lower(p.name) ILIKE '%' || lower(p_search) || '%'
      THEN 600 ELSE 0 END
      +
      -- 550: Institution contains free-text search
      CASE WHEN p_search IS NOT NULL AND TRIM(p_search) <> '' AND
           free_text_search <> '' AND
           lower(p.institution) LIKE '%' || lower(free_text_search) || '%'
      THEN 550 ELSE 0 END
      +
      -- 500: Institution ILIKE with search
      CASE WHEN p_search IS NOT NULL AND TRIM(p_search) <> '' AND
           lower(p.institution) ILIKE '%' || lower(p_search) || '%'
      THEN 500 ELSE 0 END
      +
      -- 450: Specialty array text contains search
      CASE WHEN p_search IS NOT NULL AND TRIM(p_search) <> '' AND
           p.specialty::text ILIKE '%' || lower(p_search) || '%'
      THEN 450 ELSE 0 END
      +
      -- 400: City match
      CASE WHEN p_search IS NOT NULL AND TRIM(p_search) <> '' AND
           (lower(p.city) = lower(p_search) OR lower(p.city) LIKE '%' || lower(p_search) || '%')
      THEN 400 ELSE 0 END
      +
      -- 350: State match
      CASE WHEN p_search IS NOT NULL AND TRIM(p_search) <> '' AND
           (lower(p.state) = lower(p_search) OR lower(p.state) LIKE '%' || lower(p_search) || '%')
      THEN 350 ELSE 0 END
      +
      -- 300: Description match
      CASE WHEN p_search IS NOT NULL AND TRIM(p_search) <> '' AND
           lower(p.description) ILIKE '%' || lower(p_search) || '%'
      THEN 300 ELSE 0 END
    ) AS relevance_score
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
    -- Program Types filter (explicit OR inferred)
    (p_program_types IS NULL OR CARDINALITY(p_program_types) = 0 
     OR p.program_type = ANY(p_program_types)
     -- Include inferred program type if no explicit filter contradicts it
     OR (inferred_program_type IS NOT NULL 
         AND (p_program_types IS NULL OR CARDINALITY(p_program_types) = 0 
              OR p.program_type = inferred_program_type)))
     
    -- Specialties filter (explicit overrides inferred)
    AND (p_specialties IS NULL OR CARDINALITY(p_specialties) = 0 
         OR p.specialty && p_specialties
         -- Also include inferred specialty if no explicit specialty filter
         OR (inferred_specialty IS NOT NULL 
             AND p_specialties IS NULL 
             AND CARDINALITY(p_specialties) = 0
             AND p.specialty && ARRAY[inferred_specialty]))
     
    -- Cities filter
    AND (p_cities IS NULL OR CARDINALITY(p_cities) = 0 OR p.city = ANY(p_cities))
     
    -- States filter
    AND (p_states IS NULL OR CARDINALITY(p_states) = 0 OR p.state = ANY(p_states))
     
    -- Locations filter
    AND (
      p_locations IS NULL OR CARDINALITY(p_locations) = 0 OR EXISTS (
        SELECT 1 FROM UNNEST(p_locations) loc
        WHERE (TRIM(p.city) || ', ' || TRIM(p.state)) ILIKE loc
           OR p.city ILIKE loc
           OR p.state ILIKE loc
      )
    )
     
    -- Boolean Filters
    AND (p_acgme_accredited IS NULL OR p.is_acgme_accredited = p_acgme_accredited)
    AND (p_ecfmg_pathway IS NULL OR p.ecfmg_pathway_eligible = p_ecfmg_pathway)
    AND (p_j1_visa IS NULL OR p.visa_j1 = p_j1_visa)
    AND (p_h1b_visa IS NULL OR p.visa_h1b = p_h1b_visa)
    AND (p_eras_participating IS NULL OR p.eras_participating = p_eras_participating)
    AND (p_nrmp_participating IS NULL OR p.nrmp_participating = p_nrmp_participating)
    AND (p_verified_only IS NULL OR p.verified = p_verified_only)
     
    -- Free text search (only if there's something to search for)
    AND (
      p_search IS NULL OR TRIM(p_search) = '' OR (
        -- Full query match across all text fields
        p.name ILIKE '%' || p_search || '%' OR
        p.institution ILIKE '%' || p_search || '%' OR
        p.city ILIKE '%' || p_search || '%' OR
        p.state ILIKE '%' || p_search || '%' OR
        p.description ILIKE '%' || p_search || '%' OR
        p.specialty::text ILIKE '%' || p_search || '%' OR
        -- Alias-based matching: check if any specialty alias matches
        EXISTS (
          SELECT 1 FROM specialty_aliases sa
          WHERE sa.canonical_specialty = ANY(p.specialty)
            AND (
              lower(p_search) LIKE '%' || sa.alias || '%'
              OR sa.alias ILIKE '%' || p_search || '%'
              OR normalize_query(p_search) = sa.normalized_alias
            )
        )
      )
    )
  ORDER BY
    -- When searching: relevance first, then verified, then created_at
    CASE WHEN p_search IS NOT NULL AND TRIM(p_search) <> '' THEN
      relevance_score DESC,
      CASE WHEN p.verified = true THEN 0 ELSE 1 END,
      p.created_at DESC
    ELSE
      -- Default ordering when no search: verified first, then created_at
      CASE WHEN p.verified = true THEN 0 ELSE 1 END,
      p.created_at DESC
    END
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION search_programs TO anon, authenticated;
