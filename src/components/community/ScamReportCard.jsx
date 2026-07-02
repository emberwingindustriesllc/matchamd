import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, User, DollarSign, Link2, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  under_review: 'bg-blue-100 text-blue-800',
  verified: 'bg-red-100 text-red-800',
  disputed: 'bg-purple-100 text-purple-800',
  dismissed: 'bg-gray-100 text-gray-800',
};

const STATUS_ICONS = {
  pending: Clock,
  under_review: Eye,
  verified: CheckCircle,
  disputed: AlertTriangle,
  dismissed: XCircle,
};

const CATEGORY_LABELS = {
  paid_rotation: 'Paid Rotation',
  fake_letter: 'Fake LoR',
  visa_fraud: 'Visa Fraud',
  money_for_match: 'Money for Match',
  credential_fraud: 'Credential Fraud',
  other: 'Other',
};

export default function ScamReportCard({ report, currentUserId, isModerator, onStatusChange }) {
  const StatusIcon = STATUS_ICONS[report.status] || AlertTriangle;
  const isReporter = report.reporter_id === currentUserId;

  return (
    <Card className={`border-l-4 ${report.status === 'verified' ? 'border-destructive' : 'border-amber-500'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {report.is_anonymous ? 'Anonymous Reporter' : (report.user?.user_metadata?.display_name || 'Unknown')}
                </span>
                {report.is_anonymous && (
                  <Badge variant="secondary" className="text-xs">
                    <User className="h-2.5 w-2.5 mr-5 mr-1" /> Anonymous
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={STATUS_COLORS[report.status]}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {report.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Entity:</span>
            <p className="font-medium">{report.entity_name}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Type:</span>
            <p className="font-medium capitalize">{report.entity_type}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Category:</span>
            <p className="font-medium">{CATEGORY_LABELS[report.scam_category] || report.scam_category}</p>
          </div>
          {report.amount_usd && (
            <div>
              <span className="text-muted-foreground">Amount:</span>
              <p className="font-medium text-destructive">
                <DollarSign className="h-3.5 w-3.5 inline mr-1" />
                ${report.amount_usd.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="pt-2">
          <p className="text-sm text-foreground whitespace-pre-wrap">{report.description}</p>
        </div>

        {report.evidence_urls?.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Evidence:</p>
            <div className="flex flex-wrap gap-2">
              {report.evidence_urls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Link2 className="h-3 w-3" />
                  Evidence {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        {report.moderator_notes && (
          <div className="pt-2 border-t bg-muted/30 rounded p-3">
            <p className="text-xs text-muted-foreground mb-1">Moderator Notes:</p>
            <p className="text-sm">{report.moderator_notes}</p>
          </div>
        )}

        {/* Moderator actions */}
        {isModerator && report.status !== 'verified' && report.status !== 'dismissed' && (
          <div className="pt-4 border-t flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => onStatusChange?.(report.id, 'verified', '')}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Verified
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange?.(report.id, 'dismissed', '')}
              className="flex-1 text-destructive hover:text-destructive"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Dismiss
            </Button>
          </div>
        )}

        {/* Reporter view */}
        {isReporter && !isModerator && (
          <div className="pt-2 text-xs text-muted-foreground">
            Your report is {report.status === 'pending' ? 'awaiting review' : `currently ${report.status.replace('_', ' ')}`}.
          </div>
        )}
      </CardContent>
    </Card>
  );
}