-- ============================================================
-- SEED SCRIPT: Additional Top Residency Programs
-- Run this in Supabase SQL Editor to populate programs table
-- ============================================================

INSERT INTO programs (
  name, institution, specialty, city, state, program_type, 
  is_acgme_accredited, ecfmg_pathway_eligible, visa_j1, visa_h1b, 
  verified, description
) VALUES
-- Pittsburgh Programs
('Internal Medicine Residency Program', 'UPMC Medical Center / University of Pittsburgh', ARRAY['Internal Medicine'], 'Pittsburgh', 'PA', 'residency', true, true, true, true, true, 'Premier internal medicine training in Pittsburgh, PA.'),
('Pediatric Residency Program', 'UPMC Children''s Hospital of Pittsburgh', ARRAY['Pediatrics'], 'Pittsburgh', 'PA', 'residency', true, true, true, true, true, 'Leading pediatric residency program in Pittsburgh, PA.'),

-- Los Angeles Programs
('Internal Medicine Residency Program', 'David Geffen School of Medicine at UCLA', ARRAY['Internal Medicine'], 'Los Angeles', 'CA', 'residency', true, true, true, true, true, 'Top-tier academic medical center residency in Los Angeles, CA.'),
('Pediatric Residency Program', 'Children''s Hospital Los Angeles / Keck School of Medicine of USC', ARRAY['Pediatrics'], 'Los Angeles', 'CA', 'residency', true, true, true, false, true, 'Premier pediatric clinical training in Los Angeles, CA.'),
('Internal Medicine Residency Program', 'Cedars-Sinai Medical Center', ARRAY['Internal Medicine'], 'Los Angeles', 'CA', 'residency', true, true, true, true, true, 'IMG-friendly academic community program in Los Angeles, CA.'),

-- New York Programs
('Pediatric Residency Program', 'Kravis Children''s Hospital at Mount Sinai', ARRAY['Pediatrics'], 'New York', 'NY', 'residency', true, true, true, true, true, 'Comprehensive pediatric residency program in Manhattan, New York, NY.'),
('Internal Medicine Residency Program', 'NYU Grossman School of Medicine / NYU Langone Health', ARRAY['Internal Medicine'], 'New York', 'NY', 'residency', true, true, true, true, true, 'Leading medical center in New York, NY.')

ON CONFLICT DO NOTHING;
