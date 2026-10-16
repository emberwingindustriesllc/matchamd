import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { voteNoteHelpful } from '@/api/programs';
import UGCSafetyMenu from '@/components/common/UGCSafetyMenu';
import { isItemFlagged, isUserBlocked } from '@/lib/ugcSafety';

const NOTE_TYPE_COLORS = {
  experience: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
  tip: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  cost: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300',
  visa: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300',
  interview: 'bg-pink-100 text-pink-800 dark:bg-pink-500/15 dark:text-pink-300',
  culture: 'bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300',
};

/**
 * Resolve the author label.
 */
function resolveAuthorLabel(item, { anonymousLabel = 'Anonymous' } = {}) {
  if (item?.is_anonymous) return anonymousLabel;
  return (
    item?.author_display_name ||
    item?.user?.user_metadata?.display_name ||
    item?.user?.email?.split('@')[0] ||
    'Unknown'
  );
}

export default function ProgramNoteCard({ note, currentUserId, onVote = () => {} }) {
  const isAuthor = note.user_id === currentUserId;
  const [voted, setVoted] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const [helpfulCount, setHelpfulCount] = React.useState(note.helpful_count || 0);
  const authorLabel = resolveAuthorLabel(note);

  if (hidden || isItemFlagged(note.id) || isUserBlocked(authorLabel)) {
    return null;
  }

  const handleVote = async () => {
    if (voted) return;
    try {
      await voteNoteHelpful(note.id);
      setVoted(true);
      setHelpfulCount(c => c + 1);
      onVote?.(note.id);
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  return (
    <Card className="border-l-4 border-emerald-500">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
              {note.user?.user_metadata?.avatar_url ? (
                <img src={note.user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <span className="text-sm font-medium text-emerald-500">
                  {authorLabel?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-sm">
                {authorLabel}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={NOTE_TYPE_COLORS[note.note_type] || 'bg-gray-100 text-gray-800'}>
              {note.note_type?.replace('_', ' ')}
            </Badge>
            {note.rating && (
              <Badge variant="secondary">★ {note.rating}/5</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {note.title && <h4 className="font-medium mb-2">{note.title}</h4>}
        <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 ${voted ? 'text-emerald-500' : ''}`}
              onClick={handleVote}
              disabled={voted}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{helpfulCount} Helpful</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
          {!isAuthor && (
            <UGCSafetyMenu
              itemId={note.id}
              itemType="program_note"
              title={note.title || 'Program Note'}
              authorName={authorLabel}
              authorId={note.user_id || authorLabel}
              compact
              onReported={() => setHidden(true)}
              onUserBlocked={() => setHidden(true)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}