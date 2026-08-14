import { describe, it, expect } from 'vitest';
import { expandMedicalSearchTerms } from './medicalSynonyms';
import { filterIMGPrograms } from './programSearch';

const mockPrograms = [
  {
    id: '1',
    name: 'Rutgers OB/GYN Residency',
    institution: 'Rutgers Health',
    specialty: ['Obstetrics and Gynecology'],
    city: 'Livingston',
    state: 'NJ'
  },
  {
    id: '2',
    name: 'Childrens Hospital Pediatric Hematology Fellowship',
    institution: 'CHOP',
    specialty: ['Pediatric Hematology/Oncology (Pediatrics)'],
    city: 'Philadelphia',
    state: 'PA'
  },
  {
    id: '3',
    name: 'Cook County Internal Medicine',
    institution: 'Cook County Health',
    specialty: ['Internal Medicine'],
    city: 'Chicago',
    state: 'IL'
  }
];

describe('Medical Synonyms & Misspelling Search Expansion', () => {
  it('expands obgyn and misspellings like obsetrics to Obstetrics and Gynecology', () => {
    expect(expandMedicalSearchTerms('obgyn')).toContain('obstetrics and gynecology');
    expect(expandMedicalSearchTerms('ob/gyn')).toContain('obstetrics and gynecology');
    expect(expandMedicalSearchTerms('obsetrics')).toContain('obstetrics and gynecology');
    expect(expandMedicalSearchTerms('gyn')).toContain('obstetrics and gynecology');
  });

  it('expands peds hemonc to Pediatric Hematology-Oncology', () => {
    expect(expandMedicalSearchTerms('peds hemonc')).toContain('pediatric hematology-oncology');
    expect(expandMedicalSearchTerms('ped hemonc')).toContain('pediatric hematology-oncology');
  });

  it('matches OB/GYN program when user searches "obsetrics"', () => {
    const results = filterIMGPrograms(mockPrograms, { searchQuery: 'obsetrics' });
    expect(results.map(r => r.id)).toContain('1');
  });

  it('matches Pediatric Hematology program when user searches "peds hemonc"', () => {
    const results = filterIMGPrograms(mockPrograms, { searchQuery: 'peds hemonc' });
    expect(results.map(r => r.id)).toContain('2');
  });

  it('matches Internal Medicine program when user searches "im"', () => {
    const results = filterIMGPrograms(mockPrograms, { searchQuery: 'im' });
    expect(results.map(r => r.id)).toContain('3');
  });
});
