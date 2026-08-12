-- ============================================================
-- FIX B: Add specialty to free-text search in search_programs()
-- The current function only searches name, institution, city,
-- state, and description. Add specialty so typing "endocrinology"
-- in the search bar finds matching programs.
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
    -- Program Types filter
    (p_program_types IS NULL OR CARDINALITY(p_program_types) = 0 OR p.program_type = ANY(p_program_types))

    -- Specialties filter (array overlap)
    AND (p_specialties IS NULL OR CARDINALITY(p_specialties) = 0 OR p.specialty && p_specialties)

    -- Cities filter
    AND (p_cities IS NULL OR CARDINALITY(p_cities) = 0 OR p.city = ANY(p_cities))

    -- States filter
    AND (p_states IS NULL OR CARDINALITY(p_states) = 0 OR p.state = ANY(p_states))

    -- Locations filter
    AND (
      p_locations IS NULL OR CARDINALITY(p_locations) = 0 OR EXISTS (
        SELECT 1 FROM UNNEST(p_locations) loc
        WHERE (TRIM(p.city) || '', '' || TRIM(p.state)) ILIKE loc
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

    -- Free text search - NOW INCLUDES SPECIALTY
    AND (
      p_search IS NULL OR TRIM(p_search) = '' OR (
        p.name ILIKE ''%'' || p_search || ''%'' OR
        p.institution ILIKE ''%'' || p_search || ''%'' OR
        p.city ILIKE ''%'' || p_search || ''%'' OR
        p.state ILIKE ''%'' || p_search || ''%'' OR
        p.description ILIKE ''%'' || p_search || ''%'' OR
        p.specialty::text ILIKE ''%'' || p_search || ''%''
      )
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION search_programs TO anon, authenticated;
