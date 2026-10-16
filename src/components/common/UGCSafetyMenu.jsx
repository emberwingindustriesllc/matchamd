import React, { useState } from 'react';
import { Flag, Ban, ShieldAlert, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  REPORT_REASONS,
  reportUGCContent,
  blockUser,
} from '@/lib/ugcSafety';
import { toast } from 'sonner';

/**
 * Google Play Store User-Generated Content (UGC) Policy Compliance Component
 * Provides visible "Report / Flag Content" and "Block/Hide User" actions
 * on every user-generated post, comment, program note, or rotation review.
 */
export default function UGCSafetyMenu({
  itemId,
  itemType = 'post',
  title = '',
  authorName = 'Anonymous IMG',
  authorId = '',
  onReported,
  onUserBlocked,
  compact = false,
  className = '',
}) {
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0].id);
  const [details, setDetails] = useState('');
  const [alsoBlockUser, setAlsoBlockUser] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleReportSubmit = async (e) => {
    e?.stopPropagation?.();
    setSubmitting(true);
    try {
      await reportUGCContent({
        itemId,
        itemType,
        title,
        authorName,
        reason: selectedReason,
        details,
        hideItem: true,
      });

      if (alsoBlockUser) {
        blockUser({
          id: authorId || authorName,
          name: authorName,
          reason: `Blocked via content report (${selectedReason})`,
        });
        onUserBlocked?.(authorId || authorName);
      }

      toast.success('Content flagged & hidden from your feed. Our moderation team will review it within 24 hours.');
      setReportOpen(false);
      setDetails('');
      onReported?.(itemId);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickBlock = (e) => {
    e?.stopPropagation?.();
    const targetName = authorName || 'Anonymous User';
    blockUser({
      id: authorId || targetName,
      name: targetName,
      reason: 'Blocked directly by user',
    });
    toast.success(`Blocked ${targetName}. Their posts and comments are now hidden.`);
    onUserBlocked?.(authorId || targetName);
  };

  return (
    <>
      <div
        className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setReportOpen(true);
          }}
          className={`inline-flex items-center gap-1 rounded-lg border border-rose-500/25 bg-rose-500/10 text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 transition-colors font-medium ${
            compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          }`}
          title="Report or flag inappropriate or scam content"
          aria-label="Report or Flag Content"
        >
          <Flag className="w-3 h-3 shrink-0" />
          <span>Report / Flag</span>
        </button>

        <button
          type="button"
          onClick={handleQuickBlock}
          className={`inline-flex items-center gap-1 rounded-lg border border-slate-500/25 bg-slate-500/10 text-slate-600 dark:text-slate-300 hover:bg-rose-500/15 hover:text-rose-400 hover:border-rose-500/30 transition-colors font-medium ${
            compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          }`}
          title={`Block or hide posts from ${authorName || 'this user'}`}
          aria-label="Block or Hide User"
        >
          <Ban className="w-3 h-3 shrink-0" />
          <span>Block User</span>
        </button>
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent
          className="sm:max-w-md bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500">
              <ShieldAlert className="w-5 h-5" />
              Report / Flag Community Content
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Help keep MatchaMD safe and scam-free for IMGs. Flagged posts are immediately hidden from your feed and reviewed by our moderation team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Reason for Report
              </label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all text-xs font-medium ${
                      selectedReason === reason.id
                        ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-300'
                        : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ugc-report-reason"
                      value={reason.id}
                      checked={selectedReason === reason.id}
                      onChange={() => setSelectedReason(reason.id)}
                      className="accent-rose-500"
                    />
                    <span>{reason.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Additional Context (Optional)
              </label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Share any red flags, hidden fees, or details for moderators..."
                rows={3}
                className="text-sm bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700"
              />
            </div>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={alsoBlockUser}
                onChange={(e) => setAlsoBlockUser(e.target.checked)}
                className="rounded accent-rose-500"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Also block & hide all future content from <strong>{authorName || 'this user'}</strong>
              </span>
            </label>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReportOpen(false)}
              className="border-slate-300 dark:border-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleReportSubmit}
              disabled={submitting}
              className="bg-rose-500 hover:bg-rose-600 text-white font-semibold gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit Report & Hide'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
