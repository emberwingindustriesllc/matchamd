/**
 * Comprehensive Medical Search Synonym Dictionary & Query Normalizer
 * Handles abbreviations, colloquial terms, UK/US spelling differences, and common misspellings.
 */

export const MEDICAL_SEARCH_SYNONYMS = {
  // OB/GYN variations & misspellings
  'obgyn': ['Obstetrics and Gynecology', 'OB/GYN', 'Obstetrics/Gynecology', 'Urogynecology', 'Maternal-Fetal Medicine', 'Gynecologic Oncology'],
  'ob/gyn': ['Obstetrics and Gynecology', 'OB/GYN', 'Obstetrics/Gynecology', 'Urogynecology'],
  'ob-gyn': ['Obstetrics and Gynecology', 'OB/GYN', 'Obstetrics/Gynecology'],
  'obs/gyn': ['Obstetrics and Gynecology', 'OB/GYN'],
  'obsgyn': ['Obstetrics and Gynecology', 'OB/GYN'],
  'gyn': ['Obstetrics and Gynecology', 'OB/GYN', 'Gynecology', 'Urogynecology'],
  'ob': ['Obstetrics and Gynecology', 'OB/GYN', 'Obstetrics'],
  'obstetrics': ['Obstetrics and Gynecology', 'OB/GYN', 'Obstetrics'],
  'gynecology': ['Obstetrics and Gynecology', 'OB/GYN', 'Gynecology'],
  'gynecological': ['Obstetrics and Gynecology', 'OB/GYN'],
  'obsetrics': ['Obstetrics and Gynecology', 'OB/GYN'], // common misspelling
  'obsetric': ['Obstetrics and Gynecology', 'OB/GYN'],  // common misspelling
  'obstekrics': ['Obstetrics and Gynecology', 'OB/GYN'], // common misspelling
  'gynecology': ['Obstetrics and Gynecology', 'OB/GYN'],
  'gynecologic': ['Obstetrics and Gynecology', 'OB/GYN'],
  'urogyn': ['Urogynecology', 'Obstetrics and Gynecology'],
  'mfm': ['Maternal-Fetal Medicine', 'Obstetrics and Gynecology'],

  // Pediatrics variations & subspecialties
  'peds': ['Pediatrics', 'Pediatric Hematology-Oncology', 'Pediatric Cardiology', 'Pediatric Gastroenterology', 'Pediatric Emergency Medicine'],
  'ped': ['Pediatrics', 'Pediatric'],
  'pediatrics': ['Pediatrics'],
  'pediatric': ['Pediatrics'],
  'paediatrics': ['Pediatrics'], // UK/International spelling
  'paediatric': ['Pediatrics'],
  'peds hemonc': ['Pediatric Hematology-Oncology', 'Pediatric Hematology/Oncology'],
  'ped hemonc': ['Pediatric Hematology-Oncology', 'Pediatric Hematology/Oncology'],
  'peds hem/onc': ['Pediatric Hematology-Oncology', 'Pediatric Hematology/Oncology'],
  'peds hem-onc': ['Pediatric Hematology-Oncology'],
  'pediatric hemonc': ['Pediatric Hematology-Oncology'],
  'pediatric hem/onc': ['Pediatric Hematology-Oncology'],
  'peds cardio': ['Pediatric Cardiology'],
  'peds gi': ['Pediatric Gastroenterology'],
  'nicut': ['Pediatric Neonatology', 'Neonatology'],

  // Internal Medicine variations
  'im': ['Internal Medicine'],
  'internal med': ['Internal Medicine'],
  'internal medicine': ['Internal Medicine'],
  'med-peds': ['Internal Medicine', 'Pediatrics'],
  'med/peds': ['Internal Medicine', 'Pediatrics'],

  // Family Medicine variations
  'fm': ['Family Medicine'],
  'family med': ['Family Medicine'],
  'fam med': ['Family Medicine'],
  'family medicine': ['Family Medicine'],

  // Emergency Medicine variations
  'em': ['Emergency Medicine'],
  'er': ['Emergency Medicine'],
  'emergency med': ['Emergency Medicine'],
  'emergency medicine': ['Emergency Medicine'],

  // Surgery variations
  'surg': ['Surgery', 'General Surgery'],
  'gen surg': ['Surgery', 'General Surgery'],
  'surgery': ['Surgery'],

  // Psychiatry variations
  'psych': ['Psychiatry'],
  'psychiatry': ['Psychiatry'],
  'psychiatrist': ['Psychiatry'],

  // Radiology variations
  'rads': ['Radiology', 'Diagnostic Radiology'],
  'rad': ['Radiology'],
  'radiology': ['Radiology'],
  'ir': ['Radiology', 'Interventional Radiology'],

  // Anesthesiology variations
  'anesthesia': ['Anesthesiology'],
  'anesthesiology': ['Anesthesiology'],

  // Pathology & Dermatology
  'path': ['Pathology'],
  'pathology': ['Pathology'],
  'derm': ['Dermatology'],
  'dermatology': ['Dermatology'],
};

/**
 * Expand a search string into all matching target medical terms & synonyms.
 */
export function expandMedicalSearchTerms(rawQuery = '') {
  const normalized = rawQuery.toLowerCase().trim();
  if (!normalized) return [];

  const expanded = new Set([normalized]);

  // Check full string match
  if (MEDICAL_SEARCH_SYNONYMS[normalized]) {
    MEDICAL_SEARCH_SYNONYMS[normalized].forEach(term => expanded.add(term.toLowerCase()));
  }

  // Check multi-word tokens
  const words = normalized.split(/[\s,/\\-]+/).filter(Boolean);
  words.forEach(word => {
    if (MEDICAL_SEARCH_SYNONYMS[word]) {
      MEDICAL_SEARCH_SYNONYMS[word].forEach(term => expanded.add(term.toLowerCase()));
    }
  });

  // Handle prefix / stem matching (e.g. obsetr -> obgyn/obstetrics, ped -> pediatrics)
  if (normalized.startsWith('obsetr') || normalized.startsWith('obste')) {
    ['obstetrics and gynecology', 'ob/gyn', 'obstetrics'].forEach(t => expanded.add(t));
  }
  if (normalized.startsWith('pediat') || normalized.startsWith('paediat')) {
    ['pediatrics', 'pediatric'].forEach(t => expanded.add(t));
  }

  return Array.from(expanded);
}
