import { describe, it, expect } from 'vitest';
import { getProgramFitDetails } from '@/lib/programMatch';

describe('program match logic', () => {
  it('boosts fellowship programs that align with a user fellowship choice', () => {
    const profile = {
      visa_status: 'J1',
      usmle_step2_score: '250',
      us_clinical_experience: true,
      graduation_year: 2021,
      primary_goal: 'fellowship',
      fellowship_type: 'Pediatric Pulmonology',
      target_specialty: 'Pediatrics',
    };

    const program = {
      program_type: 'fellowship',
      specialty: 'Pediatrics',
      subspecialty: 'Pulmonology',
      visa_j1: true,
      step2_score_min: 230,
      step2_score_avg: 240,
      min_usce_months: 0,
      grad_year_cutoff: 5,
    };

    const details = getProgramFitDetails(profile, program);

    expect(details.score).toBeGreaterThan(90);
    expect(details.reasons.some(reason => reason.includes('fellowship match'))).toBe(true);
    expect(details.meetsAll).toBe(true);
  });

  it('penalizes programs that do not align with the selected fellowship area', () => {
    const profile = {
      visa_status: 'J1',
      usmle_step2_score: '250',
      us_clinical_experience: true,
      graduation_year: 2021,
      primary_goal: 'fellowship',
      fellowship_type: 'Pediatric Pulmonology',
      target_specialty: 'Pediatrics',
    };

    const program = {
      program_type: 'fellowship',
      specialty: 'Surgery',
      subspecialty: 'Spine Surgery',
      visa_j1: true,
      step2_score_min: 230,
      step2_score_avg: 240,
      min_usce_months: 0,
      grad_year_cutoff: 5,
    };

    const details = getProgramFitDetails(profile, program);

    expect(details.score).toBeLessThanOrEqual(92);
    expect(details.reasons.some(reason => reason.includes('Strong fellowship match'))).toBe(false);
  });
});
