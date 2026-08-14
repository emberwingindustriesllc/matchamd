-- ============================================================
-- Complete Search Engine Migration
-- Run in order: 1 → 2 → 3 → 4
-- ============================================================

-- Step 1: Create helper functions
-- Run first: normalize_query() and normalize_alias() needed by RPC
\i 'normalize_helpers.sql'

-- Step 2: Create specialty_aliases table and populate
-- Run second: specialty_aliases table needed by RPC
\i 'create_specialty_aliases.sql'

-- Step 3: Update search_programs() RPC
-- Run third: depends on helper functions and alias table
\i 'update_search_programs.sql'
