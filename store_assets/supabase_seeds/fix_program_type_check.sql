-- Fix programs_program_type_check to include 'medical_school'
-- Idempotent: drops existing constraint first, then adds new one
-- Run BEFORE seed_medical_schools.sql and seed_observerships.sql

DO $$
BEGIN
  -- Drop old constraint if exists (ignore error if not present)
  BEGIN
    ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_program_type_check;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Add new constraint with medical_school included
  -- Also ensure specialty column is text[] for ARRAY values
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'programs' AND column_name = 'specialty'
      AND data_type = 'ARRAY'
    ) THEN
      ALTER TABLE programs ALTER COLUMN specialty TYPE text[] USING NULL;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  ALTER TABLE programs ADD CONSTRAINT programs_program_type_check
    CHECK (program_type IN ('residency','fellowship','observership','research','elective','medical_school'));
END $$;
