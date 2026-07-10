import { z } from 'zod';

/**
 * Zod schemas for UserProfile validation
 * Replaces the fragile dynamic column stripping in Onboarding.jsx and Profile.jsx
 */

// Enum values matching Supabase UserProfile entity
const PrimaryGoalEnum = z.enum(['residency', 'fellowship', 'med_school']);
const FellowshipTypeEnum = z.enum(['pediatrics', 'internal_medicine', 'internal_medicine_pediatrics']);
const USMLEStatusEnum = z.enum(['not_started', 'studying', 'scheduled', 'passed', 'na']);
const USMLEStep3ResultEnum = z.enum(['pass', 'fail', 'not_applicable']);
const VisaStatusEnum = z.enum(['none', 'J1', 'H1B', 'Citizen', 'GreenCard', 'Other']);
const LanguageCodeEnum = z.enum(['en', 'es', 'ar', 'hi', 'zh', 'fr', 'pt']);

/**
 * Base schema for onboarding form data (unrefined ZodObject)
 */
export const BaseOnboardingProfileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(100),
  country: z.string().min(1, 'Country is required'),
  country_of_origin: z.string().min(1, 'Country of origin is required'),
  target_city: z.string().optional(),
  target_state: z.string().optional(),
  medical_school: z.string().min(1, 'Medical school is required'),
  medical_school_country: z.string().min(1, 'Medical school country is required'),
  undergraduate_college: z.string().optional(),
  languages: z.array(LanguageCodeEnum).default(['en']),
  preferred_language: LanguageCodeEnum.default('en'),
  primary_goal: PrimaryGoalEnum,
  fellowship_type: z.preprocess((val) => (val === '' ? null : val), z.string().optional().nullable()),
  target_specialty: z.string().optional(),
  target_specialty_custom: z.string().optional(),
  fellowship_type_custom: z.string().optional(),
  graduation_year: z.number().int().min(1950).max(new Date().getFullYear() + 5).nullable().optional(),
  usmle_step1_status: USMLEStatusEnum.default('not_started'),
  usmle_step1_score: z.string().optional(),
  usmle_step2_status: USMLEStatusEnum.default('not_started'),
  usmle_step2_score: z.string().optional(),
  usmle_step3_status: USMLEStatusEnum.default('not_started'),
  usmle_step3_result: USMLEStep3ResultEnum.default('not_applicable'),
  ecfmg_certified: z.boolean().default(false),
  visa_status: VisaStatusEnum.default('none'),
  conrad_30_waiver_planned: z.boolean().default(false),
  acgme_waiver: z.boolean().default(false),
  previous_training: z.string().optional(),
  us_clinical_experience: z.boolean().default(false),
  medical_school_custom: z.string().optional(),
});

/**
 * Refined onboarding profile schema with conditional validation logic
 */
export const OnboardingProfileSchema = BaseOnboardingProfileSchema.refine(data => {
  if (data.usmle_step2_status === 'passed' && !data.usmle_step2_score) {
    return false;
  }
  return true;
}, {
  message: 'Step 2 CK score is required when status is "passed"',
  path: ['usmle_step2_score'],
}).refine(data => {
  // Fellowship type required when primary_goal is fellowship
  if (data.primary_goal === 'fellowship' && !data.fellowship_type) {
    return false;
  }
  return true;
}, {
  message: 'Fellowship type is required when goal is fellowship',
  path: ['fellowship_type'],
}).refine(data => {
  // Target specialty required for residency
  if (data.primary_goal === 'residency' && !data.target_specialty) {
    return false;
  }
  return true;
}, {
  message: 'Target specialty is required for residency goal',
  path: ['target_specialty'],
});

/**
 * Schema for profile edit (allows partial updates)
 */
export const ProfileEditSchema = BaseOnboardingProfileSchema.partial().extend({
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  dark_mode: z.boolean().optional(),
  points: z.number().int().min(0).optional(),
  badges: z.array(z.string()).optional(),
});

/**
 * Full profile schema (for database operations)
 */
export const UserProfileSchema = BaseOnboardingProfileSchema.extend({
  user_id: z.string().uuid('Invalid user ID'),
  onboarding_complete: z.boolean().default(false),
  is_mentor: z.boolean().default(false),
  mentor_verified: z.boolean().default(false),
  badges: z.array(z.string()).default([]),
  points: z.number().int().min(0).default(0),
  avatar_url: z.string().url().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  matched_program: z.string().optional().nullable(),
  matched_city: z.string().optional().nullable(),
  matched_state: z.string().optional().nullable(),
  graduation_cutoff_aware: z.boolean().default(false),
  previous_training_details: z.string().optional().nullable(),
  dark_mode: z.boolean().default(false),
});

/**
 * Validate and sanitize profile data before database operations
 * Returns { success: true, data } or { success: false, errors }
 */
export function validateProfile(data, isEdit = false) {
  const sanitizedData = { ...data };
  if (sanitizedData.fellowship_type === '') sanitizedData.fellowship_type = null;
  if (sanitizedData.graduation_year === '' || Number.isNaN(sanitizedData.graduation_year)) sanitizedData.graduation_year = null;

  const schema = isEdit ? ProfileEditSchema : OnboardingProfileSchema;
  const result = schema.safeParse(sanitizedData);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Format Zod errors for user-friendly display
  const errors = result.error.flatten().fieldErrors;
  const errorMessages = Object.entries(errors).map(([field, messages]) => ({
    field,
    message: messages.join(', '),
  }));
  
  return { success: false, errors: errorMessages };
}

/**
 * Validate profile data for database upsert
 * Strips undefined values and ensures required fields
 */
export function prepareProfileForUpsert(data, userId) {
  const validated = validateProfile(data);
  if (!validated.success) {
    throw new Error(`Validation failed: ${validated.errors.map(e => `${e.field}: ${e.message}`).join('; ')}`);
  }
  
  const finalMedicalSchool = (validated.data.medical_school === 'Other' && validated.data.medical_school_custom)
    ? validated.data.medical_school_custom
    : validated.data.medical_school;

  const finalSpecialty = (validated.data.target_specialty === 'Other' && validated.data.target_specialty_custom)
    ? validated.data.target_specialty_custom
    : validated.data.target_specialty;

  const finalFellowshipType = (validated.data.fellowship_type === 'Other' && validated.data.fellowship_type_custom)
    ? validated.data.fellowship_type_custom
    : validated.data.fellowship_type;

  const payload = {
    user_id: userId,
    ...validated.data,
    medical_school: finalMedicalSchool,
    target_specialty: finalSpecialty || null,
    fellowship_type: finalFellowshipType || null,
    onboarding_complete: true,
    // Ensure arrays are never undefined
    languages: validated.data.languages || ['en'],
    badges: [],
    points: 0,
    is_mentor: false,
    mentor_verified: false,
    // Convert empty strings to null for optional fields
    target_city: validated.data.target_city || null,
    target_state: validated.data.target_state || null,
    undergraduate_college: validated.data.undergraduate_college || null,
    graduation_year: validated.data.graduation_year ?? null,
    usmle_step1_score: validated.data.usmle_step1_score || null,
    usmle_step2_score: validated.data.usmle_step2_score || null,
    previous_training: validated.data.previous_training || null,
  };

  delete payload.medical_school_custom;
  delete payload.target_specialty_custom;
  delete payload.fellowship_type_custom;
  return payload;
}
