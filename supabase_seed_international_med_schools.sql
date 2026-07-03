-- Seed international medical schools into programs
-- Generated from src/data/international-medical-schools.js
BEGIN;

-- Extend program_type to include med_school and add missing columns
DROP INDEX IF EXISTS idx_programs_program_type;
ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_program_type_check;
ALTER TABLE programs ADD CONSTRAINT programs_program_type_check CHECK (program_type IN ('residency','fellowship','observership','research','elective','med_school'));
CREATE INDEX IF NOT EXISTS idx_programs_program_type ON programs(program_type);
ALTER TABLE programs ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS is_acgme_accredited boolean DEFAULT false;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS ecfmg_pathway_eligible boolean DEFAULT false;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS description text;

-- Insert programs
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('AIIMS New Delhi', 'New Delhi', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('JIPMER', 'Puducherry', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('CMC Vellore', 'Vellore', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Armed Forces Medical College', 'Bengaluru', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Maulana Azad Medical College', 'New Delhi', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Seth Gordhandas Sunderdas Medical College', 'Mumbai', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Bangalore Medical College & Research Institute', 'Bengaluru', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Grant Medical College', 'Mumbai', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Madras Medical College', 'Chennai', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Postgraduate Institute of Medical Education & Research', 'Chandigarh', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Sanjay Gandhi Postgraduate Institute', 'Lucknow', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Kasturba Medical College', 'Manipal', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Christian Medical College', 'Vellore', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Government Medical College', 'Nagpur', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Topiwala National Medical College', 'Mumbai', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Osmania Medical College', 'Hyderabad', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Lady Hardinge Medical College', 'New Delhi', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('AIIMS Bhopal', 'Bhopal', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('AIIMS Bhubaneswar', 'Bhubaneswar', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('AIIMS Rishikesh', 'Rishikesh', NULL, 'India', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Aga Khan University', 'Karachi', NULL, 'Pakistan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('King Edward Medical University', 'Lahore', NULL, 'Pakistan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Dow Medical College', 'Karachi', NULL, 'Pakistan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Allama Iqbal Medical College', 'Lahore', NULL, 'Pakistan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Punjab Medical College', 'Faisalabad', NULL, 'Pakistan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Services Institute of Medical Sciences', 'Lahore', NULL, 'Pakistan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Baqai Medical University', 'Karachi', NULL, 'Pakistan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Ziauddin Medical College', 'Karachi', NULL, 'Pakistan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Shifa Tameer-e-Millat University', 'Islamabad', NULL, 'Pakistan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Rawalpindi Medical University', 'Rawalpindi', NULL, 'Pakistan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Khyber Medical College', 'Peshawar', NULL, 'Pakistan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Ayub Medical College', 'Abbottabad', NULL, 'Pakistan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Sindh Medical College', 'Karachi', NULL, 'Pakistan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Ibadan', 'Ibadan', NULL, 'Nigeria', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Lagos', 'Lagos', NULL, 'Nigeria', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Obafemi Awolowo University', 'Ile-Ife', NULL, 'Nigeria', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Nigeria', 'Enugu', NULL, 'Nigeria', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Ahmadu Bello University', 'Zaria', NULL, 'Nigeria', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Jos', 'Jos', NULL, 'Nigeria', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Lagos State University', 'Lagos', NULL, 'Nigeria', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Babcock University', 'Ilishan-Remo', NULL, 'Nigeria', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Igbinedion University', 'Benin City', NULL, 'Nigeria', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Ambrose Alli University', 'Ekpoma', NULL, 'Nigeria', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of the Philippines', 'Manila', NULL, 'Philippines', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Santo Tomas', 'Manila', NULL, 'Philippines', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Far Eastern University', 'Quezon City', NULL, 'Philippines', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of the East', 'Manila', NULL, 'Philippines', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('De La Salle Medical and Health Sciences Institute', 'Cavite', NULL, 'Philippines', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Cebu Institute of Medicine', 'Cebu City', NULL, 'Philippines', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Ateneo School of Medicine and Public Health', 'Pasig', NULL, 'Philippines', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Davao Medical School Foundation', 'Davao City', NULL, 'Philippines', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Our Lady of Fatima University', 'Valenzuela', NULL, 'Philippines', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Cairo University', 'Cairo', NULL, 'Egypt', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Ain Shams University', 'Cairo', NULL, 'Egypt', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Alexandria University', 'Alexandria', NULL, 'Egypt', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Mansoura University', 'Mansoura', NULL, 'Egypt', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Suez Canal University', 'Ismailia', NULL, 'Egypt', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Assiut University', 'Assiut', NULL, 'Egypt', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Tanta University', 'Tanta', NULL, 'Egypt', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Zagazig University', 'Zagazig', NULL, 'Egypt', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Benha University', 'Cairo', NULL, 'Egypt', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Helwan University', 'Helwan', NULL, 'Egypt', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Fayoum University', 'Fayoum', NULL, 'Egypt', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Minia University', 'Minya', NULL, 'Egypt', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('UNAM', 'Mexico City', NULL, 'Mexico', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('IPN', 'Mexico City', NULL, 'Mexico', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('UAG', 'Guadalajara', NULL, 'Mexico', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('TEC de Monterrey', 'Monterrey', NULL, 'Mexico', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad de Guanajuato', 'Guanajuato', NULL, 'Mexico', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad Autónoma de San Luis Potosí', 'San Luis Potosí', NULL, 'Mexico', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad Michoacana', 'Morelia', NULL, 'Mexico', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidade de São Paulo', 'São Paulo', NULL, 'Brazil', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidade Federal do Rio de Janeiro', 'Rio de Janeiro', NULL, 'Brazil', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidade Federal de Minas Gerais', 'Belo Horizonte', NULL, 'Brazil', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidade Federal do Rio Grande do Sul', 'Porto Alegre', NULL, 'Brazil', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidade Estadual de Campinas', 'Campinas', NULL, 'Brazil', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Pontifícia Universidade Católica do Rio Grande do Sul', 'Porto Alegre', NULL, 'Brazil', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidade Federal de Santa Catarina', 'Florianópolis', NULL, 'Brazil', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidade Federal da Bahia', 'Salvador', NULL, 'Brazil', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad Nacional de Colombia', 'Bogotá', NULL, 'Colombia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad de Antioquia', 'Medellín', NULL, 'Colombia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Pontificia Universidad Javeriana', 'Bogotá', NULL, 'Colombia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad del Rosario', 'Bogotá', NULL, 'Colombia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad de Cartagena', 'Cartagena', NULL, 'Colombia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Peking Union Medical College', 'Beijing', NULL, 'China', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Peking University Health Science Center', 'Beijing', NULL, 'China', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Fudan University Shanghai Medical College', 'Shanghai', NULL, 'China', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Shanghai Jiao Tong University School of Medicine', 'Shanghai', NULL, 'China', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Zhejiang University School of Medicine', 'Hangzhou', NULL, 'China', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Sichuan University West China Medical School', 'Chengdu', NULL, 'China', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Sun Yat-sen University', 'Guangzhou', NULL, 'China', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Capital Medical University', 'Beijing', NULL, 'China', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Dhaka Medical College', 'Dhaka', NULL, 'Bangladesh', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Sher-e-Bangla Medical College', 'Barisal', NULL, 'Bangladesh', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Sir Salimullah Medical College', 'Dhaka', NULL, 'Bangladesh', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Rajshahi Medical College', 'Rajshahi', NULL, 'Bangladesh', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Bangabandhu Sheikh Mujib Medical University', 'Dhaka', NULL, 'Bangladesh', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Chittagong Medical College', 'Chittagong', NULL, 'Bangladesh', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Tehran University of Medical Sciences', 'Tehran', NULL, 'Iran', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Shahid Beheshti University of Medical Sciences', 'Tehran', NULL, 'Iran', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Mashhad University of Medical Sciences', 'Mashhad', NULL, 'Iran', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Isfahan University of Medical Sciences', 'Isfahan', NULL, 'Iran', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Iran University of Medical Sciences', 'Tehran', NULL, 'Iran', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Baghdad College of Medicine', 'Baghdad', NULL, 'Iraq', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Basrah College of Medicine', 'Basra', NULL, 'Iraq', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Kufa University', 'Najaf', NULL, 'Iraq', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Mosul', 'Mosul', NULL, 'Iraq', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Damascus University Faculty of Medicine', 'Damascus', NULL, 'Syria', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Aleppo', 'Aleppo', NULL, 'Syria', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Tishreen University', 'Latakia', NULL, 'Syria', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('American University of Beirut', 'Beirut', NULL, 'Lebanon', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Lebanese American University', 'Byblos', NULL, 'Lebanon', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Saint Joseph University', 'Beirut', NULL, 'Lebanon', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Balamand', 'Tripoli', NULL, 'Lebanon', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Jordan', 'Amman', NULL, 'Jordan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Jordan University of Science & Technology', 'Irbid', NULL, 'Jordan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('King Saud University', 'Riyadh', NULL, 'Saudi Arabia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('King Abdulaziz University', 'Jeddah', NULL, 'Saudi Arabia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('King Fahd Medical City', 'Riyadh', NULL, 'Saudi Arabia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Imam Abdulrahman Bin Faisal University', 'Dammam', NULL, 'Saudi Arabia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Mohammed Bin Rashid University', 'Dubai', NULL, 'UAE', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('United Arab Emirates University', 'Al Ain', NULL, 'UAE', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Khalifa University', 'Abu Dhabi', NULL, 'UAE', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Oxford', 'Oxford', NULL, 'United Kingdom', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Cambridge', 'Cambridge', NULL, 'United Kingdom', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Imperial College London', 'London', NULL, 'United Kingdom', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Edinburgh', 'Edinburgh', NULL, 'United Kingdom', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Glasgow', 'Glasgow', NULL, 'United Kingdom', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Manchester', 'Manchester', NULL, 'United Kingdom', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Birmingham', 'Birmingham', NULL, 'United Kingdom', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Newcastle University', 'Newcastle upon Tyne', NULL, 'United Kingdom', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Liverpool', 'Liverpool', NULL, 'United Kingdom', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Sheffield', 'Sheffield', NULL, 'United Kingdom', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Leeds', 'Leeds', NULL, 'United Kingdom', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Aberdeen', 'Aberdeen', NULL, 'United Kingdom', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Southampton', 'Southampton', NULL, 'United Kingdom', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Toronto', 'Toronto', NULL, 'Canada', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('McMaster University', 'Hamilton', NULL, 'Canada', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Ottawa', 'Ottawa', NULL, 'Canada', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Alberta', 'Edmonton', NULL, 'Canada', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Calgary', 'Calgary', NULL, 'Canada', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('McGill University', 'Montreal', NULL, 'Canada', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Dalhousie University', 'Halifax', NULL, 'Canada', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Western University', 'London, ON', NULL, 'Canada', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Manitoba', 'Winnipeg', NULL, 'Canada', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Heidelberg University', 'Heidelberg', NULL, 'Germany', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Ludwig Maximilian University of Munich', 'Munich', NULL, 'Germany', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Charité – Universitätsmedizin Berlin', 'Berlin', NULL, 'Germany', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Freiburg', 'Freiburg', NULL, 'Germany', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Tübingen', 'Tübingen', NULL, 'Germany', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Cologne', 'Cologne', NULL, 'Germany', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Hamburg-Eppendorf', 'Hamburg', NULL, 'Germany', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Bonn', 'Bonn', NULL, 'Germany', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Münster', 'Münster', NULL, 'Germany', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Frankfurt', 'Frankfurt', NULL, 'Germany', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Sorbonne University', 'Paris', NULL, 'France', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Université Paris Cité', 'Paris', NULL, 'France', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Sorbonne Paris Nord University', 'Paris', NULL, 'France', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Aix-Marseille University', 'Marseille', NULL, 'France', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Lyon', 'Lyon', NULL, 'France', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Toulouse', 'Toulouse', NULL, 'France', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Strasbourg', 'Strasbourg', NULL, 'France', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Lille', 'Lille', NULL, 'France', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Bordeaux', 'Bordeaux', NULL, 'France', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Nantes', 'Nantes', NULL, 'France', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Sapienza University of Rome', 'Rome', NULL, 'Italy', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Bologna', 'Bologna', NULL, 'Italy', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Milan', 'Milan', NULL, 'Italy', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Padua', 'Padua', NULL, 'Italy', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Naples Federico II', 'Naples', NULL, 'Italy', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Florence', 'Florence', NULL, 'Italy', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Turin', 'Turin', NULL, 'Italy', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Barcelona', 'Barcelona', NULL, 'Spain', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Autonomous University of Barcelona', 'Barcelona', NULL, 'Spain', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Complutense University of Madrid', 'Madrid', NULL, 'Spain', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Navarra', 'Pamplona', NULL, 'Spain', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Valencia', 'Valencia', NULL, 'Spain', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Seville', 'Seville', NULL, 'Spain', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Granada', 'Granada', NULL, 'Spain', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Jagiellonian University Medical College', 'Kraków', NULL, 'Poland', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Medical University of Warsaw', 'Warsaw', NULL, 'Poland', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Poznań University of Medical Sciences', 'Poznań', NULL, 'Poland', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Medical University of Gdańsk', 'Gdańsk', NULL, 'Poland', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Wrocław Medical University', 'Wrocław', NULL, 'Poland', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Ludwik Rydygier Collegium Medicum', 'Bydgoszcz', NULL, 'Poland', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Bogomolets National Medical University', 'Kyiv', NULL, 'Ukraine', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Taras Shevchenko National University', 'Kyiv', NULL, 'Ukraine', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Dnipro State Medical University', 'Dnipro', NULL, 'Ukraine', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Kharkiv National Medical University', 'Kharkiv', NULL, 'Ukraine', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Ivano-Frankivsk National Medical University', 'Ivano-Frankivsk', NULL, 'Ukraine', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Lviv Medical University', 'Lviv', NULL, 'Ukraine', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Moscow State Medical University', 'Moscow', NULL, 'Russia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('First Moscow State Medical University', 'Moscow', NULL, 'Russia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Saint Petersburg State Medical University', 'Saint Petersburg', NULL, 'Russia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Sechenov University', 'Moscow', NULL, 'Russia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Novosibirsk State Medical University', 'Novosibirsk', NULL, 'Russia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Medicine and Pharmacy Cluj-Napoca', 'Cluj-Napoca', NULL, 'Romania', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Carol Davila University of Medicine and Pharmacy', 'Bucharest', NULL, 'Romania', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Victor Babeș University', 'Timișoara', NULL, 'Romania', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Oradea Medical School', 'Oradea', NULL, 'Romania', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Istanbul University', 'Istanbul', NULL, 'Turkey', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Hacettepe University', 'Ankara', NULL, 'Turkey', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Ankara University', 'Ankara', NULL, 'Turkey', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Ege University', 'Izmir', NULL, 'Turkey', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Uludağ University', 'Bursa', NULL, 'Turkey', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('National and Kapodistrian University of Athens', 'Athens', NULL, 'Greece', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Aristotle University of Thessaloniki', 'Thessaloniki', NULL, 'Greece', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Crete', 'Crete', NULL, 'Greece', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Patras', 'Patras', NULL, 'Greece', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Lisbon', 'Lisbon', NULL, 'Portugal', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Porto', 'Porto', NULL, 'Portugal', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Coimbra', 'Coimbra', NULL, 'Portugal', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('NOVA University of Lisbon', 'Lisbon', NULL, 'Portugal', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad de Buenos Aires', 'Buenos Aires', NULL, 'Argentina', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad Austral', 'Buenos Aires', NULL, 'Argentina', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad Nacional de La Plata', 'La Plata', NULL, 'Argentina', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad Católica de Córdoba', 'Córdoba', NULL, 'Argentina', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad de Mendoza', 'Mendoza', NULL, 'Argentina', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad de Chile', 'Santiago', NULL, 'Chile', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Pontificia Universidad Católica de Chile', 'Santiago', NULL, 'Chile', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad de Concepción', 'Concepción', NULL, 'Chile', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad Austral de Chile', 'Valdivia', NULL, 'Chile', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad Nacional Mayor de San Marcos', 'Lima', NULL, 'Peru', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad Peruana Cayetano Heredia', 'Lima', NULL, 'Peru', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad Científica del Sur', 'Lima', NULL, 'Peru', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Central University of Venezuela', 'Caracas', NULL, 'Venezuela', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad de Los Andes', 'Mérida', NULL, 'Venezuela', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad del Zulia', 'Maracaibo', NULL, 'Venezuela', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad Central del Ecuador', 'Quito', NULL, 'Ecuador', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad de Guayaquil', 'Guayaquil', NULL, 'Ecuador', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad San Francisco de Quito', 'Quito', NULL, 'Ecuador', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Addis Ababa University', 'Addis Ababa', NULL, 'Ethiopia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Jimma University', 'Jimma', NULL, 'Ethiopia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Hawassa University', 'Hawassa', NULL, 'Ethiopia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Bahirdar University', 'Bahir Dar', NULL, 'Ethiopia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Debremarkos University', 'Debre Markos', NULL, 'Ethiopia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Ghana', 'Accra', NULL, 'Ghana', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Kwame Nkrumah University of Science and Technology', 'Kumasi', NULL, 'Ghana', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Cape Coast', 'Cape Coast', NULL, 'Ghana', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Accra College of Medicine', 'Accra', NULL, 'Ghana', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Nairobi', 'Nairobi', NULL, 'Kenya', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Moi University', 'Eldoret', NULL, 'Kenya', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Kenyatta University', 'Nairobi', NULL, 'Kenya', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Aga Khan University', 'Nairobi', NULL, 'Kenya', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Cape Town', 'Cape Town', NULL, 'South Africa', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of the Witwatersrand', 'Johannesburg', NULL, 'South Africa', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Pretoria', 'Pretoria', NULL, 'South Africa', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Stellenbosch University', 'Stellenbosch', NULL, 'South Africa', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of KwaZulu-Natal', 'Durban', NULL, 'South Africa', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Makerere University', 'Kampala', NULL, 'Uganda', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Mbarara University of Science and Technology', 'Mbarara', NULL, 'Uganda', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Kampala International University', 'Kampala', NULL, 'Uganda', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Dar es Salaam', 'Dar es Salaam', NULL, 'Tanzania', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Muhimbili University of Health and Allied Sciences', 'Dar es Salaam', NULL, 'Tanzania', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Kilimanjaro Christian Medical University College', 'Moshi', NULL, 'Tanzania', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Khartoum', 'Khartoum', NULL, 'Sudan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Omdurman Islamic University', 'Omdurman', NULL, 'Sudan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Sudan University of Science and Technology', 'Khartoum', NULL, 'Sudan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Tunis El Manar', 'Tunis', NULL, 'Tunisia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Sfax', 'Sfax', NULL, 'Tunisia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Sousse', 'Sousse', NULL, 'Tunisia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Faculty of Medicine of Monastir', 'Monastir', NULL, 'Tunisia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Sydney', 'Sydney', NULL, 'Australia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Melbourne', 'Melbourne', NULL, 'Australia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Monash University', 'Melbourne', NULL, 'Australia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Queensland', 'Brisbane', NULL, 'Australia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Western Australia', 'Perth', NULL, 'Australia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Australian National University', 'Canberra', NULL, 'Australia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Adelaide', 'Adelaide', NULL, 'Australia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Newcastle', 'Newcastle', NULL, 'Australia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Auckland', 'Auckland', NULL, 'New Zealand', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Otago', 'Dunedin', NULL, 'New Zealand', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Tokyo', 'Tokyo', NULL, 'Japan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Kyoto University', 'Kyoto', NULL, 'Japan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Osaka University', 'Osaka', NULL, 'Japan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Hokkaido University', 'Sapporo', NULL, 'Japan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Tohoku University', 'Sendai', NULL, 'Japan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Nagoya University', 'Nagoya', NULL, 'Japan', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Seoul National University', 'Seoul', NULL, 'South Korea', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Yonsei University', 'Seoul', NULL, 'South Korea', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Korea University', 'Seoul', NULL, 'South Korea', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Sungkyunkwan University', 'Seoul', NULL, 'South Korea', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Pusan National University', 'Busan', NULL, 'South Korea', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Indonesia', 'Jakarta', NULL, 'Indonesia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Gadjah Mada University', 'Yogyakarta', NULL, 'Indonesia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universitas Airlangga', 'Surabaya', NULL, 'Indonesia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Padjadjaran University', 'Bandung', NULL, 'Indonesia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Hanoi Medical University', 'Hanoi', NULL, 'Vietnam', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Vietnam National University Ho Chi Minh City', 'Ho Chi Minh City', NULL, 'Vietnam', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Medicine and Pharmacy Hue', 'Hue', NULL, 'Vietnam', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Mahidol University', 'Bangkok', NULL, 'Thailand', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Chulalongkorn University', 'Bangkok', NULL, 'Thailand', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Prince of Songkla University', 'Hat Yai', NULL, 'Thailand', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Khon Kaen University', 'Khon Kaen', NULL, 'Thailand', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Malaya', 'Kuala Lumpur', NULL, 'Malaysia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universiti Kebangsaan Malaysia', 'Kuala Lumpur', NULL, 'Malaysia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universiti Sains Malaysia', 'Penang', NULL, 'Malaysia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universiti Putra Malaysia', 'Serdang', NULL, 'Malaysia', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Colombo', 'Colombo', NULL, 'Sri Lanka', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Peradeniya', 'Peradeniya', NULL, 'Sri Lanka', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Jaffna', 'Jaffna', NULL, 'Sri Lanka', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Tribhuvan University', 'Kathmandu', NULL, 'Nepal', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Kathmandu University', 'Dhulikhel', NULL, 'Nepal', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('BP Koirala Institute of Health Sciences', 'Dharan', NULL, 'Nepal', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad Autónoma de Santo Domingo', 'Santo Domingo', NULL, 'Dominican Republic', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad Iberoamericana', 'Santo Domingo', NULL, 'Dominican Republic', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of Costa Rica', 'San José', NULL, 'Costa Rica', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('Universidad Latina de Costa Rica', 'San José', NULL, 'Costa Rica', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');
INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)
VALUES ('University of the West Indies', 'Kingston', NULL, 'Jamaica', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');

COMMIT;
