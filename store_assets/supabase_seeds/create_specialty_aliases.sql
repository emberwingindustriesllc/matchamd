-- ============================================================
-- Specialty Aliases Table & Initial Data
-- Idempotent migration for MatchAMD search
-- ============================================================
-- Creates specialty_aliases table if it doesn't exist,
-- populates with canonical aliases for major specialties.
-- Safe to run multiple times.
-- ============================================================

-- 1. Create specialty_aliases table
CREATE TABLE IF NOT EXISTS public.specialty_aliases (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_specialty text NOT NULL,   -- the canonical specialty name as stored in programs.specialty
  alias       text NOT NULL,           -- the user-typed alias
  normalized_alias text NOT NULL,      -- lowercase, whitespace-normalized, / - & → space
  created_at  timestamptz DEFAULT now(),
  CONSTRAINT uq_specialty_alias_normalized UNIQUE (normalized_alias)
);

-- 2. Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_specialty_aliases_normalized 
  ON public.specialty_aliases USING btree (normalized_alias);
CREATE INDEX IF NOT EXISTS idx_specialty_aliases_canonical 
  ON public.specialty_aliases USING btree (canonical_specialty);

-- 3. Enable pg_trgm for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 4. Create trigram indexes on search columns (idempotent)
CREATE INDEX IF NOT EXISTS idx_programs_name_trgm 
  ON public.programs USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_programs_institution_trgm 
  ON public.programs USING gin (institution gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_programs_city_trgm 
  ON public.programs USING gin (city gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_programs_state_trgm 
  ON public.programs USING gin (state gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_programs_description_trgm 
  ON public.programs USING gin (description gin_trgm_ops);

-- 5. Specialty aliases data
-- Idempotent insert using ON CONFLICT DO NOTHING on normalized_alias
INSERT INTO public.specialty_aliases (canonical_specialty, alias, normalized_alias) VALUES
  -- Obstetrics and Gynecology
  ('Obstetrics and Gynecology', 'OB/GYN', 'obgyn'),
  ('Obstetrics and Gynecology', 'OBGYN', 'obgyn'),
  ('Obstetrics and Gynecology', 'OB GYN', 'ob gyn'),
  ('Obstetrics and Gynecology', 'OB-GYN', 'ob gyn'),
  ('Obstetrics and Gynecology', 'Ob-Gyn', 'ob gyn'),
  ('Obstetrics and Gynecology', 'Obstetrics & Gynecology', 'obstetrics and gynecology'),
  ('Obstetrics and Gynecology', 'Obstetrics/Gynecology', 'obstetrics and gynecology'),
  ('Obstetrics and Gynecology', 'Obstetrics Gynecology', 'obstetrics and gynecology'),
  ('Obstetrics and Gynecology', 'Obstetrics', 'obstetrics'),
  ('Obstetrics and Gynecology', 'Gynecology', 'gynecology'),

  -- Internal Medicine
  ('Internal Medicine', 'Internal Medicine', 'internal medicine'),
  ('Internal Medicine', 'IM', 'im'),
  ('Internal Medicine', 'Internal Med', 'internal med'),
  ('Internal Medicine', 'Internal Medicine Residency', 'internal medicine residency'),

  -- Pediatrics
  ('Pediatrics', 'Pediatrics', 'pediatrics'),
  ('Pediatrics', 'Peds', 'peds'),
  ('Pediatrics', 'Pediatric', 'pediatric'),
  ('Pediatrics', 'Pediatric Medicine', 'pediatric medicine'),

  -- Family Medicine
  ('Family Medicine', 'Family Medicine', 'family medicine'),
  ('Family Medicine', 'Family Med', 'family med'),
  ('Family Medicine', 'FM', 'fm'),
  ('Family Medicine', 'Family Practice', 'family practice'),

  -- Emergency Medicine
  ('Emergency Medicine', 'Emergency Medicine', 'emergency medicine'),
  ('Emergency Medicine', 'EM', 'em'),
  ('Emergency Medicine', 'ER', 'er'),
  ('Emergency Medicine', 'Emergency Med', 'emergency med'),

  -- Surgery
  ('Surgery', 'Surgery', 'surgery'),
  ('Surgery', 'General Surgery', 'general surgery'),
  ('Surgery', 'Gen Surg', 'gen surg'),
  ('Surgery', 'GS', 'gs'),

  -- Psychiatry
  ('Psychiatry', 'Psychiatry', 'psychiatry'),
  ('Psychiatry', 'Psych', 'psych'),
  ('Psychiatry', 'Psychiatric Medicine', 'psychiatric medicine'),

  -- Neurology
  ('Neurology', 'Neurology', 'neurology'),
  ('Neurology', 'Neuro', 'neuro'),

  -- Anesthesiology
  ('Anesthesiology', 'Anesthesiology', 'anesthesiology'),
  ('Anesthesiology', 'Anesthesia', 'anesthesia'),
  ('Anesthesiology', 'Anes', 'anes'),

  -- Radiology
  ('Radiology', 'Radiology', 'radiology'),
  ('Radiology', 'Diagnostic Radiology', 'diagnostic radiology'),
  ('Radiology', 'DR', 'dr'),

  -- Pathology
  ('Pathology', 'Pathology', 'pathology'),
  ('Pathology', 'Path', 'path'),

  -- Dermatology
  ('Dermatology', 'Dermatology', 'dermatology'),
  ('Dermatology', 'Derm', 'derm'),

  -- Orthopaedic Surgery
  ('Orthopaedic Surgery', 'Orthopaedic Surgery', 'orthopaedic surgery'),
  ('Orthopaedic Surgery', 'Orthopedic Surgery', 'orthopedic surgery'),
  ('Orthopaedic Surgery', 'Ortho', 'ortho'),
  ('Orthopaedic Surgery', 'Orthopedics', 'orthopedics'),

  -- Hematology/Oncology
  ('Hematology/Oncology', 'Hematology/Oncology', 'hematology/oncology'),
  ('Hematology/Oncology', 'Heme Onc', 'heme onc'),
  ('Hematology/Oncology', 'Heme-Onc', 'heme onc'),
  ('Hematology/Oncology', 'Hematology and Oncology', 'hematology and oncology'),
  ('Hematology/Oncology', 'Haematology Oncology', 'haematology oncology'),

  -- Cardiology
  ('Cardiology', 'Cardiology', 'cardiology'),
  ('Cardiology', 'Cardiovascular Disease', 'cardiovascular disease'),

  -- Gastroenterology
  ('Gastroenterology', 'Gastroenterology', 'gastroenterology'),
  ('Gastroenterology', 'GI', 'gi'),

  -- Pulmonology
  ('Pulmonology', 'Pulmonology', 'pulmonology'),
  ('Pulmonology', 'Pulmonary', 'pulmonary'),
  ('Pulmonology', 'Pulmonary Critical Care', 'pulmonary critical care'),
  ('Pulmonology', 'Pulmonary/Critical Care', 'pulmonary critical care'),

  -- Nephrology
  ('Nephrology', 'Nephrology', 'nephrology'),

  -- Endocrinology
  ('Endocrinology', 'Endocrinology', 'endocrinology'),
  ('Endocrinology', 'Diabetes', 'diabetes'),

  -- Infectious Disease
  ('Infectious Disease', 'Infectious Disease', 'infectious disease'),
  ('Infectious Disease', 'ID', 'id'),

  -- Rheumatology
  ('Rheumatology', 'Rheumatology', 'rheumatology'),

  -- Allergy/Immunology
  ('Allergy/Immunology', 'Allergy/Immunology', 'allergy/immunology'),
  ('Allergy/Immunology', 'Allergy and Immunology', 'allergy and immunology'),
  ('Allergy/Immunology', 'Allergy', 'allergy'),
  ('Allergy/Immunology', 'Immunology', 'immunology'),

  -- Geriatric Medicine
  ('Geriatric Medicine', 'Geriatric Medicine', 'geriatric medicine'),
  ('Geriatric Medicine', 'Geriatrics', 'geriatrics'),

  -- Sleep Medicine
  ('Sleep Medicine', 'Sleep Medicine', 'sleep medicine'),
  ('Sleep Medicine', 'Sleep', 'sleep'),

  -- Sports Medicine
  ('Sports Medicine', 'Sports Medicine', 'sports medicine'),
  ('Sports Medicine', 'Sports Med', 'sports med'),

  -- Ophthalmology
  ('Ophthalmology', 'Ophthalmology', 'ophthalmology'),
  ('Ophthalmology', 'Eye', 'eye'),

  -- Otolaryngology
  ('Otolaryngology', 'Otolaryngology', 'otolaryngology'),
  ('Otolaryngology', 'ENT', 'ent'),
  ('Otolaryngology', 'Ear Nose Throat', 'ear nose throat'),

  -- Urology
  ('Urology', 'Urology', 'urology'),

  -- Physical Medicine and Rehabilitation
  ('Physical Medicine and Rehabilitation', 'Physical Medicine', 'physical medicine'),
  ('Physical Medicine and Rehabilitation', 'PM&R', 'pm r'),
  ('Physical Medicine and Rehabilitation', 'PMR', 'pmr'),
  ('Physical Medicine and Rehabilitation', 'Rehabilitation Medicine', 'rehabilitation medicine'),

  -- Radiation Oncology
  ('Radiation Oncology', 'Radiation Oncology', 'radiation oncology'),
  ('Radiation Oncology', 'Radiation', 'radiation'),

  -- Medical Genetics
  ('Medical Genetics', 'Medical Genetics', 'medical genetics'),
  ('Medical Genetics', 'Genetics', 'genetics'),

  -- Child Psychiatry
  ('Child Psychiatry', 'Child Psychiatry', 'child psychiatry'),
  ('Child Psychiatry', 'Child Psych', 'child psych'),

  -- Addiction Psychiatry
  ('Addiction Psychiatry', 'Addiction Psychiatry', 'addiction psychiatry'),
  ('Addiction Psychiatry', 'Addiction', 'addiction'),

  -- Hospice and Palliative Medicine
  ('Hospice and Palliative Medicine', 'Hospice', 'hospice'),
  ('Hospice and Palliative Medicine', 'Palliative', 'palliative'),
  ('Hospice and Palliative Medicine', 'Palliative Care', 'palliative care'),

  -- Vascular Surgery
  ('Vascular Surgery', 'Vascular Surgery', 'vascular surgery'),
  ('Vascular Surgery', 'Vascular', 'vascular'),

  -- Plastic Surgery
  ('Plastic Surgery', 'Plastic Surgery', 'plastic surgery'),
  ('Plastic Surgery', 'Plastics', 'plastics'),

  -- Pediatric subspecialties (do NOT map to general OB/GYN or Pediatrics)
  ('Pediatric Cardiology', 'Pediatric Cardiology', 'pediatric cardiology'),
  ('Pediatric Critical Care Medicine', 'Pediatric Critical Care', 'pediatric critical care'),
  ('Pediatric Emergency Medicine', 'Pediatric Emergency Medicine', 'pediatric emergency medicine'),
  ('Pediatric Gastroenterology', 'Pediatric Gastroenterology', 'pediatric gastroenterology'),
  ('Pediatric Hematology/Oncology', 'Pediatric Hematology/Oncology', 'pediatric hematology/oncology'),
  ('Pediatric Nephrology', 'Pediatric Nephrology', 'pediatric nephrology'),
  ('Pediatric Pulmonology', 'Pediatric Pulmonology', 'pediatric pulmonology'),
  ('Pediatric Rheumatology', 'Pediatric Rheumatology', 'pediatric rheumatology'),

  -- Geriatric Psychiatry
  ('Geriatric Psychiatry', 'Geriatric Psychiatry', 'geriatric psychiatry'),

  -- Forensic Psychiatry
  ('Forensic Psychiatry', 'Forensic Psychiatry', 'forensic psychiatry'),

  -- Sleep Medicine (already covered above but explicit)

  -- Addiction Medicine (separate from Addiction Psychiatry)
  ('Addiction Medicine', 'Addiction Medicine', 'addiction medicine'),

  -- Pain Medicine
  ('Pain Medicine', 'Pain Medicine', 'pain medicine'),
  ('Pain Medicine', 'Pain Management', 'pain management'),

  -- Clinical Informatics
  ('Clinical Informatics', 'Clinical Informatics', 'clinical informatics'),
  ('Clinical Informatics', 'Informatics', 'informatics'),

  -- Hospice and Palliative Medicine (already covered)

  -- Additional common aliases
  ('Internal Medicine', 'Gen Med', 'gen med'),
  ('Internal Medicine', 'General Medicine', 'general medicine'),
  ('Family Medicine', 'GP', 'gp'),
  ('Family Medicine', 'General Practice', 'general practice'),
  ('Emergency Medicine', 'Emergency Department', 'emergency department'),
  ('Surgery', 'General Surgery Residency', 'general surgery residency'),
  ('Psychiatry', 'Mental Health', 'mental health'),
  ('Neurology', 'Neurology Residency', 'neurology residency'),
  ('Anesthesiology', 'Anaesthesia', 'anaesthesia'),
  ('Anesthesiology', 'Anaesthesia', 'anaesthesia'),
  ('Radiology', 'Radiology Residency', 'radiology residency'),
  ('Dermatology', 'Dermatology Residency', 'dermatology residency'),
  ('Ophthalmology', 'Ophthalmology Residency', 'ophthalmology residency'),
  ('Otolaryngology', 'ENT Residency', 'ent residency'),
  ('Surgery', 'Surgical Residency', 'surgical residency'),
  ('Psychiatry', 'Psychiatry Residency', 'psychiatry residency'),
  ('Family Medicine', 'Family Medicine Residency', 'family medicine residency'),
  ('Pediatrics', 'Pediatrics Residency', 'pediatrics residency'),
  ('Internal Medicine', 'IM Residency', 'im residency'),
  ('Internal Medicine', 'Internal Med Residency', 'internal med residency'),
  ('Pediatrics', 'Peds Residency', 'peds residency'),
  ('Emergency Medicine', 'EM Residency', 'em residency'),
  ('Emergency Medicine', 'Emergency Med Residency', 'emergency med residency'),
  ('Neurology', 'Neuro Residency', 'neuro residency'),
  ('Anesthesiology', 'Anes Residency', 'anes residency'),
  ('Radiology', 'DR Residency', 'dr residency'),
  ('Pathology', 'Path Residency', 'path residency'),
  ('Dermatology', 'Derm Residency', 'derm residency'),
  ('Orthopaedic Surgery', 'Ortho Residency', 'ortho residency'),
  ('Orthopaedic Surgery', 'Orthopedics Residency', 'orthopedics residency'),
  ('Gastroenterology', 'GI Residency', 'gi residency'),
  ('Cardiology', 'Cardiology Residency', 'cardiology residency'),
  ('Pulmonology', 'Pulmonology Residency', 'pulmonology residency'),
  ('Nephrology', 'Nephrology Residency', 'nephrology residency'),
  ('Endocrinology', 'Endocrinology Residency', 'endocrinology residency'),
  ('Infectious Disease', 'ID Residency', 'id residency'),
  ('Rheumatology', 'Rheumatology Residency', 'rheumatology residency'),
  ('Allergy/Immunology', 'Allergy Residency', 'allergy residency'),
  ('Geriatric Medicine', 'Geriatrics Residency', 'geriatrics residency'),
  ('Sleep Medicine', 'Sleep Medicine Residency', 'sleep medicine residency'),
  ('Sports Medicine', 'Sports Medicine Residency', 'sports medicine residency'),
  ('Urology', 'Urology Residency', 'urology residency'),
  ('Vascular Surgery', 'Vascular Surgery Residency', 'vascular surgery residency'),
  ('Plastic Surgery', 'Plastic Surgery Residency', 'plastic surgery residency'),
  ('Radiation Oncology', 'Radiation Oncology Residency', 'radiation oncology residency'),
  ('Medical Genetics', 'Medical Genetics Residency', 'medical genetics residency'),
  ('Hospice and Palliative Medicine', 'Hospice Residency', 'hospice residency'),
  ('Hospice and Palliative Medicine', 'Palliative Medicine Residency', 'palliative medicine residency'),
  ('Physical Medicine and Rehabilitation', 'PM&R Residency', 'pm r residency'),
  ('Physical Medicine and Rehabilitation', 'PMR Residency', 'pmr residency'),
  ('Physical Medicine and Rehabilitation', 'Rehab Medicine Residency', 'rehab medicine residency'),
  ('Addiction Psychiatry', 'Addiction Psychiatry Residency', 'addiction psychiatry residency'),
  ('Child Psychiatry', 'Child Psychiatry Residency', 'child psychiatry residency'),
  ('Geriatric Psychiatry', 'Geriatric Psychiatry Residency', 'geriatric psychiatry residency'),
  ('Forensic Psychiatry', 'Forensic Psychiatry Residency', 'forensic psychiatry residency'),
  ('Pain Medicine', 'Pain Medicine Residency', 'pain medicine residency'),
  ('Clinical Informatics', 'Clinical Informatics Residency', 'clinical informatics residency'),
  ('Addiction Medicine', 'Addiction Medicine Residency', 'addiction medicine residency'),
  ('Reproductive Endocrinology and Infertility', 'Reproductive Endocrinology', 'reproductive endocrinology'),
  ('Reproductive Endocrinology and Infertility', 'REI', 'rei'),
  ('Gynecologic Oncology', 'Gynecologic Oncology', 'gynecologic oncology'),
  ('Gynecologic Oncology', 'GYN Oncology', 'gyn oncology'),
  ('Gynecologic Oncology', 'Gyn Onc', 'gyn onc'),
  ('Maternal-Fetal Medicine', 'Maternal-Fetal Medicine', 'maternal-fetal medicine'),
  ('Maternal-Fetal Medicine', 'MFM', 'mfm'),
  ('Maternal-Fetal Medicine', 'High Risk OB', 'high risk ob'),
  ('Maternal-Fetal Medicine', 'High Risk Pregnancy', 'high risk pregnancy'),
  ('Urogynecology', 'Urogynecology', 'urogynecology'),
  ('Urogynecology', 'Urogynecology Residency', 'urogynecology residency'),
  ('Urogynecology', 'Female Pelvic Medicine', 'female pelvic medicine'),
  ('Urogynecology', 'FPMRS', 'fpmrs'),
  ('Hospice and Palliative Medicine', 'Palliative Care Medicine', 'palliative care medicine'),
  ('Pediatric Hematology/Oncology', 'Pediatric Heme Onc', 'pediatric heme onc'),
  ('Pediatric Hematology/Oncology', 'Pediatric Heme-Onc', 'pediatric heme onc'),
  ('Pediatric Hematology/Oncology', 'Pediatric Hem-Onc', 'pediatric heme onc'),
  ('Pediatric Cardiology', 'Pediatric Cardiology Residency', 'pediatric cardiology residency'),
  ('Pediatric Critical Care Medicine', 'Pediatric Critical Care Residency', 'pediatric critical care residency'),
  ('Pediatric Emergency Medicine', 'Pediatric EM', 'pediatric em'),
  ('Pediatric Emergency Medicine', 'Pediatric Emergency Med', 'pediatric emergency med'),
  ('Pediatric Gastroenterology', 'Pediatric GI', 'pediatric gi'),
  ('Pediatric Nephrology', 'Pediatric Nephrology Residency', 'pediatric nephrology residency'),
  ('Pediatric Pulmonology', 'Pediatric Pulmonology Residency', 'pediatric pulmonology residency'),
  ('Pediatric Rheumatology', 'Pediatric Rheumatology Residency', 'pediatric rheumatology residency'),
  ('Hematology/Oncology', 'Hem-Onc', 'hem onc'),
  ('Hematology/Oncology', 'Hem-Onc', 'hem-onc'),
  ('Hematology/Oncology', 'Heme/Onc', 'heme/onc'),
  ('Hematology/Oncology', 'Heme Onc Fellowship', 'heme onc fellowship'),
  ('Hematology/Oncology', 'Heme-Onc Fellowship', 'heme onc fellowship'),
  ('Hematology/Oncology', 'Hematology Oncology Fellowship', 'hematology oncology fellowship'),
  ('Gastroenterology', 'GI Fellowship', 'gi fellowship'),
  ('Gastroenterology', 'Gastroenterology Fellowship', 'gastroenterology fellowship'),
  ('Cardiology', 'Cardiology Fellowship', 'cardiology fellowship'),
  ('Cardiology', 'Cardiovascular Disease Fellowship', 'cardiovascular disease fellowship'),
  ('Pulmonology', 'Pulmonology Fellowship', 'pulmonology fellowship'),
  ('Pulmonology', 'Pulmonary Fellowship', 'pulmonary fellowship'),
  ('Pulmonology', 'Pulmonary/Critical Care Fellowship', 'pulmonary critical care fellowship'),
  ('Nephrology', 'Nephrology Fellowship', 'nephrology fellowship'),
  ('Endocrinology', 'Endocrinology Fellowship', 'endocrinology fellowship'),
  ('Endocrinology', 'Diabetes Fellowship', 'diabetes fellowship'),
  ('Infectious Disease', 'ID Fellowship', 'id fellowship'),
  ('Infectious Disease', 'Infectious Disease Fellowship', 'infectious disease fellowship'),
  ('Rheumatology', 'Rheumatology Fellowship', 'rheumatology fellowship'),
  ('Allergy/Immunology', 'Allergy Fellowship', 'allergy fellowship'),
  ('Allergy/Immunology', 'Allergy/Immunology Fellowship', 'allergy/immunology fellowship'),
  ('Geriatric Medicine', 'Geriatric Medicine Fellowship', 'geriatric medicine fellowship'),
  ('Geriatric Medicine', 'Geriatrics Fellowship', 'geriatrics fellowship'),
  ('Sleep Medicine', 'Sleep Medicine Fellowship', 'sleep medicine fellowship'),
  ('Sports Medicine', 'Sports Medicine Fellowship', 'sports medicine fellowship'),
  ('Sports Medicine', 'Sports Med Fellowship', 'sports med fellowship'),
  ('Urology', 'Urology Fellowship', 'urology fellowship'),
  ('Vascular Surgery', 'Vascular Surgery Fellowship', 'vascular surgery fellowship'),
  ('Plastic Surgery', 'Plastic Surgery Fellowship', 'plastic surgery fellowship'),
  ('Plastic Surgery', 'Plastics Fellowship', 'plastics fellowship'),
  ('Radiation Oncology', 'Radiation Oncology Fellowship', 'radiation oncology fellowship'),
  ('Medical Genetics', 'Medical Genetics Fellowship', 'medical genetics fellowship'),
  ('Hospice and Palliative Medicine', 'Hospice Fellowship', 'hospice fellowship'),
  ('Hospice and Palliative Medicine', 'Palliative Medicine Fellowship', 'palliative medicine fellowship'),
  ('Physical Medicine and Rehabilitation', 'PM&R Fellowship', 'pm r fellowship'),
  ('Physical Medicine and Rehabilitation', 'PMR Fellowship', 'pmr fellowship'),
  ('Physical Medicine and Rehabilitation', 'Rehab Medicine Fellowship', 'rehab medicine fellowship'),
  ('Addiction Psychiatry', 'Addiction Psychiatry Fellowship', 'addiction psychiatry fellowship'),
  ('Child Psychiatry', 'Child Psychiatry Fellowship', 'child psychiatry fellowship'),
  ('Geriatric Psychiatry', 'Geriatric Psychiatry Fellowship', 'geriatric psychiatry fellowship'),
  ('Forensic Psychiatry', 'Forensic Psychiatry Fellowship', 'forensic psychiatry fellowship'),
  ('Pain Medicine', 'Pain Medicine Fellowship', 'pain medicine fellowship'),
  ('Clinical Informatics', 'Clinical Informatics Fellowship', 'clinical informatics fellowship'),
  ('Addiction Medicine', 'Addiction Medicine Fellowship', 'addiction medicine fellowship'),
  ('Reproductive Endocrinology and Infertility', 'REI Fellowship', 'rei fellowship'),
  ('Reproductive Endocrinology and Infertility', 'Reproductive Endocrinology Fellowship', 'reproductive endocrinology fellowship'),
  ('Gynecologic Oncology', 'GYN Oncology Fellowship', 'gyn oncology fellowship'),
  ('Gynecologic Oncology', 'Gynecologic Oncology Fellowship', 'gynecologic oncology fellowship'),
  ('Maternal-Fetal Medicine', 'MFM Fellowship', 'mfm fellowship'),
  ('Maternal-Fetal Medicine', 'Maternal-Fetal Medicine Fellowship', 'maternal-fetal medicine fellowship'),
  ('Urogynecology', 'Urogynecology Fellowship', 'urogynecology fellowship'),
  ('Urogynecology', 'Female Pelvic Medicine Fellowship', 'female pelvic medicine fellowship'),
  ('Hospice and Palliative Medicine', 'Palliative Care Fellowship', 'palliative care fellowship'),
  ('Pediatric Hematology/Oncology', 'Pediatric Heme Onc Fellowship', 'pediatric heme onc fellowship'),
  ('Pediatric Hematology/Oncology', 'Pediatric Hem-Onc Fellowship', 'pediatric heme onc fellowship'),
  ('Pediatric Cardiology', 'Pediatric Cardiology Fellowship', 'pediatric cardiology fellowship'),
  ('Pediatric Critical Care Medicine', 'Pediatric Critical Care Fellowship', 'pediatric critical care fellowship'),
  ('Pediatric Emergency Medicine', 'Pediatric EM Fellowship', 'pediatric em fellowship'),
  ('Pediatric Emergency Medicine', 'Pediatric Emergency Med Fellowship', 'pediatric emergency med fellowship'),
  ('Pediatric Gastroenterology', 'Pediatric GI Fellowship', 'pediatric gi fellowship'),
  ('Pediatric Nephrology', 'Pediatric Nephrology Fellowship', 'pediatric nephrology fellowship'),
  ('Pediatric Pulmonology', 'Pediatric Pulmonology Fellowship', 'pediatric pulmonology fellowship'),
  ('Pediatric Rheumatology', 'Pediatric Rheumatology Fellowship', 'pediatric rheumatology fellowship'),
  ('Geriatric Medicine', 'Geriatric Medicine Fellowship Program', 'geriatric medicine fellowship program'),
  ('Pediatrics', 'Pediatric Residency', 'pediatric residency'),
  ('Pediatrics', 'Ped Residency', 'ped residency'),
  ('Family Medicine', 'Family Med Residency', 'family med residency'),
  ('Family Medicine', 'Family Practice Residency', 'family practice residency'),
  ('Emergency Medicine', 'Emergency Medicine Residency', 'emergency medicine residency'),
  ('Emergency Medicine', 'EM Residency Program', 'em residency program'),
  ('Surgery', 'Surgery Residency Program', 'surgery residency program'),
  ('Surgery', 'General Surgery Residency Program', 'general surgery residency program'),
  ('Psychiatry', 'Psychiatry Residency Program', 'psychiatry residency program'),
  ('Neurology', 'Neurology Residency Program', 'neurology residency program'),
  ('Anesthesiology', 'Anesthesiology Residency Program', 'anesthesiology residency program'),
  ('Anesthesiology', 'Anesthesia Residency', 'anesthesia residency'),
  ('Radiology', 'Radiology Residency Program', 'radiology residency program'),
  ('Radiology', 'Diagnostic Radiology Residency', 'diagnostic radiology residency'),
  ('Pathology', 'Pathology Residency Program', 'pathology residency program'),
  ('Pathology', 'Anatomic Pathology', 'anatomic pathology'),
  ('Pathology', 'Clinical Pathology', 'clinical pathology'),
  ('Dermatology', 'Dermatology Residency Program', 'dermatology residency program'),
  ('Ophthalmology', 'Ophthalmology Residency Program', 'ophthalmology residency program'),
  ('Otolaryngology', 'Otolaryngology Residency', 'otolaryngology residency'),
  ('Otolaryngology', 'ENT Residency Program', 'ent residency program'),
  ('Urology', 'Urology Residency Program', 'urology residency program'),
  ('Vascular Surgery', 'Vascular Surgery Residency Program', 'vascular surgery residency program'),
  ('Plastic Surgery', 'Plastic Surgery Residency Program', 'plastic surgery residency program'),
  ('Plastic Surgery', 'Plastic Surgery Residency', 'plastic surgery residency'),
  ('Radiation Oncology', 'Radiation Oncology Residency Program', 'radiation oncology residency program'),
  ('Medical Genetics', 'Medical Genetics Residency Program', 'medical genetics residency program'),
  ('Hospice and Palliative Medicine', 'Hospice and Palliative Medicine Residency', 'hospice and palliative medicine residency'),
  ('Hospice and Palliative Medicine', 'Palliative Medicine Residency', 'palliative medicine residency'),
  ('Physical Medicine and Rehabilitation', 'PM&R Residency Program', 'pm r residency program'),
  ('Physical Medicine and Rehabilitation', 'PMR Residency Program', 'pmr residency program'),
  ('Physical Medicine and Rehabilitation', 'Physical Medicine Residency', 'physical medicine residency'),
  ('Physical Medicine and Rehabilitation', 'Rehabilitation Medicine Residency', 'rehabilitation medicine residency'),
  ('Addiction Psychiatry', 'Addiction Psychiatry Residency Program', 'addiction psychiatry residency program'),
  ('Child Psychiatry', 'Child Psychiatry Residency Program', 'child psychiatry residency program'),
  ('Geriatric Psychiatry', 'Geriatric Psychiatry Residency Program', 'geriatric psychiatry residency program'),
  ('Forensic Psychiatry', 'Forensic Psychiatry Residency Program', 'forensic psychiatry residency program'),
  ('Pain Medicine', 'Pain Medicine Residency Program', 'pain medicine residency program'),
  ('Clinical Informatics', 'Clinical Informatics Residency Program', 'clinical informatics residency program'),
  ('Addiction Medicine', 'Addiction Medicine Residency Program', 'addiction medicine residency program'),
  ('Reproductive Endocrinology and Infertility', 'Reproductive Endocrinology Residency', 'reproductive endocrinology residency'),
  ('Reproductive Endocrinology and Infertility', 'REI Residency', 'rei residency'),
  ('Gynecologic Oncology', 'Gynecologic Oncology Residency', 'gynecologic oncology residency'),
  ('Maternal-Fetal Medicine', 'Maternal-Fetal Medicine Residency', 'maternal-fetal medicine residency'),
  ('Maternal-Fetal Medicine', 'MFM Residency', 'mfm residency'),
  ('Urogynecology', 'Urogynecology Residency Program', 'urogynecology residency program'),
  ('Pediatric Hematology/Oncology', 'Pediatric Heme Onc Residency', 'pediatric heme onc residency'),
  ('Pediatric Hematology/Oncology', 'Pediatric Hem-Onc Residency', 'pediatric hem-onc residency'),
  ('Pediatric Cardiology', 'Pediatric Cardiology Residency Program', 'pediatric cardiology residency program'),
  ('Pediatric Critical Care Medicine', 'Pediatric Critical Care Residency Program', 'pediatric critical care residency program'),
  ('Pediatric Emergency Medicine', 'Pediatric Emergency Medicine Residency', 'pediatric emergency medicine residency'),
  ('Pediatric Emergency Medicine', 'Pediatric EM Residency', 'pediatric em residency'),
  ('Pediatric Gastroenterology', 'Pediatric GI Residency', 'pediatric gi residency'),
  ('Pediatric Nephrology', 'Pediatric Nephrology Residency Program', 'pediatric nephrology residency program'),
  ('Pediatric Pulmonology', 'Pediatric Pulmonology Residency Program', 'pediatric pulmonology residency program'),
  ('Pediatric Rheumatology', 'Pediatric Rheumatology Residency Program', 'pediatric rheumatology residency program'),
  ('Internal Medicine', 'IM categorical', 'im categorical'),
  ('Internal Medicine', 'IM primary care', 'im primary care'),
  ('Internal Medicine', 'Internal medicine preliminary', 'internal medicine preliminary'),
  ('Internal Medicine', 'IM prelim', 'im prelim'),
  ('General Surgery', 'General Surgery Categorical', 'general surgery categorical'),
  ('General Surgery', 'General Surgery Preliminary', 'general surgery preliminary'),
  ('Family Medicine', 'Family Medicine Categorical', 'family medicine categorical'),
  ('Family Medicine', 'FM Categorical', 'fm categorical'),
  ('Pediatrics', 'Pediatrics Categorical', 'pediatrics categorical'),
  ('Pediatrics', 'Peds Categorical', 'peds categorical'),
  ('Obstetrics and Gynecology', 'OB/GYN Categorical', 'ob/gyn categorical'),
  ('Obstetrics and Gynecology', 'Obstetrics and Gynecology Categorical', 'obstetrics and gynecology categorical'),
  ('Psychiatry', 'Psychiatry Categorical', 'psychiatry categorical'),
  ('Psychiatry', 'Psych Categorical', 'psych categorical'),
  ('Emergency Medicine', 'Emergency Medicine Categorical', 'emergency medicine categorical'),
  ('Anesthesiology', 'Anesthesiology Categorical', 'anesthesiology categorical'),
  ('Radiology', 'Radiology Categorical', 'radiology categorical'),
  ('Radiation Oncology', 'Radiation Oncology Categorical', 'radiation oncology categorical'),
  ('Neurology', 'Neurology Categorical', 'neurology categorical'),
  ('Neurology', 'Neuro Categorical', 'neuro categorical'),
  ('Dermatology', 'Dermatology Categorical', 'dermatology categorical'),
  ('Pathology', 'Pathology Categorical', 'pathology categorical'),
  ('Ophthalmology', 'Ophthalmology Categorical', 'ophthalmology categorical'),
  ('Otolaryngology', 'Otolaryngology Categorical', 'otolaryngology categorical'),
  ('Urology', 'Urology Categorical', 'urology categorical'),
  ('Orthopaedic Surgery', 'Orthopaedic Surgery Categorical', 'orthopaedic surgery categorical'),
  ('Orthopaedic Surgery', 'Orthopedic Surgery Categorical', 'orthopedic surgery categorical'),
  ('Orthopaedic Surgery', 'Ortho Categorical', 'ortho categorical'),
  ('Orthopaedic Surgery', 'Orthopedics Categorical', 'orthopedics categorical'),
  ('Vascular Surgery', 'Vascular Surgery Categorical', 'vascular surgery categorical'),
  ('Plastic Surgery', 'Plastic Surgery Categorical', 'plastic surgery categorical'),
  ('Plastic Surgery', 'Plastics Categorical', 'plastics categorical'),
  ('Physical Medicine and Rehabilitation', 'PM&R Categorical', 'pm r categorical'),
  ('Physical Medicine and Rehabilitation', 'PMR Categorical', 'pmr categorical'),
  ('Physical Medicine and Rehabilitation', 'Physical Medicine Categorical', 'physical medicine categorical'),
  ('Geriatric Medicine', 'Geriatric Medicine Categorical', 'geriatric medicine categorical'),
  ('Geriatric Medicine', 'Geriatrics Categorical', 'geriatrics categorical'),
  ('Hospice and Palliative Medicine', 'Hospice Categorical', 'hospice categorical'),
  ('Hospice and Palliative Medicine', 'Palliative Categorical', 'palliative categorical'),
  ('Sleep Medicine', 'Sleep Medicine Categorical', 'sleep medicine categorical'),
  ('Sports Medicine', 'Sports Medicine Categorical', 'sports medicine categorical'),
  ('Geriatric Psychiatry', 'Geriatric Psychiatry Categorical', 'geriatric psychiatry categorical'),
  ('Child Psychiatry', 'Child Psychiatry Categorical', 'child psychiatry categorical'),
  ('Addiction Psychiatry', 'Addiction Psychiatry Categorical', 'addiction psychiatry categorical'),
  ('Forensic Psychiatry', 'Forensic Psychiatry Categorical', 'forensic psychiatry categorical'),
  ('Pain Medicine', 'Pain Medicine Categorical', 'pain medicine categorical'),
  ('Clinical Informatics', 'Clinical Informatics Categorical', 'clinical informatics categorical'),
  ('Addiction Medicine', 'Addiction Medicine Categorical', 'addiction medicine categorical'),
  ('Hospice and Palliative Medicine', 'Hospice Residency Program', 'hospice residency program'),
  ('Hospice and Palliative Medicine', 'Palliative Medicine Residency Program', 'palliative medicine residency program'),
  ('Physical Medicine and Rehabilitation', 'PM&R Residency Program', 'pm r residency program'),
  ('Physical Medicine and Rehabilitation', 'PMR Residency Program', 'pmr residency program'),
  ('Physical Medicine and Rehabilitation', 'Physical Medicine Residency Program', 'physical medicine residency program'),
  ('Physical Medicine and Rehabilitation', 'Rehabilitation Medicine Residency Program', 'rehabilitation medicine residency program'),
  ('Addiction Psychiatry', 'Addiction Psychiatry Residency Program', 'addiction psychiatry residency program'),
  ('Child Psychiatry', 'Child Psychiatry Residency Program', 'child psychiatry residency program'),
  ('Geriatric Psychiatry', 'Geriatric Psychiatry Residency Program', 'geriatric psychiatry residency program'),
  ('Forensic Psychiatry', 'Forensic Psychiatry Residency Program', 'forensic psychiatry residency program'),
  ('Pain Medicine', 'Pain Medicine Residency Program', 'pain medicine residency program'),
  ('Clinical Informatics', 'Clinical Informatics Residency Program', 'clinical informatics residency program'),
  ('Addiction Medicine', 'Addiction Medicine Residency Program', 'addiction medicine residency program'),
  ('Reproductive Endocrinology and Infertility', 'Reproductive Endocrinology Residency', 'reproductive endocrinology residency'),
  ('Reproductive Endocrinology and Infertility', 'REI Residency', 'rei residency'),
  ('Gynecologic Oncology', 'Gynecologic Oncology Residency', 'gynecologic oncology residency'),
  ('Maternal-Fetal Medicine', 'Maternal-Fetal Medicine Residency', 'maternal-fetal medicine residency'),
  ('Maternal-Fetal Medicine', 'MFM Residency', 'mfm residency'),
  ('Urogynecology', 'Urogynecology Residency Program', 'urogynecology residency program'),
  ('Pediatric Hematology/Oncology', 'Pediatric Heme Onc Residency', 'pediatric heme onc residency'),
  ('Pediatric Hematology/Oncology', 'Pediatric Hem-Onc Residency', 'pediatric hem-onc residency'),
  ('Pediatric Cardiology', 'Pediatric Cardiology Residency Program', 'pediatric cardiology residency program'),
  ('Pediatric Critical Care Medicine', 'Pediatric Critical Care Residency Program', 'pediatric critical care residency program'),
  ('Pediatric Emergency Medicine', 'Pediatric Emergency Medicine Residency', 'pediatric emergency medicine residency'),
  ('Pediatric Emergency Medicine', 'Pediatric EM Residency', 'pediatric em residency'),
  ('Pediatric Gastroenterology', 'Pediatric GI Residency', 'pediatric gi residency'),
  ('Pediatric Nephrology', 'Pediatric Nephrology Residency Program', 'pediatric nephrology residency program'),
  ('Pediatric Pulmonology', 'Pediatric Pulmonology Residency Program', 'pediatric pulmonology residency program'),
  ('Pediatric Rheumatology', 'Pediatric Rheumatology Residency Program', 'pediatric rheumatology residency program')
ON CONFLICT (normalized_alias) DO NOTHING;

-- 6. Grant access
GRANT SELECT ON public.specialty_aliases TO anon, authenticated;
