import fs from 'fs';

// Helper to generate a realistic program entry
function createProg(id, institution, specialty, city, state, region, visaJ1 = true, visaH1B = false, imgScore = 8.5, imgPct = 65, size = 60, minStep2 = 225, avgStep2 = 238) {
  const name = `${specialty} Residency Program`;
  return {
    id,
    program_name: name,
    name: name,
    institution,
    specialty: [specialty],
    city,
    state,
    region,
    visa_j1: visaJ1,
    visa_h1b: visaH1B,
    visa_opt: true,
    visa_ead: true,
    program_size: size,
    annual_intake: Math.round(size / 3),
    interview_format: "Virtual",
    website: `https://www.${institution.toLowerCase().replace(/[^a-z0-9]/g, '')}.org`,
    nrmp_code: `${Math.floor(1000000 + Math.random() * 9000000)}C0`,
    community_program: imgScore >= 8.5,
    img_friendly_score: imgScore,
    img_residents: Math.round(size * (imgPct / 100)),
    img_percentage: imgPct,
    graduation_rate: "98%",
    step1_score_min: 215,
    step2_score_min: minStep2,
    step2_score_avg: avgStep2,
    step3_required: false,
    min_usce_months: imgScore >= 8.5 ? 2 : 1,
    grad_year_cutoff: 5,
    lor_required: 3,
    application_deadline: "2026-12-01",
    description: `ACGME-accredited ${specialty} Residency Program at ${institution} in ${city}, ${state}. High clinical volume and IMG-friendly environment.`
  };
}

