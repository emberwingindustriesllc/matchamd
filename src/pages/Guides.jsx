import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import PathwayAccordion from '@/components/guides/PathwayAccordion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  Stethoscope,
  GraduationCap,
  BookOpen,
  Brain,
  Trophy,
  MessageSquare,
  ChevronRight,
  Search as SearchIcon,
} from 'lucide-react';
import { pathways, filterPathwaySteps } from '@/data/pathways';

const PATHWAY_ICONS = {
  residency: Stethoscope,
  fellowship: GraduationCap,
  med_school: BookOpen,
};

export default function Guides() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('residency');

  const { user } = useAuth();

  const { data: purchases = [] } = useQuery({
    queryKey: ['purchases', user?.id],
    queryFn: async () => {
      let dbPurchases = [];
      if (user?.id) {
        try {
          const { data } = await supabase.from('purchased_content').select('*').eq('user_id', user?.id);
          if (data) dbPurchases = data;
        } catch (e) {
          console.warn('Failed to fetch purchases from DB', e);
        }
      }
      let localPurchases = [];
      try {
        localPurchases = JSON.parse(localStorage.getItem('matchamd_purchased_content') || '[]');
      } catch (e) {
        /* ignore */
      }
      return [...dbPurchases, ...localPurchases];
    },
  });

  const { data: progressList = [] } = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const { data, error } = await supabase.from('progress').select('*').eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 2 * 60 * 1000,
  });

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: dynamicGuides = [],
    isLoading: guidesLoading,
    error: guidesError,
  } = useQuery({
    queryKey: ['guides', profiles?.[0]?.primary_goal],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('category', profiles?.[0]?.primary_goal)
        .eq('published', true)
        .order('order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profiles?.[0],
    staleTime: 10 * 60 * 1000,
  });

  const profile = profiles?.[0];

  React.useEffect(() => {
    if (profile?.primary_goal && pathways[profile.primary_goal]) {
      setActiveTab(profile.primary_goal);
    }
  }, [profile?.primary_goal]);

  const currentPathway = pathways[activeTab] || pathways.residency;
  const PathIcon = PATHWAY_ICONS[activeTab] || Stethoscope;
  const filteredSteps = filterPathwaySteps(currentPathway.steps, searchQuery);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Guides" />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Quick link to program search */}
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl('IMGPrograms'))}
          className="w-full mb-4 h-11 rounded-2xl justify-between border-indigo-200 dark:border-indigo-800"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <SearchIcon className="w-4 h-4 text-indigo-500" />
            Search IMG-friendly programs
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Button>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-2xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-[rgb(var(--color-primary))]"
          />
        </div>

        {/* Specialty Courses & Practice Modules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 space-y-3"
        >
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span>Specialty Courses & Practice Modules</span>
          </h2>
          <div className="grid gap-3">
            {[
              {
                id: 'quiz_usmle',
                title: 'USMLE Quiz Pack',
                description: '500+ high-yield practice questions for Step 1 & 2 CK',
                icon: Brain,
                color: 'from-indigo-500 to-purple-500',
                route: 'USMLEQuizPack',
              },
              {
                id: 'specialty_surgery',
                title: 'Surgery Specialty Guide',
                description: 'Deep dive strategies into surgical residency applications',
                icon: Trophy,
                color: 'from-emerald-500 to-teal-500',
                route: 'SurgeryGuide',
              },
              {
                id: 'interview_premium',
                title: 'Interview Mastery Course',
                description: '20+ video lessons & expert practice questions',
                icon: MessageSquare,
                color: 'from-amber-500 to-orange-500',
                route: 'InterviewCourse',
              },
            ].map((course) => {
              const Icon = course.icon;
              const isUnlocked = purchases.some((p) => p.content_id === course.id);
              return (
                <button
                  key={course.id}
                  onClick={() => navigate(createPageUrl(course.route))}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all text-left flex items-center gap-4 group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{course.title}</h3>
                      <Badge
                        variant={isUnlocked ? 'secondary' : 'outline'}
                        className={`text-[10px] px-2 py-0.5 ${
                          isUnlocked
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300'
                            : 'text-amber-600 border-amber-300'
                        }`}
                      >
                        {isUnlocked ? 'Unlocked' : 'Premium'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{course.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Dynamic Guides from Database */}
        {guidesLoading && (
          <p className="text-sm text-slate-500 mb-4">Loading personalized guides…</p>
        )}
        {guidesError && (
          <p className="text-sm text-amber-600 mb-4">Could not load personalized guides. Pathway steps below still work offline.</p>
        )}
        {dynamicGuides.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Your Personalized{' '}
                {profile?.primary_goal === 'residency'
                  ? 'Residency'
                  : profile?.primary_goal === 'fellowship'
                    ? 'Fellowship'
                    : 'Med School'}{' '}
                Guides
              </h2>
            </div>
            <div className="grid gap-3">
              {dynamicGuides.slice(0, 3).map((guide, idx) => (
                <motion.button
                  key={guide.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() =>
                    navigate(createPageUrl(`GuideDetail?id=${guide.slug || guide.id}`))
                  }
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-[rgba(var(--color-primary),0.2)] dark:border-[rgba(var(--color-primary),0.4)] shadow-sm hover:shadow-lg hover:border-[rgb(var(--color-primary))] transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                      <span className="text-white text-lg font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 dark:text-white mb-1">{guide.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{guide.overview}</p>
                      {guide.deadline && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">⏰ {guide.deadline}</p>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Pathway Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full h-auto p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl grid grid-cols-3">
            {Object.entries(pathways).map(([key, path]) => {
              const Icon = PATHWAY_ICONS[key] || BookOpen;
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="rounded-xl py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md data-[state=active]:text-[rgb(var(--color-primary))] transition-all"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {path.title}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Interactive Pathway Accordion */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {filteredSteps.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center">
              <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">No steps match “{searchQuery}”</p>
              <p className="text-sm text-slate-500 mb-4">Try another keyword or clear the search.</p>
              <Button variant="outline" className="rounded-xl" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </div>
          ) : (
            <PathwayAccordion
              pathway={currentPathway.title}
              pathwayKey={activeTab}
              steps={filteredSteps}
              progressList={progressList}
              icon={PathIcon}
              color={currentPathway.color}
            />
          )}
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
