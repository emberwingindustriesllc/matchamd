import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Flag, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { voteNoteHelpful } from '@/api/programs';

const NOTE_TYPE_COLORS = {
  experience: 'bg-blue-100 text-blue-800',
  tip: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  cost: 'bg-purple-100 text-purple-800',
  visa: 'bg-indigo-100 text-indigo-800',
  interview: 'bg-pink-100 text-pink-800',
  culture: 'bg-teal-100 text-teal-800',
};

export default function ProgramNoteCard({ note, currentUserId, onVote }) {
  const isAuthor = note.user_id === currentUserId;
  const [voted, setVoted] = React.useState(false);
  const [helpfulCount, setHelpfulCount] = React.useState(note.helpful_count || 0);

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
    <Card className="border-l-4 border-primary">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              {note.user?.user_metadata?.avatar_url ? (
                <img src={note.user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <span className="text-sm font-medium text-primary">
                  {note.user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-sm">
                {note.is_anonymous ? 'Anonymous' : (note.user?.user_metadata?.display_name || note.user?.email?.split('@')[0] || 'Unknown')}
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

        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 ${voted ? 'text-primary' : ''}`}
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
          {!isAuthor && (
            <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
              <Flag className="h-4 w-4" />
              Report
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}