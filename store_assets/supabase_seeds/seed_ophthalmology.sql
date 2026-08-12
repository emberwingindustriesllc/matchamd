-- ============================================================
-- OPHTHALMOLOGY RESIDENCY PROGRAMS SEED
-- Source: residencyprogramslist.com, residencyadvisor.com,
--         AMA FREIDA, ACGME program search
-- ACGME specialty code: 240 (Ophthalmology)
-- ~126 ACGME-accredited ophthalmology residency programs
-- Program type: residency
-- Specialty: Ophthalmology
-- ============================================================

INSERT INTO programs (
  name, institution, specialty, city, state, program_type,
  is_acgme_accredited, ecfmg_pathway_eligible, verified, description
) VALUES

-- Alabama
('Ophthalmology Residency Program', 'University of Alabama Hospital (Birmingham)', ARRAY['Ophthalmology'], 'Birmingham', 'AL', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at University of Alabama Hospital in Birmingham, AL.'),
('Ophthalmology Residency Program', 'Callahan Eye Hospital / University of Alabama at Birmingham', ARRAY['Ophthalmology'], 'Birmingham', 'AL', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Callahan Eye Hospital in Birmingham, AL.'),

-- Arizona
('Ophthalmology Residency Program', 'University of Arizona College of Medicine - Tucson', ARRAY['Ophthalmology'], 'Tucson', 'AZ', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at University of Arizona College of Medicine - Tucson.'),
('Ophthalmology Residency Program', 'University of Arizona College of Medicine - Phoenix', ARRAY['Ophthalmology'], 'Phoenix', 'AZ', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at University of Arizona College of Medicine - Phoenix.'),

-- Arkansas
('Ophthalmology Residency Program', 'University of Arkansas for Medical Sciences (UAMS) College of Medicine', ARRAY['Ophthalmology'], 'Little Rock', 'AR', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UAMS in Little Rock, AR.'),

-- California
('Ophthalmology Residency Program', 'University of California (San Francisco)', ARRAY['Ophthalmology'], 'San Francisco', 'CA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UCSF.'),
('Ophthalmology Residency Program', 'Stanford Health Care-Sponsored Stanford University', ARRAY['Ophthalmology'], 'Palo Alto', 'CA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Stanford University.'),
('Ophthalmology Residency Program', 'UCLA David Geffen School of Medicine/UCLA Medical Center/UCLA Stein and Doheny Eye Institutes', ARRAY['Ophthalmology'], 'Los Angeles', 'CA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UCLA.'),
('Ophthalmology Residency Program', 'University of Southern California/Los Angeles General Medical Center (USC/LA General)', ARRAY['Ophthalmology'], 'Los Angeles', 'CA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at USC/LA General.'),
('Ophthalmology Residency Program', 'University of California (San Diego) Medical Center', ARRAY['Ophthalmology'], 'La Jolla', 'CA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UC San Diego.'),
('Ophthalmology Residency Program', 'University of California (Irvine)', ARRAY['Ophthalmology'], 'Irvine', 'CA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UC Irvine.'),
('Ophthalmology Residency Program', 'Loma Linda University Health Education Consortium', ARRAY['Ophthalmology'], 'Loma Linda', 'CA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Loma Linda University.'),
('Ophthalmology Residency Program', 'University of California Davis Health', ARRAY['Ophthalmology'], 'Sacramento', 'CA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UC Davis.'),
('Ophthalmology Residency Program', 'Sutter Health/California Pacific Medical Center', ARRAY['Ophthalmology'], 'San Francisco', 'CA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at CPMC in San Francisco.'),
('Ophthalmology Residency Program', 'Naval Medical Center (San Diego)', ARRAY['Ophthalmology'], 'San Diego', 'CA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Naval Medical Center San Diego.'),

-- Colorado
('Ophthalmology Residency Program', 'University of Colorado Program', ARRAY['Ophthalmology'], 'Aurora', 'CO', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at University of Colorado.'),

-- Connecticut
('Ophthalmology Residency Program', 'Yale-New Haven Medical Center', ARRAY['Ophthalmology'], 'New Haven', 'CT', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Yale-New Haven.'),

-- District of Columbia
('Ophthalmology Residency Program', 'MedStar Health Georgetown University/Washington Hospital Center', ARRAY['Ophthalmology'], 'Washington', 'DC', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Georgetown/WHC.'),
('Ophthalmology Residency Program', 'George Washington University', ARRAY['Ophthalmology'], 'Washington', 'DC', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at George Washington University.'),
('Ophthalmology Residency Program', 'Howard University', ARRAY['Ophthalmology'], 'Washington', 'DC', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Howard University.'),

-- Florida
('Ophthalmology Residency Program', 'University of Miami/Jackson Health System/Bascom Palmer Eye Institute', ARRAY['Ophthalmology'], 'Miami', 'FL', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Bascom Palmer Eye Institute.'),
('Ophthalmology Residency Program', 'University of Florida', ARRAY['Ophthalmology'], 'Gainesville', 'FL', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at University of Florida.'),
('Ophthalmology Residency Program', 'University of South Florida Morsani', ARRAY['Ophthalmology'], 'Tampa', 'FL', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at USF Morsani.'),

-- Georgia
('Ophthalmology Residency Program', 'Emory University School of Medicine', ARRAY['Ophthalmology'], 'Atlanta', 'GA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Emory.'),
('Ophthalmology Residency Program', 'Medical College of Georgia / Augusta University', ARRAY['Ophthalmology'], 'Augusta', 'GA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at MCG.'),

-- Illinois
('Ophthalmology Residency Program', 'University of Illinois College of Medicine at Chicago', ARRAY['Ophthalmology'], 'Chicago', 'IL', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UIC.'),
('Ophthalmology Residency Program', 'John H. Stroger, Jr. Hospital of Cook County', ARRAY['Ophthalmology'], 'Chicago', 'IL', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Stroger/Cook County.'),
('Ophthalmology Residency Program', 'Loyola University Medical Center', ARRAY['Ophthalmology'], 'Maywood', 'IL', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Loyola.'),
('Ophthalmology Residency Program', 'University of Chicago', ARRAY['Ophthalmology'], 'Chicago', 'IL', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at University of Chicago.'),
('Ophthalmology Residency Program', 'Rush University Medical Center', ARRAY['Ophthalmology'], 'Chicago', 'IL', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Rush.'),

-- Indiana
('Ophthalmology Residency Program', 'Indiana University School of Medicine', ARRAY['Ophthalmology'], 'Indianapolis', 'IN', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at IU School of Medicine.'),

-- Iowa
('Ophthalmology Residency Program', 'University of Iowa Health Care Medical Center', ARRAY['Ophthalmology'], 'Iowa City', 'IA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at University of Iowa.'),

-- Kentucky
('Ophthalmology Residency Program', 'University of Kentucky College of Medicine', ARRAY['Ophthalmology'], 'Lexington', 'KY', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at University of Kentucky.'),
('Ophthalmology Residency Program', 'University of Louisville School of Medicine', ARRAY['Ophthalmology'], 'Louisville', 'KY', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at University of Louisville.'),

-- Louisiana
('Ophthalmology Residency Program', 'Louisiana State University School of Medicine (New Orleans)', ARRAY['Ophthalmology'], 'New Orleans', 'LA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at LSU New Orleans.'),
('Ophthalmology Residency Program', 'Tulane University School of Medicine', ARRAY['Ophthalmology'], 'New Orleans', 'LA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Tulane.'),
('Ophthalmology Residency Program', 'Louisiana State University (Shreveport)', ARRAY['Ophthalmology'], 'Shreveport', 'LA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at LSU Shreveport.'),

-- Maine
('Ophthalmology Residency Program', 'Maine Medical Center', ARRAY['Ophthalmology'], 'Portland', 'ME', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Maine Medical Center.'),

-- Maryland
('Ophthalmology Residency Program', 'Johns Hopkins University', ARRAY['Ophthalmology'], 'Baltimore', 'MD', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Johns Hopkins.'),
('Ophthalmology Residency Program', 'University of Maryland Program', ARRAY['Ophthalmology'], 'Baltimore', 'MD', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at University of Maryland.'),

-- Massachusetts
('Ophthalmology Residency Program', 'Massachusetts Eye and Ear / Harvard Medical School', ARRAY['Ophthalmology'], 'Boston', 'MA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Mass Eye and Ear/Harvard.'),
('Ophthalmology Residency Program', 'Harvard Medical School / Massachusetts General Hospital', ARRAY['Ophthalmology'], 'Boston', 'MA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at MGH/Harvard.'),
('Ophthalmology Residency Program', 'Boston Medical Center / Boston University', ARRAY['Ophthalmology'], 'Boston', 'MA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at BMC/BU.'),
('Ophthalmology Residency Program', 'Tufts University School of Medicine / New England Eye Center', ARRAY['Ophthalmology'], 'Boston', 'MA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Tufts/NEEC.'),
('Ophthalmology Residency Program', 'University of Massachusetts Chan Medical School', ARRAY['Ophthalmology'], 'Worcester', 'MA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UMass Chan.'),

-- Michigan
('Ophthalmology Residency Program', 'University of Michigan Health System Program', ARRAY['Ophthalmology'], 'Ann Arbor', 'MI', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at University of Michigan.'),
('Ophthalmology Residency Program', 'Wayne State University / Kresge Eye Institute', ARRAY['Ophthalmology'], 'Detroit', 'MI', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at WSU/Kresge.'),
('Ophthalmology Residency Program', 'Oakland University / William Beaumont Hospital', ARRAY['Ophthalmology'], 'Royal Oak', 'MI', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at OU/Beaumont.'),

-- Minnesota
('Ophthalmology Residency Program', 'University of Minnesota Program', ARRAY['Ophthalmology'], 'Minneapolis', 'MN', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at University of Minnesota.'),
('Ophthalmology Residency Program', 'Mayo Clinic College of Medicine and Science (Rochester)', ARRAY['Ophthalmology'], 'Rochester', 'MN', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Mayo Clinic Rochester.'),

-- Mississippi
('Ophthalmology Residency Program', 'University of Mississippi Medical Center', ARRAY['Ophthalmology'], 'Jackson', 'MS', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UMC.'),

-- Missouri
('Ophthalmology Residency Program', 'Washington University/B-JH/SLCH Consortium Program', ARRAY['Ophthalmology'], 'St. Louis', 'MO', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at WashU.'),
('Ophthalmology Residency Program', 'University of Missouri-Kansas City School of Medicine', ARRAY['Ophthalmology'], 'Kansas City', 'MO', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UMKC.'),

-- Nebraska
('Ophthalmology Residency Program', 'University of Nebraska Medical Center College of Medicine', ARRAY['Ophthalmology'], 'Omaha', 'NE', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UNMC.'),

-- Nevada
('Ophthalmology Residency Program', 'University of Nevada Reno School of Medicine', ARRAY['Ophthalmology'], 'Reno', 'NV', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UN Reno.'),
('Ophthalmology Residency Program', 'University of Nevada Las Vegas School of Medicine', ARRAY['Ophthalmology'], 'Las Vegas', 'NV', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UNLV.'),

-- New Hampshire
('Ophthalmology Residency Program', 'Dartmouth-Hitchcock Medical Center', ARRAY['Ophthalmology'], 'Hanover', 'NH', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Dartmouth-Hitchcock.'),

-- New Jersey
('Ophthalmology Residency Program', 'Rutgers New Jersey Medical School', ARRAY['Ophthalmology'], 'Newark', 'NJ', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Rutgers NJMS.'),
('Ophthalmology Residency Program', 'Rutgers Robert Wood Johnson Medical School', ARRAY['Ophthalmology'], 'New Brunswick', 'NJ', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at RWJMS.'),

-- New Mexico
('Ophthalmology Residency Program', 'University of New Mexico School of Medicine', ARRAY['Ophthalmology'], 'Albuquerque', 'NM', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UNM.'),

-- New York (top programs from residencyprogramslist.com)
('Ophthalmology Residency Program', 'University at Buffalo', ARRAY['Ophthalmology'], 'Buffalo', 'NY', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at University at Buffalo.'),
('Ophthalmology Residency Program', 'Montefiore Medical Center/Albert Einstein College of Medicine', ARRAY['Ophthalmology'], 'Bronx', 'NY', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Montefiore/Einstein.'),
('Ophthalmology Residency Program', 'BronxCare Health System', ARRAY['Ophthalmology'], 'Bronx', 'NY', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at BronxCare.'),
('Ophthalmology Residency Program', 'SUNY Downstate Health Sciences University', ARRAY['Ophthalmology'], 'Brooklyn', 'NY', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at SUNY Downstate.'),
('Ophthalmology Residency Program', 'Nassau University Medical Center', ARRAY['Ophthalmology'], 'East Meadow', 'NY', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at NUMC.'),
('Ophthalmology Residency Program', 'Jamaica Hospital Medical Center/New York Medical College', ARRAY['Ophthalmology'], 'Jamaica', 'NY', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Jamaica Hospital.'),
('Ophthalmology Residency Program', 'Zucker School of Medicine at Hofstra/Northwell/Manhattan Eye, Ear & Throat Hospital', ARRAY['Ophthalmology'], 'Great Neck', 'NY', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Hofstra/Northwell.'),
('Ophthalmology Residency Program', 'Icahn School of Medicine at Mount Sinai/New York Eye and Ear Infirmary at Mount Sinai', ARRAY['Ophthalmology'], 'New York', 'NY', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Mount Sinai/NYEE.'),
('Ophthalmology Residency Program', 'New York Presbyterian Hospital (Columbia Campus)', ARRAY['Ophthalmology'], 'New York', 'NY', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at NYP/Columbia.'),
('Ophthalmology Residency Program', 'New York Presbyterian Hospital (Cornell Campus)', ARRAY['Ophthalmology'], 'New York', 'NY', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at NYP/Cornell.'),
('Ophthalmology Residency Program', 'NYU Grossman School of Medicine', ARRAY['Ophthalmology'], 'New York', 'NY', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at NYU.'),
('Ophthalmology Residency Program', 'University of Rochester Medical Center', ARRAY['Ophthalmology'], 'Rochester', 'NY', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at URMC.'),
('Ophthalmology Residency Program', 'Albany Med Health System', ARRAY['Ophthalmology'], 'Albany', 'NY', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Albany Med.'),
('Ophthalmology Residency Program', 'Stony Brook Medicine/University Hospital', ARRAY['Ophthalmology'], 'Stony Brook', 'NY', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Stony Brook.'),
('Ophthalmology Residency Program', 'SUNY Upstate Medical University', ARRAY['Ophthalmology'], 'Syracuse', 'NY', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at SUNY Upstate.'),

-- North Carolina
('Ophthalmology Residency Program', 'Duke University Hospital Program', ARRAY['Ophthalmology'], 'Durham', 'NC', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Duke.'),
('Ophthalmology Residency Program', 'University of North Carolina Hospitals Program', ARRAY['Ophthalmology'], 'Chapel Hill', 'NC', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UNC.'),
('Ophthalmology Residency Program', 'Wake Forest University Baptist Medical Center Program', ARRAY['Ophthalmology'], 'Winston-Salem', 'NC', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Wake Forest.'),
('Ophthalmology Residency Program', 'Atrium Health / Wake Forest School of Medicine', ARRAY['Ophthalmology'], 'Charlotte', 'NC', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Atrium/Wake Forest.'),

-- North Dakota
('Ophthalmology Residency Program', 'University of North Dakota School of Medicine', ARRAY['Ophthalmology'], 'Grand Forks', 'ND', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UND.'),

-- Ohio
('Ophthalmology Residency Program', 'Case Western Reserve University/University Hospitals Cleveland Medical Center', ARRAY['Ophthalmology'], 'Cleveland', 'OH', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Case Western/UH.'),
('Ophthalmology Residency Program', 'Cleveland Clinic Foundation', ARRAY['Ophthalmology'], 'Cleveland', 'OH', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Cleveland Clinic.'),
('Ophthalmology Residency Program', 'Ohio State University Medical Center', ARRAY['Ophthalmology'], 'Columbus', 'OH', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at OSU.'),
('Ophthalmology Residency Program', 'University of Cincinnati / UC Medical Center', ARRAY['Ophthalmology'], 'Cincinnati', 'OH', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UC.'),

-- Oklahoma
('Ophthalmology Residency Program', 'University of Oklahoma Health Sciences Center', ARRAY['Ophthalmology'], 'Oklahoma City', 'OK', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at OUHSC.'),

-- Oregon
('Ophthalmology Residency Program', 'Oregon Health and Science University (OHSU Health)', ARRAY['Ophthalmology'], 'Portland', 'OR', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at OHSU.'),

-- Pennsylvania (top programs from residencyprogramslist.com)
('Ophthalmology Residency Program', 'University of Pittsburgh Medical Center (UPMC)', ARRAY['Ophthalmology'], 'Pittsburgh', 'PA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UPMC.'),
('Ophthalmology Residency Program', 'University of Pittsburgh School of Medicine / UPMC Eye Center', ARRAY['Ophthalmology'], 'Pittsburgh', 'PA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Pitt/UPMC Eye Center.'),
('Ophthalmology Residency Program', 'Scheie Eye Institute / University of Pennsylvania', ARRAY['Ophthalmology'], 'Philadelphia', 'PA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Scheie/Penn.'),
('Ophthalmology Residency Program', 'Wills Eye Hospital / Sidney Kimmel Medical College at Thomas Jefferson University', ARRAY['Ophthalmology'], 'Philadelphia', 'PA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Wills/Jefferson.'),
('Ophthalmology Residency Program', 'Lewis Katz School of Medicine at Temple University', ARRAY['Ophthalmology'], 'Philadelphia', 'PA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Temple.'),
('Ophthalmology Residency Program', 'Albert Einstein Medical Center Philadelphia', ARRAY['Ophthalmology'], 'Philadelphia', 'PA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Einstein.'),
('Ophthalmology Residency Program', 'Pennsylvania Hospital / University of Pennsylvania', ARRAY['Ophthalmology'], 'Philadelphia', 'PA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at PA Hospital/Penn.'),
('Ophthalmology Residency Program', 'Penn State Milton S. Hershey Medical Center', ARRAY['Ophthalmology'], 'Hershey', 'PA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Penn State.'),
('Ophthalmology Residency Program', 'Geisinger Health System', ARRAY['Ophthalmology'], 'Danville', 'PA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Geisinger.'),
('Ophthalmology Residency Program', 'St. Luke''s University Hospital', ARRAY['Ophthalmology'], 'Bethlehem', 'PA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at St. Luke''s.'),
('Ophthalmology Residency Program', 'Lankenau Medical Center / Thomas Jefferson University', ARRAY['Ophthalmology'], 'Wynnewood', 'PA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Lankenau/Jefferson.'),
('Ophthalmology Residency Program', 'Drexel University College of Medicine', ARRAY['Ophthalmology'], 'Philadelphia', 'PA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Drexel.'),
('Ophthalmology Residency Program', 'Allegheny General Hospital / AHN', ARRAY['Ophthalmology'], 'Pittsburgh', 'PA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at AGH/AHN.'),

-- Rhode Island
('Ophthalmology Residency Program', 'Rhode Island Hospital/Brown University Health Program', ARRAY['Ophthalmology'], 'Providence', 'RI', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Rhode Island Hospital/Brown.'),

-- South Carolina
('Ophthalmology Residency Program', 'Medical University of South Carolina Program', ARRAY['Ophthalmology'], 'Charleston', 'SC', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at MUSC.'),
('Ophthalmology Residency Program', 'Prisma Health / University of South Carolina SOM Greenville', ARRAY['Ophthalmology'], 'Greenville', 'SC', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Prisma/USC.'),

-- South Dakota
('Ophthalmology Residency Program', 'University of South Dakota Sanford School of Medicine', ARRAY['Ophthalmology'], 'Sioux Falls', 'SD', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at USD.'),

-- Tennessee
('Ophthalmology Residency Program', 'Vanderbilt University Medical Center Program', ARRAY['Ophthalmology'], 'Nashville', 'TN', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Vanderbilt.'),
('Ophthalmology Residency Program', 'University of Tennessee Health Science Center', ARRAY['Ophthalmology'], 'Memphis', 'TN', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UTHSC.'),
('Ophthalmology Residency Program', 'East Tennessee State University/Quillen College of Medicine', ARRAY['Ophthalmology'], 'Johnson City', 'TN', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at ETSU.'),

-- Texas (comprehensive from residencyprogramslist.com)
('Ophthalmology Residency Program', 'University of Texas Southwestern Medical Center', ARRAY['Ophthalmology'], 'Dallas', 'TX', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UT Southwestern.'),
('Ophthalmology Residency Program', 'University of Texas Medical Branch Hospitals/Methodist Hospital (Houston)', ARRAY['Ophthalmology'], 'Galveston', 'TX', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UTMB.'),
('Ophthalmology Residency Program', 'Baylor College of Medicine/Cullen Eye Institute', ARRAY['Ophthalmology'], 'Houston', 'TX', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Baylor/Cullen.'),
('Ophthalmology Residency Program', 'University of Texas Health Science Center at Houston', ARRAY['Ophthalmology'], 'Houston', 'TX', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UTHealth Houston.'),
('Ophthalmology Residency Program', 'San Antonio Uniformed Services Health Education Consortium', ARRAY['Ophthalmology'], 'JBSA Lackland AFB', 'TX', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at SA-USHEC.'),
('Ophthalmology Residency Program', 'Texas Tech University Health Sciences Center at Lubbock', ARRAY['Ophthalmology'], 'Lubbock', 'TX', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at TTUHSC Lubbock.'),
('Ophthalmology Residency Program', 'University of Texas Health Science Center San Antonio', ARRAY['Ophthalmology'], 'San Antonio', 'TX', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UT Health SA.'),
('Ophthalmology Residency Program', 'Baylor Scott & White Medical Center - Baylor College of Medicine (Temple)', ARRAY['Ophthalmology'], 'Temple', 'TX', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at BSW/Baylor Temple.'),
('Ophthalmology Residency Program', 'University of Texas at Austin Dell Medical School', ARRAY['Ophthalmology'], 'Austin', 'TX', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UT Austin Dell.'),
('Ophthalmology Residency Program', 'Texas Institute for Graduate Medical Education and Research (TIGMER)', ARRAY['Ophthalmology'], 'San Antonio', 'TX', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at TIGMER.'),
('Ophthalmology Residency Program', 'UT Southwestern Medical Center / VA North Texas', ARRAY['Ophthalmology'], 'Dallas', 'TX', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UT Southwestern/VA.'),
('Ophthalmology Residency Program', 'Baylor College of Medicine / Texas Children''s Hospital', ARRAY['Ophthalmology'], 'Houston', 'TX', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at BCM/Texas Children''s.'),
('Ophthalmology Residency Program', 'Baylor College of Medicine / Houston Methodist Hospital', ARRAY['Ophthalmology'], 'Houston', 'TX', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at BCM/Houston Methodist.'),
('Ophthalmology Residency Program', 'Baylor College of Medicine / CHI Baylor St. Luke''s Medical Center', ARRAY['Ophthalmology'], 'Houston', 'TX', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at BCM/St. Luke''s.'),
('Ophthalmology Residency Program', 'University of Houston / VA Medical Center', ARRAY['Ophthalmology'], 'Houston', 'TX', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UH/VA.'),

-- Utah
('Ophthalmology Residency Program', 'University of Utah Health Program', ARRAY['Ophthalmology'], 'Salt Lake City', 'UT', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at University of Utah.'),

-- Vermont
('Ophthalmology Residency Program', 'University of Vermont Medical Center', ARRAY['Ophthalmology'], 'Burlington', 'VT', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UVM.'),

-- Virginia
('Ophthalmology Residency Program', 'University of Virginia Medical Center Program', ARRAY['Ophthalmology'], 'Charlottesville', 'VA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UVA.'),
('Ophthalmology Residency Program', 'Eastern Virginia Medical School', ARRAY['Ophthalmology'], 'Norfolk', 'VA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at EVMS.'),

-- Washington
('Ophthalmology Residency Program', 'University of Washington Program', ARRAY['Ophthalmology'], 'Seattle', 'WA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at University of Washington.'),
('Ophthalmology Residency Program', 'Harborview Medical Center / University of Washington', ARRAY['Ophthalmology'], 'Seattle', 'WA', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Harborview/UW.'),

-- West Virginia
('Ophthalmology Residency Program', 'West Virginia University Program', ARRAY['Ophthalmology'], 'Morgantown', 'WV', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at WVU.'),
('Ophthalmology Residency Program', 'Marshall University Program', ARRAY['Ophthalmology'], 'Huntington', 'WV', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Marshall.'),
('Ophthalmology Residency Program', 'Charleston Area Medical Center / Joan C. Edwards School of Medicine at Marshall University', ARRAY['Ophthalmology'], 'Charleston', 'WV', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at CAMC/Marshall.'),

-- Wisconsin
('Ophthalmology Residency Program', 'Medical College of Wisconsin Affiliated Hospitals', ARRAY['Ophthalmology'], 'Milwaukee', 'WI', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at MCW.'),
('Ophthalmology Residency Program', 'Froedtert Hospital / Medical College of Wisconsin', ARRAY['Ophthalmology'], 'Milwaukee', 'WI', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Froedtert/MCW.'),
('Ophthalmology Residency Program', 'University of Wisconsin Hospitals and Clinics Program', ARRAY['Ophthalmology'], 'Madison', 'WI', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UW.'),

-- Wyoming
('Ophthalmology Residency Program', 'Casper Ophthalmology Residency Program', ARRAY['Ophthalmology'], 'Casper', 'WY', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program in Casper, WY.'),

-- Puerto Rico
('Ophthalmology Residency Program', 'University of Puerto Rico Medical Sciences Campus', ARRAY['Ophthalmology'], 'San Juan', 'PR', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at UPR MSC.'),
('Ophthalmology Residency Program', 'Auxilio Mutuo Hospital / Universidad de Puerto Rico', ARRAY['Ophthalmology'], 'San Juan', 'PR', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at Auxilio Mutuo/UPR.'),
('Ophthalmology Residency Program', 'Ponce Health Sciences University', ARRAY['Ophthalmology'], 'Ponce', 'PR', 'residency', true, true, true, 'ACGME-accredited Ophthalmology Residency Program at PHSU.');

