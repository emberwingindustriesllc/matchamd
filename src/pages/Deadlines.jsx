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

const DEFAULT_TIMELINES = [
  {
    id: 'eras_2026_ends',
    title: '2026 ERAS Season Ends',
    description: '2026 ERAS season ends at 5 p.m. Eastern Time. MyERAS portal closes for the previous cycle.',
    date: '2026-05-31',
    category: 'eras',
    priority: 'medium',
    applicable_to: ['residency', 'fellowship'],
    official_link: 'https://eras.aamc.org'
  },
  {
    id: 'eras_2027_begins',
    title: '2027 ERAS Season Begins',
    description: '2027 ERAS season begins at 9 a.m. Eastern Time. MyERAS portal opens for registration and application compilation.',
    date: '2026-06-04',
    category: 'eras',
    priority: 'high',
    applicable_to: ['residency', 'fellowship'],
    official_link: 'https://eras.aamc.org'
  },
  {
    id: 'ecfmg_token_dist',
    title: 'ECFMG MyERAS Token Distribution',
    description: 'ECFMG will distribute MyERAS tokens to international medical graduate (IMG) residency applicants. Purchase your token in ECFMG OASIS immediately to register in MyERAS.',
    date: '2026-06-24',
    category: 'ecfmg',
    priority: 'critical',
    applicable_to: ['residency'],
    official_link: 'https://oasis2.ecfmg.org'
  },
  {
    id: 'freida_research',
    title: 'FREIDA: Program Research Phase',
    description: 'Start researching residency programs of interest on the AMA open-access database (FREIDA) with over 13,000 ACGME-accredited programs. Identify visa sponsors, clinical cutoffs, and state licensure rules.',
    date: '2026-06-30',
    category: 'other',
    priority: 'low',
    applicable_to: ['residency', 'fellowship'],
    official_link: 'https://freida.ama-assn.org'
  },
  {
    id: 'freida_budget',
    title: 'FREIDA: Budgeting & Signaling Plan',
    description: 'Familiarize yourself with program signaling limits by specialty. Budget for applications and Match fees (expected $200-$7,000 depending on virtual vs. in-person travel).',
    date: '2026-07-31',
    category: 'other',
    priority: 'medium',
    applicable_to: ['residency', 'fellowship'],
    official_link: 'https://freida.ama-assn.org'
  },
  {
    id: 'eras_submission_opens',
    title: 'MyERAS Applications Submission Opens',
    description: 'Residency and fellowship applicants may begin certifying and submitting MyERAS applications to programs at 9 a.m. Eastern Time. Applications are cached until release date.',
    date: '2026-09-02',
    category: 'eras',
    priority: 'critical',
    applicable_to: ['residency', 'fellowship'],
    official_link: 'https://eras.aamc.org'
  },
  {
    id: 'nrmp_registration_opens',
    title: 'NRMP Main Match Registration Opens',
    description: 'NRMP registration opens in the R3 system. Create your profile, pay your Match fee, and remember to link your NRMP ID inside your MyERAS profile to ensure programs can rank you.',
    date: '2026-09-15',
    category: 'nrmp',
    priority: 'high',
    applicable_to: ['residency', 'fellowship'],
    official_link: 'https://www.nrmp.org'
  },
  {
    id: 'eras_review_release',
    title: 'ERAS Programs Review Begins',
    description: 'Residency programs begin reviewing certified MyERAS applications in the PDWS at 9 a.m. Eastern Time. Applications certified before this date are marked with the identical release timestamp.',
    date: '2026-09-23',
    category: 'eras',
    priority: 'critical',
    applicable_to: ['residency', 'fellowship'],
    official_link: 'https://eras.aamc.org'
  },
  {
    id: 'mspe_release',
    title: 'MSPE (Dean\'s Letters) Released',
    description: 'Medical Student Performance Evaluations (MSPE / Dean\'s Letters) are released by medical schools to residency programs via ERAS.',
    date: '2026-10-01',
    category: 'eras',
    priority: 'high',
    applicable_to: ['residency'],
    official_link: 'https://eras.aamc.org'
  },
  {
    id: 'interviews_begin',
    title: 'Interview Season Begins',
    description: 'Residency and fellowship programs begin scheduling and conducting interviews (extending through mid-February). Regularly update your preferences and notes in the tracker after each session.',
    date: '2026-10-15',
    category: 'other',
    priority: 'medium',
    applicable_to: ['residency', 'fellowship'],
    official_link: 'https://freida.ama-assn.org'
  },
  {
    id: 'nrmp_rol_opens',
    title: 'NRMP Rank Order List Entry Opens',
    description: 'NRMP Rank Order List (ROL) entry opens. Applicants can begin adding and reordering programs in the R3 system. Medical schools begin verifying applicant credentials.',
    date: '2027-02-01',
    category: 'nrmp',
    priority: 'high',
    applicable_to: ['residency', 'fellowship'],
    official_link: 'https://www.nrmp.org'
  },
  {
    id: 'nrmp_rol_deadline',
    title: 'NRMP Rank Order List Deadline',
    description: 'Submission and certification deadline for Rank Order Lists on NRMP. Your ROL must be certified in the R3 system by 9 p.m. Eastern Time.',
    date: '2027-03-03',
    category: 'nrmp',
    priority: 'critical',
    applicable_to: ['residency', 'fellowship'],
    official_link: 'https://www.nrmp.org'
  },
  {
    id: 'match_week_begins',
    title: 'NRMP Match Week & SOAP Begins',
    description: 'Match Week begins. At 10 a.m. Eastern Time, check your email or NRMP profile to see if you matched. SOAP (Post-Match Supplemental Offer and Acceptance Program) begins for unmatched applicants.',
    date: '2027-03-15',
    category: 'nrmp',
    priority: 'critical',
    applicable_to: ['residency', 'fellowship'],
    official_link: 'https://www.nrmp.org'
  },
  {
    id: 'match_day',
    title: 'Match Day!',
    description: 'Match Day! Match results specifying WHERE you matched are released at 12 p.m. Eastern Time. Celebrate your success!',
    date: '2027-03-19',
    category: 'nrmp',
    priority: 'critical',
    applicable_to: ['residency', 'fellowship'],
    official_link: 'https://www.nrmp.org'
  },
  {
    id: 'eras_2027_ends',
    title: '2027 ERAS Season Ends',
    description: '2027 ERAS season ends at 5 p.m. Eastern Time. MyERAS portal shuts down and closes.',
    date: '2027-05-31',
    category: 'eras',
    priority: 'medium',
    applicable_to: ['residency', 'fellowship'],
    official_link: 'https://eras.aamc.org'
  },
  {
    id: 'nrmp_closes',
    title: 'NRMP Match System Closes',
    description: 'NRMP Match system officially closes for the 2027 matching cycle. Transition to residency and visa onboarding phases begin.',
    date: '2027-06-30',
    category: 'nrmp',
    priority: 'low',
    applicable_to: ['residency', 'fellowship'],
    official_link: 'https://www.nrmp.org'
  }
];

export default function Deadlines() {
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('all');

  const { user } = useAuth();

  const { data: dbDeadlines = [], isLoading } = useQuery({
    queryKey: ['deadlines'],
    queryFn: async () => {
      const { data, error } = await supabase.from('deadlines').select('*').order('date', { ascending: true }).limit(100);
      if (error) throw error;
      return data || [];
    }
  });

  const deadlines = useMemo(() => {
    // Merge database deadlines and default timelines, preventing duplicates
    const merged = [...DEFAULT_TIMELINES];
    dbDeadlines.forEach(dbD => {
      const exists = merged.some(m => m.id === dbD.id || m.title.toLowerCase() === dbD.title.toLowerCase());
      if (!exists) {
        merged.push(dbD);
      }
    });
    // Sort chronologically
    return merged.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [dbDeadlines]);

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
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'ecfmg', 'usmle', 'eras', 'nrmp', 'visa', 'licensing', 'other'].map(cat => (
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