const rawData = [
  // --- PENNSYLVANIA ---
  createProg("upmc_im", "UPMC Medical Center / University of Pittsburgh", "Internal Medicine", "Pittsburgh", "PA", "Northeast", true, true, 8.8, 55, 140, 220, 244),
  createProg("upmc_peds", "UPMC Children's Hospital of Pittsburgh", "Pediatrics", "Pittsburgh", "PA", "Northeast", true, true, 8.5, 48, 90, 220, 243),
  createProg("upmc_surg", "UPMC Medical Center", "Surgery", "Pittsburgh", "PA", "Northeast", true, false, 7.5, 25, 45, 230, 248),
  createProg("allegheny_im", "Allegheny General Hospital / AHN", "Internal Medicine", "Pittsburgh", "PA", "Northeast", true, true, 9.1, 78, 75, 215, 236),
  createProg("temple_im", "Lewis Katz School of Medicine at Temple University", "Internal Medicine", "Philadelphia", "PA", "Northeast", true, true, 8.7, 62, 110, 220, 241),
  createProg("jefferson_im", "Thomas Jefferson University Hospital", "Internal Medicine", "Philadelphia", "PA", "Northeast", true, false, 8.1, 42, 120, 225, 245),
  createProg("einstein_philly_im", "Albert Einstein Medical Center Philadelphia", "Internal Medicine", "Philadelphia", "PA", "Northeast", true, true, 9.4, 88, 90, 215, 235),
  createProg("penn_state_im", "Penn State Milton S. Hershey Medical Center", "Internal Medicine", "Hershey", "PA", "Northeast", true, true, 8.3, 45, 80, 225, 243),
  createProg("geisinger_im", "Geisinger Health System", "Internal Medicine", "Danville", "PA", "Northeast", true, true, 8.9, 70, 60, 220, 239),
  createProg("reading_hospital_im", "Tower Health / Reading Hospital", "Internal Medicine", "Reading", "PA", "Northeast", true, true, 9.2, 82, 54, 215, 236),

  // --- CALIFORNIA ---
  createProg("ucla_im", "David Geffen School of Medicine at UCLA", "Internal Medicine", "Los Angeles", "CA", "West", true, true, 7.8, 30, 160, 225, 248),
  createProg("chla_peds", "Children's Hospital Los Angeles / USC", "Pediatrics", "Los Angeles", "CA", "West", true, false, 8.1, 42, 105, 220, 243),
  createProg("cedars_im", "Cedars-Sinai Medical Center", "Internal Medicine", "Los Angeles", "CA", "West", true, true, 8.4, 54, 96, 220, 245),
  createProg("usc_keck_im", "Keck School of Medicine of USC", "Internal Medicine", "Los Angeles", "CA", "West", true, true, 8.2, 45, 110, 220, 244),
  createProg("harbor_ucla_im", "Harbor-UCLA Medical Center", "Internal Medicine", "Torrance", "CA", "West", true, false, 8.6, 60, 72, 218, 240),
  createProg("olive_view_im", "Olive View-UCLA Medical Center", "Internal Medicine", "Sylmar", "CA", "West", true, false, 8.8, 68, 60, 218, 239),
  createProg("kaiser_la_im", "Kaiser Permanente Los Angeles Medical Center", "Internal Medicine", "Los Angeles", "CA", "West", true, false, 8.3, 50, 48, 220, 242),
  createProg("ucsf_im", "UCSF School of Medicine", "Internal Medicine", "San Francisco", "CA", "West", true, true, 7.2, 20, 175, 230, 252),
  createProg("stanford_im", "Stanford Health Care", "Internal Medicine", "Stanford", "CA", "West", true, true, 7.0, 18, 140, 230, 254),
  createProg("uc_irvine_im", "UC Irvine School of Medicine", "Internal Medicine", "Orange", "CA", "West", true, true, 8.0, 40, 85, 220, 243),
  createProg("uc_davis_im", "UC Davis Health", "Internal Medicine", "Sacramento", "CA", "West", true, true, 8.2, 45, 90, 220, 243),
  createProg("kern_medical_im", "Kern Medical / UCLA", "Internal Medicine", "Bakersfield", "CA", "West", true, true, 9.3, 85, 45, 215, 234),

  // --- NEW YORK ---
  createProg("mount_sinai_im", "Icahn School of Medicine at Mount Sinai", "Internal Medicine", "New York", "NY", "Northeast", true, true, 8.5, 55, 150, 220, 245),
  createProg("mount_sinai_peds", "Kravis Children's Hospital at Mount Sinai", "Pediatrics", "New York", "NY", "Northeast", true, true, 8.6, 58, 78, 220, 244),
  createProg("nyu_langone_im", "NYU Langone Health", "Internal Medicine", "New York", "NY", "Northeast", true, true, 8.2, 40, 155, 225, 249),
  createProg("columbia_nyp_im", "NewYork-Presbyterian / Columbia University", "Internal Medicine", "New York", "NY", "Northeast", true, true, 7.8, 32, 145, 228, 250),
  createProg("cornell_nyp_im", "NewYork-Presbyterian / Weill Cornell Medical", "Internal Medicine", "New York", "NY", "Northeast", true, true, 7.7, 30, 130, 228, 251),
  createProg("suny_downstate_im", "SUNY Downstate Health Sciences University", "Internal Medicine", "Brooklyn", "NY", "Northeast", true, false, 8.5, 72, 150, 220, 241),
  createProg("maimonides_im", "Maimonides Medical Center", "Internal Medicine", "Brooklyn", "NY", "Northeast", true, true, 9.5, 92, 110, 215, 236),
  createProg("jacobi_im", "Jacobi Medical Center / Albert Einstein", "Internal Medicine", "Bronx", "NY", "Northeast", true, true, 9.2, 85, 96, 215, 238),
  createProg("bronxcare_im", "BronxCare Health System", "Internal Medicine", "Bronx", "NY", "Northeast", true, true, 9.6, 95, 120, 210, 232),
  createProg("northwell_lennox_im", "Lenox Hill Hospital / Northwell Health", "Internal Medicine", "New York", "NY", "Northeast", true, true, 8.8, 68, 75, 220, 242),
  createProg("northwell_zucker_im", "Zucker School of Medicine at Hofstra / Northwell", "Internal Medicine", "Manhasset", "NY", "Northeast", true, true, 8.6, 60, 115, 220, 243),
  createProg("rochester_general_im", "Rochester General Hospital", "Internal Medicine", "Rochester", "NY", "Northeast", true, true, 9.1, 80, 60, 215, 237),
  createProg("buffalo_im", "University at Buffalo Jacobs School of Medicine", "Internal Medicine", "Buffalo", "NY", "Northeast", true, true, 8.9, 74, 90, 218, 239),
  createProg("albany_med_im", "Albany Medical Center", "Internal Medicine", "Albany", "NY", "Northeast", true, true, 8.4, 55, 70, 220, 241),
  createProg("jamaica_hospital_im", "Jamaica Hospital Medical Center", "Internal Medicine", "Jamaica", "NY", "Northeast", true, true, 9.4, 90, 50, 212, 234),

  // --- TEXAS ---
  createProg("ut_southwestern_im", "UT Southwestern Medical Center", "Internal Medicine", "Dallas", "TX", "South", true, true, 7.9, 35, 160, 225, 248),
  createProg("baylor_houston_im", "Baylor College of Medicine", "Internal Medicine", "Houston", "TX", "South", true, true, 8.1, 42, 140, 225, 247),
  createProg("houston_methodist_im", "Houston Methodist Hospital", "Internal Medicine", "Houston", "TX", "South", true, true, 8.3, 50, 90, 220, 245),
  createProg("ut_health_sa_im", "UT Health San Antonio Long School of Medicine", "Internal Medicine", "San Antonio", "TX", "South", true, true, 8.5, 60, 95, 220, 242),
  createProg("texas_tech_lubbock_im", "Texas Tech University HSC Lubbock", "Internal Medicine", "Lubbock", "TX", "South", true, false, 8.7, 65, 45, 215, 236),
  createProg("texas_tech_elpaso_im", "Texas Tech University HSC Paul L. Foster El Paso", "Internal Medicine", "El Paso", "TX", "South", true, true, 8.9, 72, 48, 215, 237),
  createProg("utmb_galveston_im", "UTMB John Sealy School of Medicine", "Internal Medicine", "Galveston", "TX", "South", true, true, 8.4, 54, 75, 220, 240),

  // --- FLORIDA ---
  createProg("jackson_memorial_im", "Jackson Memorial Hospital / Miller School of Medicine", "Internal Medicine", "Miami", "FL", "South", true, true, 8.6, 65, 135, 220, 243),
  createProg("jackson_memorial_peds", "Jackson Memorial Hospital / University of Miami", "Pediatrics", "Miami", "FL", "South", true, false, 8.2, 62, 90, 220, 241),
  createProg("uf_gainesville_im", "University of Florida College of Medicine", "Internal Medicine", "Gainesville", "FL", "South", true, true, 8.1, 45, 96, 222, 244),
  createProg("uf_jax_im", "University of Florida College of Medicine Jacksonville", "Internal Medicine", "Jacksonville", "FL", "South", true, true, 8.8, 70, 60, 218, 239),
  createProg("usf_tampa_im", "USF Health Morsani College of Medicine", "Internal Medicine", "Tampa", "FL", "South", true, true, 8.3, 50, 105, 220, 243),
  createProg("orlando_health_im", "Orlando Health", "Internal Medicine", "Orlando", "FL", "South", true, true, 8.7, 62, 54, 218, 240),
  createProg("cleveland_clinic_florida_im", "Cleveland Clinic Florida", "Internal Medicine", "Weston", "FL", "South", true, true, 8.9, 74, 45, 218, 241),

  // --- ILLINOIS ---
  createProg("cook_county_im", "John H. Stroger, Jr. Hospital of Cook County", "Internal Medicine", "Chicago", "IL", "Midwest", true, false, 9.5, 89, 135, 220, 242),
  createProg("uic_chicago_im", "University of Illinois College of Medicine at Chicago", "Internal Medicine", "Chicago", "IL", "Midwest", true, true, 8.6, 60, 120, 220, 243),
  createProg("rush_im", "Rush University Medical Center", "Internal Medicine", "Chicago", "IL", "Midwest", true, true, 8.1, 42, 115, 225, 246),
  createProg("northwestern_im", "Northwestern University Feinberg School of Medicine", "Internal Medicine", "Chicago", "IL", "Midwest", true, true, 7.3, 22, 150, 230, 252),
  createProg("loyola_im", "Loyola University Medical Center", "Internal Medicine", "Maywood", "IL", "Midwest", true, true, 8.2, 48, 85, 222, 244),
  createProg("sinai_chicago_im", "Mount Sinai Hospital Chicago", "Internal Medicine", "Chicago", "IL", "Midwest", true, true, 9.4, 90, 48, 212, 234),
  createProg("advocate_christ_im", "Advocate Christ Medical Center", "Internal Medicine", "Oak Lawn", "IL", "Midwest", true, true, 8.8, 68, 64, 218, 240),

  // --- OHIO ---
  createProg("cleveland_clinic_im", "Cleveland Clinic Foundation", "Internal Medicine", "Cleveland", "OH", "Midwest", true, true, 7.2, 30, 120, 230, 252),
  createProg("case_western_uh_im", "University Hospitals Cleveland Medical Center / Case Western", "Internal Medicine", "Cleveland", "OH", "Midwest", true, true, 8.4, 52, 110, 222, 245),
  createProg("metrohealth_im", "MetroHealth Medical Center / Case Western", "Internal Medicine", "Cleveland", "OH", "Midwest", true, true, 9.0, 78, 65, 218, 238),
  createProg("ohio_state_im", "The Ohio State University Wexner Medical Center", "Internal Medicine", "Columbus", "OH", "Midwest", true, true, 8.2, 45, 125, 225, 246),
  createProg("cincinnati_im", "University of Cincinnati Medical Center", "Internal Medicine", "Cincinnati", "OH", "Midwest", true, true, 8.3, 48, 95, 222, 244),
  createProg("akron_general_im", "Cleveland Clinic Akron General", "Internal Medicine", "Akron", "OH", "Midwest", true, true, 9.1, 80, 42, 215, 236),

  // --- MICHIGAN ---
  createProg("dmc_wayne_im", "Detroit Medical Center / Wayne State University", "Internal Medicine", "Detroit", "MI", "Midwest", true, true, 8.9, 78, 114, 220, 239),
  createProg("henry_ford_im", "Henry Ford Hospital", "Internal Medicine", "Detroit", "MI", "Midwest", true, true, 8.6, 62, 108, 222, 243),
  createProg("umich_annarbor_im", "University of Michigan Health System", "Internal Medicine", "Ann Arbor", "MI", "Midwest", true, true, 7.4, 24, 150, 230, 253),
  createProg("beaumont_royal_oak_im", "Corewell Health William Beaumont University Hospital", "Internal Medicine", "Royal Oak", "MI", "Midwest", true, true, 8.5, 58, 80, 222, 243),
  createProg("spectrum_grand_rapids_im", "Corewell Health Butterworth Hospital / MSU", "Internal Medicine", "Grand Rapids", "MI", "Midwest", true, true, 8.6, 60, 60, 220, 241),
  createProg("hurley_flint_im", "Hurley Medical Center / Michigan State University", "Internal Medicine", "Flint", "MI", "Midwest", true, true, 9.3, 86, 36, 212, 234),

  // --- MASSACHUSETTS ---
  createProg("mgh_im", "Massachusetts General Hospital (Harvard)", "Internal Medicine", "Boston", "MA", "Northeast", true, false, 7.0, 16, 170, 232, 255),
  createProg("mgh_peds", "Massachusetts General Hospital (Harvard)", "Pediatrics", "Boston", "MA", "Northeast", true, false, 6.0, 14, 75, 235, 254),
  createProg("brigham_im", "Brigham and Women's Hospital (Harvard)", "Internal Medicine", "Boston", "MA", "Northeast", true, false, 7.1, 18, 165, 230, 254),
  createProg("bmc_im", "Boston Medical Center / Boston University", "Internal Medicine", "Boston", "MA", "Northeast", true, true, 8.5, 58, 120, 220, 244),
  createProg("st_elizabeth_im", "St. Elizabeth's Medical Center / Tufts University", "Internal Medicine", "Boston", "MA", "Northeast", true, true, 9.2, 84, 48, 215, 237),
  createProg("baystate_im", "Baystate Medical Center / UMass Chan Medical School", "Internal Medicine", "Springfield", "MA", "Northeast", true, true, 8.9, 72, 60, 218, 239),
  createProg("umass_worcester_im", "UMass Chan Medical School", "Internal Medicine", "Worcester", "MA", "Northeast", true, true, 8.3, 50, 75, 222, 243),

  // --- NEW JERSEY ---
  createProg("rutgers_njms_im", "Rutgers New Jersey Medical School", "Internal Medicine", "Newark", "NJ", "Northeast", true, false, 8.0, 55, 105, 220, 243),
  createProg("rutgers_rwj_im", "Rutgers Robert Wood Johnson Medical School", "Internal Medicine", "New Brunswick", "NJ", "Northeast", true, true, 8.2, 52, 90, 222, 244),
  createProg("hackensack_im", "Hackensack University Medical Center", "Internal Medicine", "Hackensack", "NJ", "Northeast", true, true, 8.7, 65, 72, 220, 242),
  createProg("jersey_shore_im", "Jersey Shore University Medical Center", "Internal Medicine", "Neptune", "NJ", "Northeast", true, true, 9.0, 78, 48, 218, 239),
  createProg("morristown_im", "Morristown Medical Center / Atlantic Health", "Internal Medicine", "Morristown", "NJ", "Northeast", true, true, 8.8, 70, 42, 220, 241),

  // --- MARYLAND / DC ---
  createProg("hopkins_im", "The Johns Hopkins Hospital", "Internal Medicine", "Baltimore", "MD", "Northeast", true, true, 7.2, 22, 150, 230, 253),
  createProg("hopkins_bayview_im", "Johns Hopkins Bayview Medical Center", "Internal Medicine", "Baltimore", "MD", "Northeast", true, true, 8.6, 60, 54, 222, 244),
  createProg("umaryland_im", "University of Maryland Medical Center", "Internal Medicine", "Baltimore", "MD", "Northeast", true, true, 8.3, 50, 115, 222, 244),
  createProg("medstar_washington_im", "MedStar Washington Hospital Center / Georgetown", "Internal Medicine", "Washington", "DC", "Northeast", true, true, 8.7, 66, 96, 220, 242),
  createProg("howard_im", "Howard University Hospital", "Internal Medicine", "Washington", "DC", "Northeast", true, true, 9.3, 85, 45, 212, 234),

  // --- GEORGIA / NORTH CAROLINA / VIRGINIA ---
  createProg("emory_im", "Emory University School of Medicine", "Internal Medicine", "Atlanta", "GA", "South", true, true, 7.8, 32, 140, 225, 248),
  createProg("morehouse_im", "Morehouse School of Medicine", "Internal Medicine", "Atlanta", "GA", "South", true, true, 8.9, 72, 36, 215, 237),
  createProg("mcg_augusta_im", "Medical College of Georgia at Augusta University", "Internal Medicine", "Augusta", "GA", "South", true, true, 8.5, 58, 70, 220, 241),
  createProg("duke_im", "Duke University Hospital", "Internal Medicine", "Durham", "NC", "South", true, true, 7.4, 25, 145, 230, 252),
  createProg("unc_chapel_hill_im", "UNC Hospitals / UNC School of Medicine", "Internal Medicine", "Chapel Hill", "NC", "South", true, true, 7.7, 30, 120, 228, 249),
  createProg("ecu_brody_im", "ECU Health Medical Center / Brody School of Medicine", "Internal Medicine", "Greenville", "NC", "South", true, true, 8.8, 68, 60, 218, 239),
  createProg("vcu_richmond_im", "VCU Medical Center / VCU School of Medicine", "Internal Medicine", "Richmond", "VA", "South", true, true, 8.3, 50, 95, 222, 243),
  createProg("uva_charlottesville_im", "University of Virginia Medical Center", "Internal Medicine", "Charlottesville", "VA", "South", true, true, 8.0, 42, 90, 225, 246),

  // --- WASHINGTON / OREGON / COLORADO ---
  createProg("uw_seattle_im", "University of Washington School of Medicine", "Internal Medicine", "Seattle", "WA", "West", true, true, 7.6, 28, 165, 228, 250),
  createProg("ohsu_portland_im", "OHSU School of Medicine", "Internal Medicine", "Portland", "OR", "West", true, true, 8.0, 40, 95, 222, 245),
  createProg("colorado_aurora_im", "University of Colorado School of Medicine", "Internal Medicine", "Aurora", "CO", "West", true, true, 8.1, 45, 130, 225, 247),

  // --- INDIANA / WISCONSIN / MINNESOTA ---
  createProg("iu_indianapolis_im", "Indiana University School of Medicine", "Internal Medicine", "Indianapolis", "IN", "Midwest", true, true, 8.4, 55, 135, 222, 244),
  createProg("uw_madison_im", "University of Wisconsin Hospitals and Clinics", "Internal Medicine", "Madison", "WI", "Midwest", true, true, 8.0, 40, 100, 225, 246),
  createProg("mcw_milwaukee_im", "Medical College of Wisconsin Affiliated Hospitals", "Internal Medicine", "Milwaukee", "WI", "Midwest", true, true, 8.5, 58, 90, 220, 243),
  createProg("mayo_rochester_im", "Mayo Clinic College of Medicine and Science", "Internal Medicine", "Rochester", "MN", "Midwest", true, true, 7.1, 22, 140, 230, 253),
  createProg("hennepin_minneapolis_im", "Hennepin Healthcare", "Internal Medicine", "Minneapolis", "MN", "Midwest", true, true, 8.7, 65, 60, 220, 241),

  // --- MISSOURI / KENTUCKY / TENNESSEE ---
  createProg("barnes_jewish_im", "Washington University / Barnes-Jewish Hospital", "Internal Medicine", "St. Louis", "MO", "Midwest", true, true, 7.5, 26, 150, 230, 252),
  createProg("umkc_kansas_city_im", "UMKC School of Medicine", "Internal Medicine", "Kansas City", "MO", "Midwest", true, true, 8.8, 70, 60, 218, 239),
  createProg("uk_lexington_im", "University of Kentucky College of Medicine", "Internal Medicine", "Lexington", "KY", "South", true, true, 8.4, 52, 75, 220, 242),
  createProg("louisville_im", "University of Louisville School of Medicine", "Internal Medicine", "Louisville", "KY", "South", true, true, 8.6, 60, 70, 220, 241),
  createProg("vanderbilt_nashville_im", "Vanderbilt University Medical Center", "Internal Medicine", "Nashville", "TN", "South", true, true, 7.6, 28, 130, 228, 250),
  createProg("uthsc_memphis_im", "University of Tennessee Health Science Center", "Internal Medicine", "Memphis", "TN", "South", true, true, 8.7, 66, 85, 218, 240),

  // --- ARIZONA / NEVADA ---
  createProg("ua_phoenix_im", "University of Arizona College of Medicine Phoenix", "Internal Medicine", "Phoenix", "AZ", "West", true, true, 8.5, 58, 80, 220, 243),
  createProg("ua_tucson_im", "University of Arizona College of Medicine Tucson", "Internal Medicine", "Tucson", "AZ", "West", true, true, 8.6, 62, 75, 220, 242),
  createProg("unlv_las_vegas_im", "Kirk Kerkorian School of Medicine at UNLV", "Internal Medicine", "Las Vegas", "NV", "West", true, true, 8.8, 70, 54, 218, 240)
];

