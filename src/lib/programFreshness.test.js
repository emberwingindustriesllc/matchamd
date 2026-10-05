import { describe, it, expect } from 'vitest';
import {
  describeDataFreshness,
  getFreshnessReference,
  STALE_AFTER_DAYS,
} from '@/lib/programFreshness';

const NOW = Date.parse('2026-10-05T12:00:00.000Z');

const daysAgo = (days, from = NOW) =>
  new Date(from - days * 24 * 60 * 60 * 1000).toISOString();

describe('describeDataFreshness', () => {
  it('reports unverified when every timestamp field is missing', () => {
    const result = describeDataFreshness({ id: 'a', name: 'Test' }, NOW);
    expect(result.level).toBe('unverified');
    expect(result.daysSinceReview).toBeNull();
    expect(result.label).toBe('Not reviewed');
  });

  it('reports unverified for a null program row', () => {
    expect(describeDataFreshness(null, NOW).level).toBe('unverified');
    expect(describeDataFreshness(undefined, NOW).daysSinceReview).toBeNull();
  });

  it('reports unverified when timestamps are present but unparseable', () => {
    const result = describeDataFreshness({ last_reviewed_at: 'not-a-date' }, NOW);
    expect(result.level).toBe('unverified');
    expect(result.daysSinceReview).toBeNull();
  });

  it('reports ok for freshly reviewed data', () => {
    const result = describeDataFreshness({ last_reviewed_at: daysAgo(2) }, NOW);
    expect(result.level).toBe('ok');
    expect(result.daysSinceReview).toBe(2);
  });

  it('treats exactly the stale boundary as still ok', () => {
    const result = describeDataFreshness({ last_reviewed_at: daysAgo(STALE_AFTER_DAYS) }, NOW);
    expect(result.level).toBe('ok');
    expect(result.daysSinceReview).toBe(STALE_AFTER_DAYS);
  });

  it('flips to stale one day past the boundary', () => {
    const result = describeDataFreshness({ last_reviewed_at: daysAgo(STALE_AFTER_DAYS + 1) }, NOW);
    expect(result.level).toBe('stale');
    expect(result.daysSinceReview).toBe(STALE_AFTER_DAYS + 1);
    expect(result.label).toMatch(/outdated/);
  });

  it('falls back to created_at when last_reviewed_at is null', () => {
    const result = describeDataFreshness(
      { last_reviewed_at: null, created_at: daysAgo(10) },
      NOW,
    );
    expect(result.level).toBe('ok');
    expect(result.daysSinceReview).toBe(10);
  });

  it('falls back to created_at when last_reviewed_at is absent entirely', () => {
    const result = describeDataFreshness({ created_at: daysAgo(900) }, NOW);
    expect(result.level).toBe('stale');
    expect(result.daysSinceReview).toBe(900);
    expect(result.label).toContain('2 years ago');
  });

  it('falls back to data_as_of when both review and creation are missing', () => {
    const result = describeDataFreshness({ data_as_of: daysAgo(400) }, NOW);
    expect(result.level).toBe('stale');
    expect(result.daysSinceReview).toBe(400);
  });

  it('prefers last_reviewed_at over created_at when both exist', () => {
    const result = describeDataFreshness(
      { last_reviewed_at: daysAgo(1), created_at: daysAgo(1200) },
      NOW,
    );
    expect(result.daysSinceReview).toBe(1);
    expect(result.level).toBe('ok');
  });

  it('clamps future timestamps to 0 days and stays ok', () => {
    const result = describeDataFreshness({ last_reviewed_at: daysAgo(-5) }, NOW);
    expect(result.daysSinceReview).toBe(0);
    expect(result.level).toBe('ok');
  });

  it('accepts a Date or number as the injected clock', () => {
    const date = new Date(NOW);
    expect(describeDataFreshness({ last_reviewed_at: daysAgo(3) }, date).daysSinceReview).toBe(3);
    expect(describeDataFreshness({ last_reviewed_at: daysAgo(3) }, NOW).daysSinceReview).toBe(3);
  });

  it('defaults to the current time when no clock is injected', () => {
    const justNow = new Date().toISOString();
    expect(describeDataFreshness({ last_reviewed_at: justNow }).level).toBe('ok');
  });
});

describe('getFreshnessReference', () => {
  it('returns the ms timestamp of the first usable field', () => {
    const iso = daysAgo(5);
    expect(getFreshnessReference({ created_at: iso })).toBe(Date.parse(iso));
  });

  it('returns null when nothing is usable', () => {
    expect(getFreshnessReference({})).toBeNull();
    expect(getFreshnessReference(null)).toBeNull();
  });
});
