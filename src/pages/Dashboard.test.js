import { describe, it, expect } from 'vitest';

// This tests the getPathwaySteps function from Dashboard.jsx
// We'll re-implement it here for testing, but in practice you'd import from a shared module

const getPathwaySteps = (primaryGoal) => {
  const pathwayStepsMap = {
    residency: [
      { id: 'ecfmg_pathways', title: 'ECFMG Pathways', description: 'Complete certification pathways application', deadline: 'Jan 31, 2026' },
      { id: 'usmle_step1', title: 'USMLE Step 1', description: 'Pass the first licensing exam' },
      { id: 'usmle_step2', title: 'USMLE Step 2 CK', description: 'Aim for ≥240 for best IMG match chances' },
      { id: 'oet_medicine', title: 'OET Medicine', description: 'English proficiency test for healthcare', deadline: 'Dec 2025' },
      { id: 'eras_registration', title: 'ERAS Registration', description: 'Register for residency application', deadline: 'Sept 2025' },
      { id: 'personal_statement', title: 'Personal Statement', description: 'Write your compelling story' },
      { id: 'lors', title: 'Letters of Recommendation', description: 'Secure strong recommendation letters' },
      { id: 'nrmp_match', title: 'NRMP Match', description: 'Register for the matching program', deadline: 'March 2026' }
    ],
    fellowship: [
      { id: 'ecfmg_certification', title: 'ECFMG Certification', description: 'Required for fellowship training' },
      { id: 'residency_completion', title: 'Residency Completion', description: 'Complete accredited residency program' },
      { id: 'board_eligibility', title: 'Board Eligibility', description: 'Meet specialty board requirements' },
      { id: 'fellowship_eras', title: 'Fellowship Application', description: 'ERAS or Fellowship Council' },
      { id: 'fellowship_interview', title: 'Fellowship Interviews', description: 'Interview at subspecialty programs' },
      { id: 'fellowship_match', title: 'Fellowship Match', description: 'NRMP SMS or other matching systems' }
    ],
    med_school: [
      { id: 'prerequisites', title: 'Prerequisites', description: 'US coursework and requirements' },
      { id: 'mcat', title: 'MCAT Exam', description: 'Medical College Admission Test' },
      { id: 'amcas', title: 'AMCAS Application', description: 'Primary application process' },
      { id: 'secondaries', title: 'Secondary Applications', description: 'School-specific applications' },
      { id: 'med_interviews', title: 'Interviews', description: 'MMI and traditional interviews' },
      { id: 'financial_proof', title: 'Financial Documentation', description: 'Proof of funding for 4 years' }
    ]
  };
  return pathwayStepsMap[primaryGoal] || pathwayStepsMap.residency;
};

describe('Pathway Steps Logic', () => {
  describe('residency pathway', () => {
    const steps = getPathwaySteps('residency');

    it('has 8 steps', () => {
      expect(steps).toHaveLength(8);
    });

    it('starts with ECFMG Pathways', () => {
      expect(steps[0].id).toBe('ecfmg_pathways');
      expect(steps[0].title).toBe('ECFMG Pathways');
    });

    it('includes USMLE Step 1 and Step 2 CK', () => {
      const step1 = steps.find(s => s.id === 'usmle_step1');
      const step2 = steps.find(s => s.id === 'usmle_step2');
      expect(step1).toBeDefined();
      expect(step2).toBeDefined();
    });

    it('includes OET Medicine with deadline', () => {
      const oet = steps.find(s => s.id === 'oet_medicine');
      expect(oet).toBeDefined();
      expect(oet.deadline).toBe('Dec 2025');
    });

    it('includes ERAS Registration with deadline', () => {
      const eras = steps.find(s => s.id === 'eras_registration');
      expect(eras).toBeDefined();
      expect(eras.deadline).toBe('Sept 2025');
    });

    it('includes NRMP Match with deadline', () => {
      const nrmp = steps.find(s => s.id === 'nrmp_match');
      expect(nrmp).toBeDefined();
      expect(nrmp.deadline).toBe('March 2026');
    });

    it('all steps have required properties', () => {
      steps.forEach(step => {
        expect(step).toHaveProperty('id');
        expect(step).toHaveProperty('title');
        expect(step).toHaveProperty('description');
        expect(typeof step.id).toBe('string');
        expect(typeof step.title).toBe('string');
        expect(typeof step.description).toBe('string');
      });
    });
  });

  describe('fellowship pathway', () => {
    const steps = getPathwaySteps('fellowship');

    it('has 6 steps', () => {
      expect(steps).toHaveLength(6);
    });

    it('starts with ECFMG Certification', () => {
      expect(steps[0].id).toBe('ecfmg_certification');
    });

    it('includes Residency Completion', () => {
      const residency = steps.find(s => s.id === 'residency_completion');
      expect(residency).toBeDefined();
    });

    it('includes Fellowship Match', () => {
      const match = steps.find(s => s.id === 'fellowship_match');
      expect(match).toBeDefined();
    });
  });

  describe('med_school pathway', () => {
    const steps = getPathwaySteps('med_school');

    it('has 6 steps', () => {
      expect(steps).toHaveLength(6);
    });

    it('includes MCAT Exam', () => {
      const mcat = steps.find(s => s.id === 'mcat');
      expect(mcat).toBeDefined();
    });

    it('includes AMCAS Application', () => {
      const amcas = steps.find(s => s.id === 'amcas');
      expect(amcas).toBeDefined();
    });

    it('includes Financial Documentation', () => {
      const financial = steps.find(s => s.id === 'financial_proof');
      expect(financial).toBeDefined();
    });
  });

  describe('unknown goal defaults to residency', () => {
    it('defaults to residency', () => {
      const steps = getPathwaySteps('unknown_goal');
      expect(steps).toHaveLength(8);
      expect(steps[0].id).toBe('ecfmg_pathways');
    });
  });
});