import { describe, it, expect } from 'vitest';
import { generateProfileSummaryText, exportProfileAsJSON } from './profileExporter';

describe('profileExporter', () => {
  const mockProfile = {
    display_name: 'Dr. Jane Doe',
    target_specialty: 'Pediatrics',
    target_city: 'Huntington',
    target_state: 'WV',
    medical_school: 'Aga Khan University',
    medical_school_country: 'Pakistan',
    wfme_certified: 'yes',
    usmle_step1_score: 'Pass',
    usmle_step2_score: 248,
    usmle_step3_result: 'pass',
    visa_status: 'J1',
    acgme_waiver: false,
    previous_training: '1 year pediatric internship',
    bio: 'Aspiring pediatric resident interested in neonatology.'
  };

  const mockUser = {
    full_name: 'Jane Doe',
    email: 'jane.doe@example.com'
  };

  it('generates a comprehensive formatted candidate profile summary text', () => {
    const text = generateProfileSummaryText(mockProfile, mockUser);
    expect(text).toContain('Dr. Jane Doe');
    expect(text).toContain('jane.doe@example.com');
    expect(text).toContain('Pediatrics');
    expect(text).toContain('Huntington, WV');
    expect(text).toContain('Aga Khan University (Pakistan)');
    expect(text).toContain('Verified WFME / ECFMG Recognized');
    expect(text).toContain('248');
    expect(text).toContain('J1');
  });

  it('handles missing or partial profile values gracefully', () => {
    const text = generateProfileSummaryText(null, { email: 'test@example.com' });
    expect(text).toContain('Medical Residency Applicant');
    expect(text).toContain('test@example.com');
    expect(text).toContain('Not specified');
  });
});
