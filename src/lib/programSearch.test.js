import { describe, it, expect } from 'vitest';
import {
  filterIMGPrograms,
  hasActiveIMGFilters,
  calculateFitScore,
} from './programSearch';

const samplePrograms = [
  {
    id: 'p1',
    program_name: 'Cook County Internal Medicine',
    institution: 'Cook County Health',
    specialty: 'Internal Medicine',
    region: 'Midwest',
    state: 'IL',
    visa_j1: true,
    visa_h1b: false,
    program_size: 120,
    interview_format: 'Virtual',
  },
  {
    id: 'p2',
    program_name: 'Jacobi Family Medicine',
    institution: 'Jacobi Medical Center',
    specialty: 'Family Medicine',
    region: 'Northeast',
    state: 'NY',
    visa_j1: true,
    visa_h1b: true,
    program_size: 45,
    interview_format: 'In-Person',
  },
  {
    id: 'p3',
    program_name: 'Miami Pediatrics Residency',
    institution: 'Jackson Memorial Hospital',
    specialty: 'Pediatrics',
    region: 'South',
    state: 'FL',
    visa_j1: true,
    visa_h1b: false,
    program_size: 80,
    interview_format: 'Virtual',
  },
];

describe('programSearch pure helpers', () => {
  describe('filterIMGPrograms with multi-select', () => {
    it('filters by multiple specialties', () => {
      const results = filterIMGPrograms(samplePrograms, {
        specialties: ['Internal Medicine', 'Pediatrics'],
      });
      expect(results.map((p) => p.id)).toEqual(['p1', 'p3']);
    });

    it('filters by multiple regions', () => {
      const results = filterIMGPrograms(samplePrograms, {
        regions: ['Northeast', 'South'],
      });
      expect(results.map((p) => p.id)).toEqual(['p2', 'p3']);
    });

    it('filters by multiple states', () => {
      const results = filterIMGPrograms(samplePrograms, {
        states: ['IL', 'NY'],
      });
      expect(results.map((p) => p.id)).toEqual(['p1', 'p2']);
    });

    it('combines multi-specialty and multi-region filtering', () => {
      const results = filterIMGPrograms(samplePrograms, {
        specialties: ['Internal Medicine', 'Family Medicine', 'Pediatrics'],
        regions: ['Midwest', 'Northeast'],
      });
      expect(results.map((p) => p.id)).toEqual(['p1', 'p2']);
    });

    it('falls back to single specialty/region if array not passed', () => {
      const results = filterIMGPrograms(samplePrograms, {
        specialty: 'Family Medicine',
        region: 'Northeast',
      });
      expect(results.map((p) => p.id)).toEqual(['p2']);
    });
    it('filters by statewide location chip (e.g. West Virginia or WV)', () => {
      const wvPrograms = [
        ...samplePrograms,
        {
          id: 'p_wv1',
          program_name: 'Marshall Pediatrics',
          city: 'Huntington',
          state: 'WV',
          specialty: 'Pediatrics'
        },
        {
          id: 'p_wv2',
          program_name: 'WVU Internal Medicine',
          city: 'Morgantown',
          state: 'WV',
          specialty: 'Internal Medicine'
        }
      ];

      const results = filterIMGPrograms(wvPrograms, {
        locations: ['West Virginia (Entire State)']
      });
      expect(results.map(p => p.id)).toEqual(['p_wv1', 'p_wv2']);

      const resultsAbbr = filterIMGPrograms(wvPrograms, {
        locations: ['WV']
      });
      expect(resultsAbbr.map(p => p.id)).toEqual(['p_wv1', 'p_wv2']);
    });

    it('filters by specific city and state location chip', () => {
      const wvPrograms = [
        ...samplePrograms,
        {
          id: 'p_wv1',
          program_name: 'Marshall Pediatrics',
          city: 'Huntington',
          state: 'WV',
          specialty: 'Pediatrics'
        },
        {
          id: 'p_wv2',
          program_name: 'WVU Internal Medicine',
          city: 'Morgantown',
          state: 'WV',
          specialty: 'Internal Medicine'
        }
      ];

      const results = filterIMGPrograms(wvPrograms, {
        locations: ['Huntington, WV']
      });
      expect(results.map(p => p.id)).toEqual(['p_wv1']);
    });
  });

  describe('hasActiveIMGFilters', () => {
    it('returns false for empty/default filters', () => {
      expect(hasActiveIMGFilters({})).toBe(false);
      expect(hasActiveIMGFilters({ specialty: 'all', region: 'all' })).toBe(false);
    });

    it('returns true when multi-specialties are selected', () => {
      expect(hasActiveIMGFilters({ specialties: ['Internal Medicine'] })).toBe(true);
    });

    it('returns true when multi-regions or multi-states are selected', () => {
      expect(hasActiveIMGFilters({ regions: ['Northeast'] })).toBe(true);
      expect(hasActiveIMGFilters({ states: ['NY', 'NJ'] })).toBe(true);
    });
  });
});
