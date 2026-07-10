import { describe, it, expect } from 'vitest';
import { 
  OnboardingProfileSchema, 
  ProfileEditSchema, 
  UserProfileSchema,
  validateProfile,
  prepareProfileForUpsert 
} from '@/lib/validation/profileSchema';

describe('Profile Validation Schemas', () => {
  const validBaseProfile = {
    display_name: 'Dr. Test User',
    country: 'India',
    country_of_origin: 'India',
    medical_school_country: 'India',
    medical_school: 'AIIMS',
    primary_goal: 'residency',
    target_specialty: 'Internal Medicine',
    target_city: 'New York',
    target_state: 'NY',
    undergraduate_college: 'IIT Delhi',
    languages: ['en', 'hi'],
    preferred_language: 'en',
    visa_status: 'none',
    conrad_30_waiver_planned: false,
    graduation_year: 2020,
    usmle_step1_status: 'passed',
    usmle_step1_score: '240',
    usmle_step2_status: 'passed',
    usmle_step2_score: '250',
    usmle_step3_status: 'not_started',
    ecfmg_certified: false,
    acgme_waiver: false,
    previous_training: '',
    us_clinical_experience: false,
  };

  describe('OnboardingProfileSchema', () => {
    it('accepts valid residency profile', () => {
      const result = OnboardingProfileSchema.safeParse(validBaseProfile);
      expect(result.success).toBe(true);
    });

    it('accepts valid fellowship profile', () => {
      const fellowshipProfile = {
        ...validBaseProfile,
        primary_goal: 'fellowship',
        fellowship_type: 'internal_medicine',
        target_specialty: 'Cardiology',
      };
      const result = OnboardingProfileSchema.safeParse(fellowshipProfile);
      expect(result.success).toBe(true);
    });

    it('accepts valid med_school profile', () => {
      const medSchoolProfile = {
        ...validBaseProfile,
        primary_goal: 'med_school',
        target_specialty: undefined,
      };
      const result = OnboardingProfileSchema.safeParse(medSchoolProfile);
      expect(result.success).toBe(true);
    });

    it('rejects missing display_name', () => {
      const result = OnboardingProfileSchema.safeParse({
        ...validBaseProfile,
        display_name: '',
      });
      expect(result.success).toBe(false);
      expect(result.error.flatten().fieldErrors.display_name).toContain('Display name is required');
    });

    it('rejects missing country', () => {
      const result = OnboardingProfileSchema.safeParse({
        ...validBaseProfile,
        country: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing medical_school', () => {
      const result = OnboardingProfileSchema.safeParse({
        ...validBaseProfile,
        medical_school: '',
      });
      expect(result.success).toBe(false);
    });

    it('requires fellowship_type when primary_goal is fellowship', () => {
      const result = OnboardingProfileSchema.safeParse({
        ...validBaseProfile,
        primary_goal: 'fellowship',
        fellowship_type: undefined,
      });
      expect(result.success).toBe(false);
      expect(result.error.flatten().fieldErrors.fellowship_type).toBeDefined();
    });

    it('requires target_specialty when primary_goal is residency', () => {
      const result = OnboardingProfileSchema.safeParse({
        ...validBaseProfile,
        primary_goal: 'residency',
        target_specialty: undefined,
      });
      expect(result.success).toBe(false);
    });

    it('does NOT require usmle_step1_score when step1_status is passed', () => {
      const result = OnboardingProfileSchema.safeParse({
        ...validBaseProfile,
        usmle_step1_status: 'passed',
        usmle_step1_score: '',
      });
      expect(result.success).toBe(true);
    });

    it('requires usmle_step2_score when step2_status is passed', () => {
      const result = OnboardingProfileSchema.safeParse({
        ...validBaseProfile,
        usmle_step2_status: 'passed',
        usmle_step2_score: '',
      });
      expect(result.success).toBe(false);
    });

    it('validates language codes', () => {
      const result = OnboardingProfileSchema.safeParse({
        ...validBaseProfile,
        languages: ['en', 'invalid'],
      });
      expect(result.success).toBe(false);
    });

    it('defaults preferred_language to en', () => {
      const { preferred_language, ...rest } = validBaseProfile;
      const result = OnboardingProfileSchema.safeParse(rest);
      expect(result.success).toBe(true);
      expect(result.data.preferred_language).toBe('en');
    });

    it('defaults languages to ["en"]', () => {
      const { languages, ...rest } = validBaseProfile;
      const result = OnboardingProfileSchema.safeParse(rest);
      expect(result.success).toBe(true);
      expect(result.data.languages).toEqual(['en']);
    });
  });

  describe('ProfileEditSchema', () => {
    it('allows partial updates', () => {
      const result = ProfileEditSchema.safeParse({
        display_name: 'New Name',
        bio: 'Updated bio',
      });
      expect(result.success).toBe(true);
    });

    it('allows empty bio', () => {
      const result = ProfileEditSchema.safeParse({
        bio: '',
      });
      expect(result.success).toBe(true);
    });

    it('validates avatar_url as URL', () => {
      const result = ProfileEditSchema.safeParse({
        avatar_url: 'https://example.com/avatar.png',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid avatar_url', () => {
      const result = ProfileEditSchema.safeParse({
        avatar_url: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('validateProfile function', () => {
    it('returns success with data for valid profile', () => {
      const result = validateProfile(validBaseProfile);
      expect(result.success).toBe(true);
      expect(result.data.display_name).toBe('Dr. Test User');
    });

    it('returns formatted errors for invalid profile', () => {
      const result = validateProfile({
        ...validBaseProfile,
        display_name: '',
        country: '',
      });
      expect(result.success).toBe(false);
      expect(result.errors).toBeInstanceOf(Array);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toHaveProperty('field');
      expect(result.errors[0]).toHaveProperty('message');
    });
  });

  describe('prepareProfileForUpsert function', () => {
    it('prepares valid profile with user_id', () => {
      const result = prepareProfileForUpsert(validBaseProfile, 'user-123');
      expect(result.user_id).toBe('user-123');
      expect(result.onboarding_complete).toBe(true);
      expect(result.badges).toEqual([]);
      expect(result.points).toBe(0);
    });

    it('converts empty strings to null for optional fields', () => {
      const result = prepareProfileForUpsert({
        ...validBaseProfile,
        target_city: '',
        target_state: '',
        undergraduate_college: '',
      }, 'user-123');
      expect(result.target_city).toBeNull();
      expect(result.target_state).toBeNull();
      expect(result.undergraduate_college).toBeNull();
    });

    it('throws on validation failure', () => {
      expect(() => prepareProfileForUpsert({
        ...validBaseProfile,
        display_name: '',
      }, 'user-123')).toThrow('Validation failed');
    });
  });
});