import { describe, it, expect, vi, beforeEach } from 'vitest';
import { canProceed, countries, commonMedSchools, goals, residencySpecialties, visaStatusOptions } from '@/data/onboarding';

describe('Onboarding Data & Validation', () => {
  describe('canProceed', () => {
    const baseProfile = {
      display_name: '',
      country: '',
      medical_school_country: '',
      medical_school: '',
      visa_status: '',
      primary_goal: '',
    };

    it('step 0 requires display_name', () => {
      expect(canProceed(0, { ...baseProfile, display_name: '' })).toBe(false);
      expect(canProceed(0, { ...baseProfile, display_name: 'Dr. Smith' })).toBe(true);
    });

    it('step 1 requires country, medical_school_country, and medical_school', () => {
      expect(canProceed(1, { ...baseProfile, country: 'India' })).toBe(false);
      expect(canProceed(1, { ...baseProfile, country: 'India', medical_school_country: 'India' })).toBe(false);
      expect(canProceed(1, { ...baseProfile, country: 'India', medical_school_country: 'India', medical_school: 'AIIMS' })).toBe(true);
    });

    it('step 2 requires visa_status', () => {
      expect(canProceed(2, { ...baseProfile })).toBe(false);
      expect(canProceed(2, { ...baseProfile, visa_status: 'none' })).toBe(true);
      expect(canProceed(2, { ...baseProfile, visa_status: 'J1' })).toBe(true);
    });

    it('step 3 requires primary_goal', () => {
      expect(canProceed(3, { ...baseProfile })).toBe(false);
      expect(canProceed(3, { ...baseProfile, primary_goal: 'residency' })).toBe(true);
      expect(canProceed(3, { ...baseProfile, primary_goal: 'fellowship' })).toBe(true);
    });

    it('step 4 always passes', () => {
      expect(canProceed(4, baseProfile)).toBe(true);
    });
  });

  describe('countries', () => {
    it('includes major IMG source countries', () => {
      expect(countries).toContain('India');
      expect(countries).toContain('Pakistan');
      expect(countries).toContain('Nigeria');
      expect(countries).toContain('Philippines');
      expect(countries).toContain('Egypt');
    });

    it('includes "Other" as fallback', () => {
      expect(countries).toContain('Other');
    });
  });

  describe('commonMedSchools', () => {
    it('has schools for India', () => {
      expect(commonMedSchools['India']).toContain('AIIMS');
      expect(commonMedSchools['India']).toContain('Other');
    });

    it('has fallback for unknown countries', () => {
      expect(commonMedSchools['Other']).toEqual(['Other']);
    });
  });

  describe('goals', () => {
    it('has three goal types', () => {
      expect(goals).toHaveLength(3);
      expect(goals.map(g => g.id)).toEqual(['residency', 'fellowship', 'med_school']);
    });

    it('each goal has required properties', () => {
      goals.forEach(goal => {
        expect(goal).toHaveProperty('id');
        expect(goal).toHaveProperty('icon');
        expect(goal).toHaveProperty('title');
        expect(goal).toHaveProperty('description');
        expect(goal).toHaveProperty('color');
      });
    });
  });

  describe('residencySpecialties', () => {
    it('includes core specialties', () => {
      expect(residencySpecialties).toContain('Internal Medicine');
      expect(residencySpecialties).toContain('Family Medicine');
      expect(residencySpecialties).toContain('Pediatrics');
      expect(residencySpecialties).toContain('Surgery');
    });

    it('includes "Other" as fallback', () => {
      expect(residencySpecialties).toContain('Other');
    });
  });

  describe('visaStatusOptions', () => {
    it('includes all expected visa types', () => {
      const values = visaStatusOptions.map(v => v.value);
      expect(values).toContain('none');
      expect(values).toContain('J1');
      expect(values).toContain('H1B');
      expect(values).toContain('Citizen');
      expect(values).toContain('GreenCard');
      expect(values).toContain('Other');
    });

    it('each option has value and label', () => {
      visaStatusOptions.forEach(opt => {
        expect(opt).toHaveProperty('value');
        expect(opt).toHaveProperty('label');
        expect(typeof opt.label).toBe('string');
        expect(opt.label.length).toBeGreaterThan(0);
      });
    });
  });
});