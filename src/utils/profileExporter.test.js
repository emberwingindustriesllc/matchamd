import { describe, it, expect, vi } from 'vitest';
import { generateProfileSummaryText, exportProfileAsJSON, exportFullUserDataArchive } from './profileExporter';

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
    id: 'user_123',
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

  it('exports user data archive without throwing', () => {
    // Mock DOM download anchor
    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = originalCreateElement(tag);
      if (tag === 'a') {
        el.click = clickSpy;
      }
      return el;
    });

    expect(() => exportFullUserDataArchive(mockProfile, mockUser)).not.toThrow();
    expect(clickSpy).toHaveBeenCalled();

    vi.restoreAllMocks();
  });
});