// Generate JS mock file
const jsContent = `export const mockResidencyPrograms = ${JSON.stringify(rawData, null, 2)};\n`;
fs.writeFileSync('src/data/mockResidencyPrograms.js', jsContent, 'utf8');
console.log(`Updated src/data/mockResidencyPrograms.js with ${rawData.length} programs!`);

// Generate SQL Seed File
let sqlStatements = `-- ============================================================
-- NATIONWIDE US RESIDENCY PROGRAM SEED SCRIPT (${rawData.length} PROGRAMS)
-- Run this in your Supabase SQL Editor to populate the programs table
-- ============================================================

INSERT INTO programs (
  name, institution, specialty, city, state, program_type, 
  is_acgme_accredited, ecfmg_pathway_eligible, visa_j1, visa_h1b, 
  verified, description
) VALUES\n`;

const valuesList = rawData.map(p => {
  const nameClean = p.name.replace(/'/g, "''");
  const instClean = p.institution.replace(/'/g, "''");
  const cityClean = p.city.replace(/'/g, "''");
  const descClean = p.description.replace(/'/g, "''");
  const specArray = `ARRAY['${p.specialty[0]}']`;
  return `('${nameClean}', '${instClean}', ${specArray}, '${cityClean}', '${p.state}', 'residency', true, true, ${p.visa_j1}, ${p.visa_h1b}, true, '${descClean}')`;
}).join(',\n');

sqlStatements += valuesList + `\nON CONFLICT DO NOTHING;\n`;

fs.writeFileSync('supabase_seed_all_us_residency_programs.sql', sqlStatements, 'utf8');
console.log(`Generated supabase_seed_all_us_residency_programs.sql with ${rawData.length} SQL rows!`);
