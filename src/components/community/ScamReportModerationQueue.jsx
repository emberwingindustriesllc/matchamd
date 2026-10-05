import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, ShieldCheck, Clock, ExternalLink, Check, X,
  Loader2, AlertTriangle, Users, FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import {
  fetchModerationQueue,
  verifyScamReport,
  dismissScamReport,
  canModerateReport,
  moderationBlockReason,
  reportAgeLabel,
  REPORT_STATUS,
} from '@/api/moderation';

const CATEGORY_LABELS = {
  paid_rotation: 'Paid rotation / observership',
  fake_letter: 'Fake or purchased LoR',
  visa_fraud: 'Visa misrepresentation',
  money_for_match: 'Money for match / rank list',
  credential_fraud: 'Credential fraud',
  other: 'Other',
};

const ENTITY_LABELS = {
  physician: 'Individual physician',
  program: 'Residency / fellowship program',
  agency: 'Placement agency',
  other: 'Other',
};

/**
 * Scam report moderation queue.
 *
 * This screen is the other half of the safety design. The database refuses to
 * publish an unreviewed accusation; that is only a feature rather than a
 * silent dead end if a human actually works this queue.
 *
 * Rules encoded in the UI (mirrored, and independently enforced, in
 * src/api/moderation.js and in RLS):
 *  - nothing is public until a moderator verifies it
 *  - the person who filed a report can never be the one who approves it
 *  - verified reports expire after 12 months
 */
export default function ScamReportModerationQueue() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState({});

  const { data: queue = [], isLoading } = useQuery({
    queryKey: ['moderation-queue'],
    queryFn: () => fetchModerationQueue({ includeResolved: false }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
    queryClient.invalidateQueries({ queryKey: ['program-scams'] });
  };

  const verifyMutation = useMutation({
    mutationFn: (report) =>
      verifyScamReport(report.id, {
        reviewerUserId: user?.id,
        notes: notes[report.id] || '',
      }),
    onSuccess: (data) => {
      toast.success('Report published', {
        description: `Visible on the program page for 12 months. Expires ${new Date(data.expires_at).toLocaleDateString()}.`,
      });
      invalidate();
    },
    onError: (err) => toast.error(err.message || 'Could not publish this report'),
  });

  const dismissMutation = useMutation({
    mutationFn: (report) =>
      dismissScamReport(report.id, {
        reviewerUserId: user?.id,
        notes: notes[report.id] || '',
      }),
    onSuccess: () => {
      toast.success('Report dismissed', { description: 'Not published. The filer can still see their own submission.' });
      invalidate();
    },
    onError: (err) => toast.error(err.message || 'Could not dismiss this report'),
  });

  return (
    <div className="space-y-6">
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            Before you publish
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>
            Publishing a verified report puts a public, attributed allegation against a named
            institution on its program page. That is a serious act.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Evidence must be real, checkable, and relevant to the claim &mdash; not a link that merely exists.</li>
            <li>Prefer a specific, verifiable incident over a general characterisation of a programme.</li>
            <li>Recent reports about a programme&rsquo;s &ldquo;vibe&rdquo; are not publishable; specific claims are.</li>
            <li>You cannot approve a report you filed yourself. Another moderator must do that.</li>
            <li>Published reports expire after 12 months. Dismissals stay private permanently.</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Pending reports</h2>
          <p className="text-sm text-slate-600">
            Oldest first &mdash; these are people waiting on an answer.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3 w-3" /> {queue.length} awaiting review
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : queue.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
            <p className="font-medium text-slate-900">Queue is clear</p>
            <p className="mt-1 text-sm text-slate-600">
              No reports are waiting for review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {queue.map((report) => {
            const blockedReason = moderationBlockReason(report, user?.id);
            const actionable = canModerateReport(report, user?.id);
            const evidence = Array.isArray(report.evidence_urls)
              ? report.evidence_urls
              : report.evidence_urls
                ? [report.evidence_urls]
                : [];

            return (
              <Card key={report.id} className={actionable ? '' : 'border-slate-200 bg-slate-50/60'}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base">{report.entity_name}</CardTitle>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                        <Badge variant="outline" className="capitalize">
                          {ENTITY_LABELS[report.entity_type] || report.entity_type}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {CATEGORY_LABELS[report.scam_category] || report.scam_category}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {reportAgeLabel(report)}
                        </span>
                        {report.amount_usd ? (
                          <span>${Number(report.amount_usd).toLocaleString()}</span>
                        ) : null}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {report.status !== REPORT_STATUS.PENDING && (
                        <Badge variant="secondary" className="capitalize">
                          {String(report.status).replace('_', ' ')}
                        </Badge>
                      )}
                      {report.program_id && (
                        <Button asChild variant="ghost" size="sm" className="text-xs">
                          <Link to={`/ProgramDetail/${report.program_id}`}>
                            View program <ExternalLink className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="whitespace-pre-wrap text-sm text-slate-700">{report.description}</p>

                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Evidence ({evidence.length})
                    </p>
                    {evidence.length === 0 ? (
                      // Should be impossible: the DB trigger rejects this.
                      <p className="flex items-center gap-1.5 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        No evidence attached &mdash; this report should not exist.
                      </p>
                    ) : (
                      <ul className="space-y-1">
                        {evidence.map((url, i) => (
                          <li key={`${url}-${i}`}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className="inline-flex items-center gap-1 break-all text-sm text-indigo-700 underline hover:text-indigo-900"
                            >
                              <FileText className="h-3 w-3 shrink-0" />
                              {url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <Separator />

                  {blockedReason ? (
                    <p className="flex items-center gap-1.5 text-sm text-slate-500">
                      <AlertTriangle className="h-4 w-4" />
                      {blockedReason}
                    </p>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor={`notes-${report.id}`} className="text-xs text-slate-600">
                          Moderator notes (optional, kept for the audit trail)
                        </Label>
                        <Textarea
                          id={`notes-${report.id}`}
                          rows={2}
                          className="mt-1 text-sm"
                          placeholder="Why you are publishing or dismissing this"
                          value={notes[report.id] || ''}
                          onChange={(e) => setNotes((prev) => ({ ...prev, [report.id]: e.target.value }))}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => verifyMutation.mutate(report)}
                          disabled={verifyMutation.isPending}
                        >
                          {verifyMutation.isPending ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Publish as verified
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => dismissMutation.mutate(report)}
                          disabled={dismissMutation.isPending}
                        >
                          {dismissMutation.isPending ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <X className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Dismiss
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}