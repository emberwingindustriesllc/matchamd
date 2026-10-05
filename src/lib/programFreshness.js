/**
 * Pure helpers for judging how current a program row's data is.
 *
 * `verified` alone is misleading: a program can have been verified years ago
 * and still be shown as confidently as one reviewed this morning. These helpers
 * derive a freshness level from the best timestamp available on the row, so the
 * UI can warn only when the age is actually worth warning about.
 */

/** Days after which any program data is considered stale. */
export const STALE_AFTER_DAYS = 365;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Fields are considered in descending order of trustworthiness:
 * an explicit review beats the row-creation time, which beats a vague
 * "data as of" the source gave us.
 */
const TIMESTAMP_FIELDS = ['last_reviewed_at', 'created_at', 'data_as_of'];

function parseTimestamp(value) {
  if (!value) return null;
  const ms = typeof value === 'number' ? value : Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Returns the timestamp (ms) the freshness verdict should be based on, or null.
 */
export function getFreshnessReference(program) {
  if (!program) return null;
  for (const field of TIMESTAMP_FIELDS) {
    const ms = parseTimestamp(program[field]);
    if (ms != null) return ms;
  }
  return null;
}

/**
 * @param {object} program   Row from the `programs` table.
 * @param {Date|number|string} [now] Injected clock, for deterministic tests.
 * @returns {{level: 'unverified'|'stale'|'ok', label: string, daysSinceReview: number|null}}
 *
 * - `unverified`: no usable timestamp at all.
 * - `stale`:    the newest timestamp is older than STALE_AFTER_DAYS.
 * - `ok`:        recent enough to say nothing.
 *
 * Negative day counts (timestamps dated in the future, e.g. clock skew or a
 * pre-planned data_as_of) clamp to 0 and stay `ok` rather than warn.
 */
export function describeDataFreshness(program, now = Date.now()) {
  const nowMs = parseTimestamp(now) ?? Date.now();
  const referenceMs = getFreshnessReference(program);

  if (referenceMs == null) {
    return { level: 'unverified', label: 'Not reviewed', daysSinceReview: null };
  }

  const rawDays = Math.floor((nowMs - referenceMs) / MS_PER_DAY);
  const daysSinceReview = rawDays < 0 ? 0 : rawDays;

  if (daysSinceReview > STALE_AFTER_DAYS) {
    const years = Math.floor(daysSinceReview / 365);
    const age = years >= 1
      ? `${years} year${years > 1 ? 's' : ''} ago`
      : `${daysSinceReview} days ago`;
    return { level: 'stale', label: `Data may be outdated (${age})`, daysSinceReview };
  }

  return { level: 'ok', label: 'Recently reviewed', daysSinceReview };
}
