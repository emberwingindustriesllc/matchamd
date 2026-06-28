// Onboarding constants - extracted from Onboarding.jsx for maintainability
// This file can be imported by Onboarding.jsx and any tests

export const countries = [
  'India', 'Pakistan', 'Nigeria', 'Philippines', 'Egypt', 'Mexico', 'Brazil',
  'Colombia', 'China', 'Bangladesh', 'Iran', 'Iraq', 'Syria', 'Lebanon',
  'Jordan', 'Saudi Arabia', 'UAE', 'United Kingdom', 'Canada', 'Other'
];

export const commonMedSchools = {
  'India': ['AIIMS', 'JIPMER', 'CMC Vellore', 'Armed Forces Medical College', 'Maulana Azad Medical College', 'Other'],
  'Pakistan': ['Aga Khan University', 'King Edward Medical University', 'Dow Medical College', 'Allama Iqbal Medical College', 'Other'],
  'Nigeria': ['University of Ibadan', 'University of Lagos', 'Obafemi Awolowo University', 'University of Nigeria', 'Other'],
  'Philippines': ['University of the Philippines', 'University of Santo Tomas', 'Far Eastern University', 'Other'],
  'Egypt': ['Cairo University', 'Ain Shams University', 'Alexandria University', 'Other'],
  'Mexico': ['UNAM', 'IPN', 'UAG', 'TEC de Monterrey', 'Other'],
  'Other': ['Other']
};

export const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'zh', name: '中文' },
  { code: 'fr', name: 'Français' },
  { code: 'pt', name: 'Português' }
];

export const goals = [
  {
    id: 'residency',
    icon: 'Stethoscope',
    title: 'Residency',
    description: 'Apply for US medical residency programs',
    color: 'from-[rgb(var(--color-primary))] to-[rgb(110,135,30)]'
  },
  {
    id: 'fellowship',
    icon: 'GraduationCap',
    title: 'Fellowship',
    description: 'Pursue subspecialty training',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'med_school',
    icon: 'BookOpen',
    title: 'Med School',
    description: 'Apply to US medical schools',
    color: 'from-amber-500 to-orange-500'
  }
];

export const residencySpecialties = [
  'Internal Medicine', 'Family Medicine', 'Pediatrics', 'Surgery',
  'Emergency Medicine', 'Psychiatry', 'OB/GYN', 'Neurology',
  'Radiology', 'Anesthesiology', 'Pathology', 'Dermatology', 'Other'
];

export const pediatricFellowships = [
  'Adolescent Medicine',
  'Allergy and Immunology',
  'Cardiology',
  'Child Abuse Pediatrics',
  'Child and Adolescent Psychiatry',
  'Critical Care Medicine',
  'Developmental-Behavioral Pediatrics',
  'Emergency Medicine',
  'Endocrinology',
  'Gastroenterology',
  'Hematology-Oncology',
  'Hospital Medicine',
  'Infectious Disease',
  'Neonatal-Perinatal Medicine',
  'Nephrology',
  'Neurology',
  'Pulmonology',
  'Rheumatology',
  'Sports Medicine',
  'Transplant Hepatology',
  'Other'
];

export const internalMedicineFellowships = [
  'Adolescent Medicine',
  'Adult Congenital Heart Disease',
  'Advanced Heart Failure and Transplant Cardiology',
  'Cardiovascular Disease',
  'Clinical Cardiac Electrophysiology',
  'Critical Care Medicine',
  'Endocrinology, Diabetes and Metabolism',
  'Gastroenterology',
  'Geriatric Medicine',
  'Hematology',
  'Hospice and Palliative Medicine',
  'Infectious Disease',
  'Interventional Cardiology',
  'Medical Oncology',
  'Nephrology',
  'Neurocritical Care',
  'Pulmonary Disease',
  'Rheumatology',
  'Sleep Medicine',
  'Sports Medicine',
  'Transplant Hepatology',
  'Other'
];

export const combinedMedPedsFellowships = [
  ...new Set([...pediatricFellowships, ...internalMedicineFellowships])
].sort();

export const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const visaStatusOptions = [
  { value: 'none', label: 'None / Need Sponsorship' },
  { value: 'J1', label: 'J-1 Visa' },
  { value: 'H1B', label: 'H-1B Visa' },
  { value: 'Citizen', label: 'US Citizen' },
  { value: 'GreenCard', label: 'Permanent Resident (Green Card)' },
  { value: 'Other', label: 'Other' }
];

export const usmleStatusOptions = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'studying', label: 'Studying' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'passed', label: 'Passed' }
];

export const usmleStep3Options = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'studying', label: 'Studying' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'passed', label: 'Passed' }
];

// Validation helpers
export const canProceed = (step, profile) => {
  switch(step) {
    case 0: return profile.display_name.length > 0;
    case 1: return !!(profile.country && profile.medical_school_country && profile.medical_school);
    case 2: return !!profile.visa_status;
    case 3: return !!profile.primary_goal;
    case 4: return true;
    default: return false;
  }
};