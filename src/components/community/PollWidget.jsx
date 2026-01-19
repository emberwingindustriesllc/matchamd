import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Clock, CheckCircle2 } from 'lucide-react';
import { format, isPast } from 'date-fns';

export default function PollWidget({ pollId, compact = false }) {
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: poll, isLoading } = useQuery({
    queryKey: ['poll', pollId],
    queryFn: () => base44.entities.Poll.filter({ id: pollId }).then(p => p[0]),
    enabled: !!pollId
  });

  const voteMutation = useMutation({
    mutationFn: async (optionId) => {
      if (!poll || !user) return;
      
      const updatedOptions = poll.options.map(opt => 
        opt.id === optionId 
          ? { ...opt, votes: (opt.votes || 0) + 1 }
          : opt
      );

      await base44.entities.Poll.update(poll.id, {
        options: updatedOptions,
        voted_by: [...(poll.voted_by || []), user.id]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
    }
  });

  if (isLoading || !poll) {
    return null;
  }

  const hasVoted = poll.voted_by?.includes(user?.id);
  const isExpired = poll.expires_at && isPast(new Date(poll.expires_at));
  const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
  const showResults = hasVoted || isExpired || !poll.is_active;

  const handleVote = () => {
    if (selectedOption && !hasVoted && !isExpired) {
      voteMutation.mutate(selectedOption);
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
      <div className="flex items-start gap-3 mb-3">
        <BarChart3 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
            {poll.question}
          </h4>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
            {poll.expires_at && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isExpired ? 'Closed' : `Ends ${format(new Date(poll.expires_at), 'MMM d')}`}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 ? ((option.votes || 0) / totalVotes) * 100 : 0;
          const isSelected = selectedOption === option.id;

          return (
            <div key={option.id}>
              {showResults ? (
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {option.text}
                    </span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-8 bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 flex items-center px-3"
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="text-xs font-medium text-white">
                        {option.votes || 0} {option.votes === 1 ? 'vote' : 'votes'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedOption(option.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {option.text}
                    </span>
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!showResults && (
        <Button
          onClick={handleVote}
          disabled={!selectedOption || voteMutation.isPending}
          className="w-full mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {voteMutation.isPending ? 'Voting...' : 'Vote'}
        </Button>
      )}

      {hasVoted && (
        <Badge className="mt-3 bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          You voted
        </Badge>
      )}
    </Card>
  );
}