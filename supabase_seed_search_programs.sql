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

-- West Virginia Programs (Huntington, Morgantown, Charleston, Wheeling)
('Pediatrics Residency Program', 'Marshall University Joan C. Edwards School of Medicine / Hoops Family Children''s Hospital', ARRAY['Pediatrics'], 'Huntington', 'WV', 'residency', true, true, true, true, true, 'ACGME-accredited Pediatrics Residency Program at Marshall University School of Medicine / Hoops Family Children''s Hospital at Cabell Huntington Hospital in Huntington, WV. Outstanding clinical volume and IMG-friendly environment.'),
('Internal Medicine Residency Program', 'Marshall University Joan C. Edwards School of Medicine', ARRAY['Internal Medicine'], 'Huntington', 'WV', 'residency', true, true, true, true, true, 'ACGME-accredited Internal Medicine Residency Program at Marshall University in Huntington, WV.'),
('Family Medicine Residency Program', 'Marshall University Joan C. Edwards School of Medicine', ARRAY['Family Medicine'], 'Huntington', 'WV', 'residency', true, true, true, false, true, 'ACGME-accredited Family Medicine Residency Program at Marshall University in Huntington, WV.'),
('Pediatrics Residency Program', 'West Virginia University / WVU Medicine Children''s Hospital', ARRAY['Pediatrics'], 'Morgantown', 'WV', 'residency', true, true, true, false, true, 'ACGME-accredited Pediatrics Residency Program at WVU Medicine Children''s Hospital in Morgantown, WV.'),
('Internal Medicine Residency Program', 'West Virginia University / J.W. Ruby Memorial Hospital', ARRAY['Internal Medicine'], 'Morgantown', 'WV', 'residency', true, true, true, true, true, 'ACGME-accredited Internal Medicine Residency Program at West Virginia University in Morgantown, WV.'),
('Pediatrics Residency Program', 'WVU Charleston Division / CAMC Women and Children''s Hospital', ARRAY['Pediatrics'], 'Charleston', 'WV', 'residency', true, true, true, true, true, 'ACGME-accredited Pediatrics Residency Program at WVU Charleston / CAMC Women and Children''s Hospital in Charleston, WV.'),
('Internal Medicine Residency Program', 'WVU Charleston Division / Charleston Area Medical Center (CAMC)', ARRAY['Internal Medicine'], 'Charleston', 'WV', 'residency', true, true, true, true, true, 'ACGME-accredited Internal Medicine Residency Program at Charleston Area Medical Center (CAMC) / WVU Charleston in Charleston, WV.'),
('Family Medicine Residency Program', 'WVU Medicine Wheeling Hospital', ARRAY['Family Medicine'], 'Wheeling', 'WV', 'residency', true, true, true, false, true, 'ACGME-accredited Family Medicine Residency Program at WVU Medicine Wheeling Hospital in Wheeling, WV.'),

-- West Virginia Fellowships
('Neonatal-Perinatal Medicine (NICU) Fellowship', 'Marshall University Joan C. Edwards School of Medicine / Hoops Family Children''s Hospital', ARRAY['Pediatrics'], 'Huntington', 'WV', 'fellowship', true, true, true, false, true, 'ACGME-accredited 3-year Neonatal-Perinatal Medicine fellowship at Cabell Huntington Hospital in Huntington, WV.'),
('Pediatric Hospital Medicine (PHM) Fellowship', 'Marshall University Joan C. Edwards School of Medicine / Hoops Family Children''s Hospital', ARRAY['Pediatrics'], 'Huntington', 'WV', 'fellowship', true, true, true, false, true, 'ACGME-accredited 2-year Pediatric Hospital Medicine fellowship at Hoops Family Children''s Hospital in Huntington, WV.'),

-- Real US Observerships
('Center for International Medical Education Clinical Observership', 'Cleveland Clinic Foundation', ARRAY['Internal Medicine'], 'Cleveland', 'OH', 'observership', false, true, false, false, true, 'Prestigious 4-week clinical observership at Cleveland Clinic Main Campus in Cleveland, OH.'),
('International Visiting Physician Observership', 'Mayo Clinic College of Medicine', ARRAY['Surgery'], 'Rochester', 'MN', 'observership', false, true, false, false, true, '4-week observational experience at Mayo Clinic Hospital in Rochester, MN.'),
('International Clinical Observership Program', 'Johns Hopkins University School of Medicine', ARRAY['Internal Medicine'], 'Baltimore', 'MD', 'observership', false, true, false, false, true, 'Clinical observership at Johns Hopkins Hospital in Baltimore, MD.'),
('Clinical Observership Program', 'Marshall University Joan C. Edwards School of Medicine', ARRAY['Pediatrics'], 'Huntington', 'WV', 'observership', false, true, false, false, true, 'Clinical observership at Cabell Huntington Hospital in Huntington, WV.'),

-- New York Programs
('Pediatric Residency Program', 'Kravis Children''s Hospital at Mount Sinai', ARRAY['Pediatrics'], 'New York', 'NY', 'residency', true, true, true, true, true, 'Comprehensive pediatric residency program in Manhattan, New York, NY.'),
('Internal Medicine Residency Program', 'NYU Grossman School of Medicine / NYU Langone Health', ARRAY['Internal Medicine'], 'New York', 'NY', 'residency', true, true, true, true, true, 'Leading medical center in New York, NY.')

ON CONFLICT DO NOTHING;
