-- ============================================================
-- FIX A: Merge split Endocrinology specialty elements
-- The ACGME specialty "Endocrinology, Diabetes, and Metabolism (Internal Medicine)"
-- was stored in Supabase as 3 separate array elements:
--   'Endocrinology', 'Diabetes', 'and Metabolism (Internal Medicine)'
-- Merge them into 1 proper ACGME specialty string.
-- ============================================================

-- Step 1: Safety check - count affected rows
SELECT COUNT(*) AS affected_count
FROM programs
WHERE specialty IS NOT NULL
  AND cardinality(specialty) = 3
  AND 'Endocrinology' = ANY(specialty)
  AND 'Diabetes' = ANY(specialty)
  AND 'and Metabolism (Internal Medicine)' = ANY(specialty);

-- Step 2: Merge the 3 elements into 1 (run after confirming count looks right)
UPDATE programs
SET specialty = ARRAY['Endocrinology, Diabetes, and Metabolism (Internal Medicine)']
WHERE specialty IS NOT NULL
  AND cardinality(specialty) = 3
  AND 'Endocrinology' = ANY(specialty)
  AND 'Diabetes' = ANY(specialty)
  AND 'and Metabolism (Internal Medicine)' = ANY(specialty);

-- Step 3: Verify
SELECT COUNT(*) AS fixed_count
FROM programs
WHERE specialty IS NOT NULL
  AND cardinality(specialty) = 1
  AND specialty[1] = 'Endocrinology, Diabetes, and Metabolism (Internal Medicine)';
