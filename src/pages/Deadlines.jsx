import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  ExternalLink
} from 'lucide-react';
import { format, differenceInDays, isPast, isFuture } from 'date-fns';

const categoryColors = {
  ecfmg: 'bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-primary))] border-[rgba(var(--color-primary),0.2)]',
  usmle: 'bg-blue-100/50 text-blue-700 border-blue-200 dark:bg-blue-900/20',
  eras: 'bg-[rgba(var(--color-secondary),0.1)] text-[rgb(var(--color-secondary))] border-[rgba(var(--color-secondary),0.2)]',
  nrmp: 'bg-emerald-100/50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20',
  visa: 'bg-amber-100/50 text-amber-700 border-amber-200 dark:bg-amber-900/20',
  licensing: 'bg-rose-100/50 text-rose-700 border-rose-200 dark:bg-rose-900/20',
  other: 'bg-slate-100/50 text-slate-700 border-slate-200 dark:bg-slate-800/50'
};

const priorityColors = {
  critical: 'bg-red-50 border-red-500 dark:bg-red-900/20',
  high: 'bg-orange-50 border-orange-400 dark:bg-orange-900/20',
  medium: 'bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20',
  low: 'bg-slate-50 border-slate-300 dark:bg-slate-800'
};

export default function Deadlines() {
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('all');

  const { user } = useAuth();

  const { data: deadlines = [], isLoading } = useQuery({
    queryKey: ['deadlines'],
    queryFn: async () => {
      const { data, error } = await supabase.from('deadlines').select('*').order('date', { ascending: true }).limit(100);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', user?.id);
      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!user?.id
  });

  const filteredDeadlines = useMemo(() => {
    return deadlines.filter(deadline => {
      const deadlineDate = new Date(deadline.date);
      const daysUntil = differenceInDays(deadlineDate, new Date());
      
      // Filter by time
      const timeMatch = 
        filter === 'all' ||
        (filter === 'upcoming' && isFuture(deadlineDate) && daysUntil <= 30) ||
        (filter === 'critical' && isFuture(deadlineDate) && daysUntil <= 7) ||
        (filter === 'past' && isPast(deadlineDate));
      
      // Filter by category
      const categoryMatch = category === 'all' || deadline.category === category;
      
      // Filter by user's goal
      const goalMatch = !userProfile?.primary_goal || 
        !deadline.applicable_to || 
        deadline.applicable_to.includes(userProfile.primary_goal);
      
      return timeMatch && categoryMatch && goalMatch;
    });
  }, [deadlines, filter, category, userProfile]);

  const upcomingCount = deadlines.filter(d => {
    const daysUntil = differenceInDays(new Date(d.date), new Date());
    return isFuture(new Date(d.date)) && daysUntil <= 30;
  }).length;

  const criticalCount = deadlines.filter(d => {
    const daysUntil = differenceInDays(new Date(d.date), new Date());
    return isFuture(new Date(d.date)) && daysUntil <= 7;
  }).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Important Deadlines" />

      <main className="px-4 py-6 max-w-2xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">
                  {criticalCount}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Critical (7 days)
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-[rgba(var(--color-secondary),0.2)] bg-gradient-to-br from-white to-[rgba(var(--color-secondary),0.02)] dark:from-slate-800 dark:to-slate-900 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[rgba(var(--color-secondary),0.1)] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[rgb(var(--color-secondary))]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">
                  {upcomingCount}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Next 30 days
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === 'critical' ? 'default' : 'outline'}
            onClick={() => setFilter('critical')}
          >
            Critical
          </Button>
          <Button
            size="sm"
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </Button>
          <Button
            size="sm"
            variant={filter === 'past' ? 'default' : 'outline'}
            onClick={() => setFilter('past')}
          >
            Past
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'ecfmg', 'usmle', 'eras', 'nrmp', 'visa', 'licensing'].map(cat => (
            <Badge
              key={cat}
              variant={category === cat ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setCategory(cat)}
            >
              {cat.toUpperCase()}
            </Badge>
          ))}
        </div>

        {/* Deadlines List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="p-8 text-center">
              <div className="text-slate-500">Loading deadlines...</div>
            </Card>
          ) : filteredDeadlines.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No deadlines found</p>
            </Card>
          ) : (
            filteredDeadlines.map(deadline => {
              const deadlineDate = new Date(deadline.date);
              const daysUntil = differenceInDays(deadlineDate, new Date());
              const isOverdue = isPast(deadlineDate);
              
              return (
                <Card 
                  key={deadline.id} 
                  className={`p-4 border-l-4 ${priorityColors[deadline.priority] || priorityColors.medium}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                        {deadline.title}
                      </h3>
                      {deadline.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {deadline.description}
                        </p>
                      )}
                    </div>
                    
                    <Badge className={categoryColors[deadline.category]}>
                      {deadline.category.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-700 dark:text-slate-300">
                        {format(deadlineDate, 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    {!isOverdue && (
                      <div className={`flex items-center gap-2 text-sm ${
                        daysUntil <= 7 ? 'text-red-600' : daysUntil <= 30 ? 'text-orange-600' : 'text-slate-600'
                      }`}>
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">
                          {daysUntil === 0 ? 'Today!' : 
                           daysUntil === 1 ? 'Tomorrow' : 
                           `${daysUntil} days`}
                        </span>
                      </div>
                    )}

                    {isOverdue && (
                      <Badge variant="outline" className="text-slate-500">
                        Past
                      </Badge>
                    )}
                  </div>

                  {deadline.official_link && (
                    <a
                      href={deadline.official_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[rgb(var(--color-primary))] font-medium hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Official Source
                    </a>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}