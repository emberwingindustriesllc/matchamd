/**
 * Search Parser Tests
 * 
 * Tests for the query parsing and specialty alias matching.
 * Run: node src/lib/search/searchParser.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  normalizeQuery,
  normalizeAlias,
  tokenizeQuery,
  isProgramTypeTerm,
  extractProgramTypeFromQuery,
  lookupSpecialtyAlias,
  matchSpecialtyFromTokens,
  parseSearchQuery,
  calculateRelevanceScore,
  buildAliasMap,
  DEFAULT_ALIAS_MAP,
} from './queryParser.js';

// ─── Helper: build a local alias map from DEFAULT_ALIAS_MAP ──────────────────
function localAliasMap() {
  const map = {};
  for (const [alias, canonical] of Object.entries(DEFAULT_ALIAS_MAP)) {
    map[normalizeAlias(alias)] = canonical;
    map[normalizeAlias(canonical)] = canonical;
  }
  return map;
}

const ALIAS_MAP = localAliasMap();

// ─── normalizeQuery ──────────────────────────────────────────────────────────

describe('normalizeQuery', () => {
  it('lowercases and trims', () => {
    assert.strictEqual(normalizeQuery('  OB/GYN  '), 'ob gyn');
    assert.strictEqual(normalizeQuery('Internal Medicine'), 'internal medicine');
  });

  it('normalizes / to space', () => {
    assert.strictEqual(normalizeQuery('OB/GYN'), 'ob gyn');
    assert.strictEqual(normalizeQuery('heme/oncology'), 'heme oncology');
  });

  it('normalizes - to space', () => {
    assert.strictEqual(normalizeQuery('OB-GYN'), 'ob gyn');
    assert.strictEqual(normalizeQuery('heme-onc'), 'heme onc');
  });

  it('normalizes & to space', () => {
    assert.strictEqual(normalizeQuery('Obstetrics & Gynecology'), 'obstetrics and gynecology');
  });

  it('collapses multiple spaces', () => {
    assert.strictEqual(normalizeQuery('OB   GYN'), 'ob gyn');
  });

  it('handles empty/null', () => {
    assert.strictEqual(normalizeQuery(''), '');
    assert.strictEqual(normalizeQuery(null), '');
  });
});

// ─── normalizeAlias ──────────────────────────────────────────────────────────

describe('normalizeAlias', () => {
  it('same as normalizeQuery', () => {
    assert.strictEqual(normalizeAlias('OB/GYN'), normalizeQuery('OB/GYN'));
    assert.strictEqual(normalizeAlias('heme-onc'), normalizeQuery('heme-onc'));
  });
});

// ─── tokenizeQuery ───────────────────────────────────────────────────────────

describe('tokenizeQuery', () => {
  it('splits on whitespace', () => {
    assert.deepStrictEqual(tokenizeQuery('OB/GYN residency'), ['ob', 'gyn', 'residency']);
    assert.deepStrictEqual(tokenizeQuery('heme onc fellowship'), ['heme', 'onc', 'fellowship']);
  });

  it('handles single token', () => {
    assert.deepStrictEqual(tokenizeQuery('OBGYN'), ['obgyn']);
  });

  it('handles empty', () => {
    assert.deepStrictEqual(tokenizeQuery(''), []);
    assert.deepStrictEqual(tokenizeQuery(null), []);
  });
});

// ─── isProgramTypeTerm ───────────────────────────────────────────────────────

describe('isProgramTypeTerm', () => {
  it('recognizes residency terms', () => {
    assert.strictEqual(isProgramTypeTerm('residency'), 'residency');
    assert.strictEqual(isProgramTypeTerm('residencies'), 'residency');
    assert.strictEqual(isProgramTypeTerm('res'), 'residency');
  });

  it('recognizes fellowship terms', () => {
    assert.strictEqual(isProgramTypeTerm('fellowship'), 'fellowship');
    assert.strictEqual(isProgramTypeTerm('fellows'), 'fellowship');
    assert.strictEqual(isProgramTypeTerm('fellow'), 'fellowship');
  });

  it('recognizes observorship terms', () => {
    assert.strictEqual(isProgramTypeTerm('observership'), 'observership');
    assert.strictEqual(isProgramTypeTerm('observerships'), 'observership');
  });

  it('recognizes medical school terms', () => {
    assert.strictEqual(isProgramTypeTerm('medical school'), 'medical_school');
    assert.strictEqual(isProgramTypeTerm('med school'), 'medical_school');
    assert.strictEqual(isProgramTypeTerm('medschool'), 'medical_school');
  });

  it('returns null for non-program-type tokens', () => {
    assert.strictEqual(isProgramTypeTerm('OB/GYN'), null);
    assert.strictEqual(isProgramTypeTerm('pediatrics'), null);
    assert.strictEqual(isProgramTypeTerm('california'), null);
  });
});

// ─── extractProgramTypeFromQuery ─────────────────────────────────────────────

describe('extractProgramTypeFromQuery', () => {
  it('extracts residency from full query', () => {
    assert.strictEqual(extractProgramTypeFromQuery('OB/GYN residency'), 'residency');
    assert.strictEqual(extractProgramTypeFromQuery('IM residency'), 'residency');
    assert.strictEqual(extractProgramTypeFromQuery('peds residency california'), 'residency');
  });

  it('extracts fellowship from full query', () => {
    assert.strictEqual(extractProgramTypeFromQuery('heme onc fellowship'), 'fellowship');
    assert.strictEqual(extractProgramTypeFromQuery('cardiology fellowship'), 'fellowship');
    assert.strictEqual(extractProgramTypeFromQuery('GI fellowship'), 'fellowship');
  });

  it('extracts medical_school from query', () => {
    assert.strictEqual(extractProgramTypeFromQuery('medical school'), 'medical_school');
    assert.strictEqual(extractProgramTypeFromQuery('med school'), 'medical_school');
    assert.strictEqual(extractProgramTypeFromQuery('medschool'), 'medical_school');
  });

  it('extracts observership', () => {
    assert.strictEqual(extractProgramTypeFromQuery('surgical observership'), 'observership');
  });

  it('returns null for query without program type term', () => {
    assert.strictEqual(extractProgramTypeFromQuery('OB/GYN'), null);
    assert.strictEqual(extractProgramTypeFromQuery('pediatrics'), null);
  });
});

// ─── lookupSpecialtyAlias ────────────────────────────────────────────────────

describe('lookupSpecialtyAlias', () => {
  it('finds canonical specialty for normalized alias', () => {
    assert.strictEqual(
      lookupSpecialtyAlias('ob gyn', ALIAS_MAP),
      'Obstetrics and Gynecology'
    );
    assert.strictEqual(
      lookupSpecialtyAlias('obgyn', ALIAS_MAP),
      'Obstetrics and Gynecology'
    );
    assert.strictEqual(
      lookupSpecialtyAlias('im', ALIAS_MAP),
      'Internal Medicine'
    );
    assert.strictEqual(
      lookupSpecialtyAlias('peds', ALIAS_MAP),
      'Pediatrics'
    );
    assert.strictEqual(
      lookupSpecialtyAlias('heme onc', ALIAS_MAP),
      'Hematology/Oncology'
    );
  });

  it('returns null for unknown alias', () => {
    assert.strictEqual(lookupSpecialtyAlias('xyz', ALIAS_MAP), null);
  });

  it('returns null without alias map', () => {
    assert.strictEqual(lookupSpecialtyAlias('obgyn', null), null);
  });
});

// ─── matchSpecialtyFromTokens ─────────────────────────────────────────────────

describe('matchSpecialtyFromTokens', () => {
  it('matches multi-token alias', () => {
    const tokens = ['ob', 'gyn'];
    assert.strictEqual(
      matchSpecialtyFromTokens(tokens, ALIAS_MAP),
      'Obstetrics and Gynecology'
    );
  });

  it('matches single-token alias', () => {
    const tokens = ['peds'];
    assert.strictEqual(
      matchSpecialtyFromTokens(tokens, ALIAS_MAP),
      'Pediatrics'
    );
  });

  it('matches longer alias', () => {
    const tokens = ['heme', 'onc'];
    assert.strictEqual(
      matchSpecialtyFromTokens(tokens, ALIAS_MAP),
      'Hematology/Oncology'
    );
  });

  it('handles tokens with no match', () => {
    const tokens = ['xyz', 'abc'];
    assert.strictEqual(matchSpecialtyFromTokens(tokens, ALIAS_MAP), null);
  });

  it('returns null without alias map', () => {
    assert.strictEqual(matchSpecialtyFromTokens(['ob', 'gyn'], null), null);
  });
});

// ─── parseSearchQuery ─────────────────────────────────────────────────────────

describe('parseSearchQuery', () => {
  it('parses "OB/GYN residency"', () => {
    const result = parseSearchQuery('OB/GYN residency', ALIAS_MAP);
    assert.strictEqual(result.raw, 'OB/GYN residency');
    assert.strictEqual(result.programType, 'residency');
    assert.strictEqual(result.specialty, 'Obstetrics and Gynecology');
    assert.ok(result.freeTextTokens.includes('ob'));
    assert.ok(result.freeTextTokens.includes('gyn'));
    assert.ok(result.hasExplicitFilters);
  });

  it('parses "heme onc fellowship"', () => {
    const result = parseSearchQuery('heme onc fellowship', ALIAS_MAP);
    assert.strictEqual(result.programType, 'fellowship');
    assert.strictEqual(result.specialty, 'Hematology/Oncology');
    assert.ok(result.hasExplicitFilters);
  });

  it('parses "IM residency"', () => {
    const result = parseSearchQuery('IM residency', ALIAS_MAP);
    assert.strictEqual(result.programType, 'residency');
    assert.strictEqual(result.specialty, 'Internal Medicine');
    assert.ok(result.hasExplicitFilters);
  });

  it('parses "peds residency"', () => {
    const result = parseSearchQuery('peds residency', ALIAS_MAP);
    assert.strictEqual(result.programType, 'residency');
    assert.strictEqual(result.specialty, 'Pediatrics');
  });

  it('parses "OBGYN" (no program type)', () => {
    const result = parseSearchQuery('OBGYN', ALIAS_MAP);
    assert.strictEqual(result.programType, null);
    assert.strictEqual(result.specialty, 'Obstetrics and Gynecology');
  });

  it('parses "internal medicine residency"', () => {
    const result = parseSearchQuery('internal medicine residency', ALIAS_MAP);
    assert.strictEqual(result.programType, 'residency');
    assert.strictEqual(result.specialty, 'Internal Medicine');
  });

  it('parses "family med"', () => {
    const result = parseSearchQuery('family med', ALIAS_MAP);
    assert.strictEqual(result.programType, null);
    assert.strictEqual(result.specialty, 'Family Medicine');
  });

  it('parses "cardiology fellowship"', () => {
    const result = parseSearchQuery('cardiology fellowship', ALIAS_MAP);
    assert.strictEqual(result.programType, 'fellowship');
    assert.strictEqual(result.specialty, 'Cardiology');
  });

  it('parses "pediatrics" (no program type)', () => {
    const result = parseSearchQuery('pediatrics', ALIAS_MAP);
    assert.strictEqual(result.programType, null);
    assert.strictEqual(result.specialty, 'Pediatrics');
  });

  it('strips program type terms from free text tokens', () => {
    const result = parseSearchQuery('OB/GYN residency', ALIAS_MAP);
    assert.strictEqual(result.freeTextTokens.includes('residency'), false);
    assert.ok(result.freeTextTokens.includes('ob'));
    assert.ok(result.freeTextTokens.includes('gyn'));
  });

  it('returns empty for empty query', () => {
    const result = parseSearchQuery('', ALIAS_MAP);
    assert.strictEqual(result.programType, null);
    assert.strictEqual(result.specialty, null);
    assert.deepStrictEqual(result.tokens, []);
  });
});

// ─── calculateRelevanceScore ─────────────────────────────────────────────────

describe('calculateRelevanceScore', () => {
  const baseProgram = {
    name: 'Cook County Internal Medicine Residency',
    institution: 'John H. Stroger, Jr. Hospital of Cook County',
    city: 'Chicago',
    state: 'IL',
    specialty: ['Internal Medicine'],
    program_type: 'residency',
    description: 'High-volume urban internal medicine residency',
    verified: true,
    created_at: new Date('2025-01-01'),
  };

  it('scores exact specialty match highly', () => {
    const parsed = parseSearchQuery('Internal Medicine', ALIAS_MAP);
    const score = calculateRelevanceScore(baseProgram, parsed, ALIAS_MAP);
    assert.ok(score >= 1000, `Expected >= 1000, got ${score}`);
  });

  it('scores exact program name match', () => {
    const parsed = parseSearchQuery('Cook County', ALIAS_MAP);
    const score = calculateRelevanceScore(baseProgram, parsed, ALIAS_MAP);
    assert.ok(score >= 600, `Expected >= 600, got ${score}`);
  });

  it('scores institution match', () => {
    const parsed = parseSearchQuery('Stroger', ALIAS_MAP);
    const score = calculateRelevanceScore(baseProgram, parsed, ALIAS_MAP);
    assert.ok(score >= 500, `Expected >= 500, got ${score}`);
  });

  it('scores city match', () => {
    const parsed = parseSearchQuery('Chicago', ALIAS_MAP);
    const score = calculateRelevanceScore(baseProgram, parsed, ALIAS_MAP);
    assert.ok(score >= 400, `Expected >= 400, got ${score}`);
  });

  it('gives low score for unrelated query', () => {
    const parsed = parseSearchQuery('neurosurgery', ALIAS_MAP);
    const score = calculateRelevanceScore(baseProgram, parsed, ALIAS_MAP);
    assert.strictEqual(score, 0);
  });

  it('returns 0 for empty parsed query', () => {
    const score = calculateRelevanceScore(baseProgram, null, ALIAS_MAP);
    assert.strictEqual(score, 0);
  });

  it('scores OB/GYN residency on OB/GYN specialty program', () => {
    const obProgram = {
      ...baseProgram,
      name: 'NYU Obstetrics and Gynecology Residency',
      specialty: ['Obstetrics and Gynecology'],
      program_type: 'residency',
    };
    const parsed = parseSearchQuery('OB/GYN residency', ALIAS_MAP);
    const score = calculateRelevanceScore(obProgram, parsed, ALIAS_MAP);
    assert.ok(score >= 1000, `Expected >= 1000, got ${score}`);
  });
});

// ─── Alias map building ──────────────────────────────────────────────────────

describe('buildAliasMap', () => {
  it('builds map from alias rows', () => {
    const rows = [
      { canonical_specialty: 'Obstetrics and Gynecology', alias: 'OB/GYN', normalized_alias: 'ob gyn' },
      { canonical_specialty: 'Internal Medicine', alias: 'IM', normalized_alias: 'im' },
    ];
    const map = buildAliasMap(rows);
    assert.strictEqual(map['ob gyn'], 'Obstetrics and Gynecology');
    assert.strictEqual(map['im'], 'Internal Medicine');
  });

  it('handles empty input', () => {
    assert.deepStrictEqual(buildAliasMap([]), {});
  });
});

console.log('All tests completed.');
