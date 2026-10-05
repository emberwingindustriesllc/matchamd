/**
 * Moderation API for community reports.
 *
 * Why this module exists
 * ----------------------
 * Until 2026-10-05, a "scam report" against a named hospital became publicly
 * visible the moment it was submitted. That is a defamation surface against
 * real institutions and it grows with every user. The database now enforces
 * review-before-publication (only `status = 'verified'` and unexpired rows are
 * publicly readable), which means the moderation queue is not optional
 * plumbing -- if nobody works it, the feature silently never publishes.
 *
 * The decision that matters most here: `verifyScamReport` requires the
 * moderator to be the one who authored the ORIGINAL report to be blocked.
 * A reporter must never be able to approve their own accusation, because the
 * whole safety property is that publication is a second pair of eyes.
 *
 * A note on authority: `is_verified_contributor()` is a SECURITY DEFINER
 * function, so these calls are additionally gated by the RLS UPDATE policy on
 * `scam_reports`. The client checks are for UX only -- the database is what
 * actually enforces it.
 */

import { supabase } from '@/api/supabaseClient';

/** The four states a report can be in. */
export const REPORT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  DISMISSED: 'dismissed',
  EXPIRED: 'expired',
};

/** Reports younger than this are too new to have expired. */
export const REPORT_TTL_MONTHS = 12;

/** Public reads must mirror the RLS policy exactly, or we leak pending rows. */
const PUBLIC_FILTER = 'status=eq.verified';

/**
 * Fetch the moderation queue (pending + recently actioned reports).
 * Moderators only -- the RLS policy denies this to everyone else.
 */
export async function fetchModerationQueue({ includeResolved = false } = {}) {
  const { data, error } = await supabase
    .from('scam_reports')
    .select('*')
    .order('submitted_at', { ascending: true })
    .limit(100);

  if (error) {
    console.warn('Could not load moderation queue:', error.message);
    return [];
  }

  const rows = data || [];
  const visible = includeResolved
    ? rows
    : rows.filter((r) => r.status === REPORT_STATUS.PENDING);
  return visible;
}

/**
 * Fetch only reports that are publicly visible (verified + unexpired).
 * This is what ProgramDetail should use, never fetchModerationQueue.
 */
export async function fetchPublishedScamReports(programId = null) {
  let query = supabase
    .from('scam_reports')
    .select('*')
    .eq('status', REPORT_STATUS.VERIFIED)
    .order('reviewed_at', { ascending: false })
    .limit(50);

  if (programId) {
    query = query.eq('program_id', programId);
  }

  const { data, error } = await query;
  if (error) {
    // A permissions error here must not render as "no scams found", which
    // would be a false all-clear.
    console.warn('Could not load published scam reports:', error.message);
    return [];
  }

  // Defence in depth: RLS already filters, but never hand the UI a row that
  // has expired even if the query somehow returned one.
  const now = Date.now();
  return (data || []).filter((r) => {
    if (!r.expires_at) return true;
    return new Date(r.expires_at).getTime() > now;
  });
}

/**
 * Is this report expired? An accusation about a residency program is not a
 * permanent fact, so verified reports carry a 12-month life.
 */
export function isReportExpired(report, now = Date.now()) {
  if (!report?.expires_at) return false;
  return new Date(report.expires_at).getTime() <= now;
}

/**
 * Can this reviewer action this report?
 *
 * The self-approval block is the load-bearing rule: publication must be a
 * second pair of eyes, so a reporter can never verify their own accusation.
 */
export function canModerateReport(report, reviewerUserId) {
  if (!report || !reviewerUserId) return false;
  if (report.status !== REPORT_STATUS.PENDING) return false;
  if (report.reporter_id && report.reporter_id === reviewerUserId) return false;
  return true;
}

/** Human-readable reason a reviewer cannot action a report. */
export function moderationBlockReason(report, reviewerUserId) {
  if (!report) return 'Report not found.';
  if (report.reporter_id && report.reporter_id === reviewerUserId) {
    return 'You filed this report. A different moderator must review it.';
  }
  if (report.status !== REPORT_STATUS.PENDING) {
    return `Already actioned (${String(report.status).replace('_', ' ')}).`;
  }
  return null;
}

/**
 * Publish a report: status -> verified, with an expiry.
 *
 * Blocked for the report's own author (see canModerateReport) and, in the
 * database, for anyone without verified_contributor.
 */
export async function verifyScamReport(reportId, { reviewerUserId, notes = '' } = {}) {
  const { data: current, error: fetchError } = await supabase
    .from('scam_reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  if (!canModerateReport(current, reviewerUserId)) {
    throw new Error(moderationBlockReason(current, reviewerUserId) || 'Not permitted.');
  }

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + REPORT_TTL_MONTHS);

  const { data, error } = await supabase
    .from('scam_reports')
    .update({
      status: REPORT_STATUS.VERIFIED,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerUserId,
      review_notes: notes,
      expires_at: expiresAt.toISOString(),
      evidence_verified: true,
    })
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/** Reject a report: status -> dismissed. Never public. */
export async function dismissScamReport(reportId, { reviewerUserId, notes = '' } = {}) {
  const { data: current, error: fetchError } = await supabase
    .from('scam_reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  if (!canModerateReport(current, reviewerUserId)) {
    throw new Error(moderationBlockReason(current, reviewerUserId) || 'Not permitted.');
  }

  const { data, error } = await supabase
    .from('scam_reports')
    .update({
      status: REPORT_STATUS.DISMISSED,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerUserId,
      review_notes: notes,
      // Dismissed rows must never count as published, so clear any expiry that
      // a previous review may have set.
      expires_at: null,
    })
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Verified per-program report counts, from the public view.
 *
 * Deliberately NOT the raw scam_reports table: a count that included pending
 * or expired reports would tell a user "3 reports" against a named hospital
 * when none were verified.
 */
export async function fetchVerifiedScamReportCounts() {
  const { data, error } = await supabase
    .from('public_scam_report_counts')
    .select('program_id, verified_scam_report_count');

  if (error) {
    console.warn('Could not load verified scam counts:', error.message);
    return {};
  }

  const counts = {};
  (data || []).forEach((row) => {
    if (row.program_id) counts[row.program_id] = Number(row.verified_scam_report_count) || 0;
  });
  return counts;
}

/**
 * How long ago was this report filed, for the queue's age column.
 * Oldest-first matters: a report sitting for weeks is a report someone is
 * waiting on.
 */
export function reportAgeLabel(report, now = Date.now()) {
  const ts = report?.submitted_at || report?.created_at;
  if (!ts) return 'unknown';
  const days = Math.floor((now - new Date(ts).getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? '' : 's'}`;
}