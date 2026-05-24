import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import PathwayAccordion from '@/components/guides/PathwayAccordion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Stethoscope, GraduationCap, BookOpen } from 'lucide-react';

const pathways = {
  residency: {
    icon: Stethoscope,
    title: 'Residency',
    color: 'from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))]',
    steps: [
      { id: 'ecfmg_pathways', title: 'ECFMG Pathways', description: 'Complete one of 6 pathways to certification', deadline: 'Jan 31, 2026' },
      { id: 'usmle_step1', title: 'USMLE Step 1', description: 'First licensing exam covering basic sciences' },
      { id: 'usmle_step2', title: 'USMLE Step 2 CK', description: 'Clinical knowledge examination - aim for high score!' },
      { id: 'oet_medicine', title: 'OET Medicine', description: 'Occupational English Test for healthcare professionals', deadline: 'Dec 2025' },
      { id: 'clinical_experience', title: 'US Clinical Experience', description: 'Critical for Surgery - hands-on rotations at US programs' },
      { id: 'research', title: 'Research Experience', description: 'Essential for competitive specialties - publications strengthen your CV' },
      { id: 'eras_registration', title: 'ERAS Registration', description: 'Electronic Residency Application Service', deadline: 'Sept 2025' },
      { id: 'personal_statement', title: 'Personal Statement', description: 'Your unique story and motivation' },
      { id: 'lors', title: 'Letters of Recommendation', description: 'Strong letters from physicians' },
      { id: 'program_research', title: 'Program Research', description: 'Find IMG-friendly programs' },
      { id: 'interviews', title: 'Interview Preparation', description: 'Prepare for virtual and in-person interviews' },
      { id: 'nrmp_match', title: 'NRMP Match', description: 'National Resident Matching Program', deadline: 'March 2026' },
      { id: 'visa', title: 'Visa Planning', description: 'J-1 or H-1B visa requirements' }
    ]
  },
  fellowship: {
    icon: GraduationCap,
    title: 'Fellowship',
    color: 'from-emerald-500 to-teal-500',
    steps: [
      { id: 'ecfmg_certification', title: 'ECFMG Certification', description: 'Required for fellowship training' },
      { id: 'residency_completion', title: 'Residency Completion', description: 'Complete accredited residency program' },
      { id: 'board_eligibility', title: 'Board Eligibility', description: 'Meet specialty board requirements' },
      { id: 'fellowship_eras', title: 'Fellowship Application', description: 'ERAS or Fellowship Council' },
      { id: 'fellowship_interview', title: 'Fellowship Interviews', description: 'Interview at subspecialty programs' },
      { id: 'fellowship_match', title: 'Fellowship Match', description: 'NRMP SMS or other matching systems' }
    ]
  },
  med_school: {
    icon: BookOpen,
    title: 'Med School',
    color: 'from-amber-400 to-orange-500',
    steps: [
      { id: 'prerequisites', title: 'Prerequisites', description: 'US coursework and requirements' },
      { id: 'mcat', title: 'MCAT Exam', description: 'Medical College Admission Test' },
      { id: 'amcas', title: 'AMCAS Application', description: 'Primary application process' },
      { id: 'secondaries', title: 'Secondary Applications', description: 'School-specific applications' },
      { id: 'med_interviews', title: 'Interviews', description: 'MMI and traditional interviews' },
      { id: 'financial_proof', title: 'Financial Documentation', description: 'Proof of funding for 4 years' },
      { id: 'school_selection', title: 'School Selection', description: 'Schools accepting internationals' }
    ]
  }
};

export default function Guides() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('residency');
  const [viewMode, setViewMode] = useState('accordion');

  const { user } = useAuth();

  const { data: progressList = [] } = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const { data, error } = await supabase.from('progress').select('*').eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 2 * 60 * 1000
  });

  const { data: profiles, error: profileError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 5 * 60 * 1000
  });

  const { data: dynamicGuides = [], isLoading: guidesLoading, error: guidesError } = useQuery({
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
    staleTime: 10 * 60 * 1000
  });

  const profile = profiles?.[0];
  
  // Set default tab based on user's primary goal
  React.useEffect(() => {
    if (profile?.primary_goal && pathways[profile.primary_goal]) {
      setActiveTab(profile.primary_goal);
    }
  }, [profile?.primary_goal]);

  const currentPathway = pathways[activeTab];
  
  const getStepStatus = (stepId) => {
    const progress = progressList.find(p => p.module_id === stepId);
    return progress?.status || 'not_started';
  };

  const filteredSteps = currentPathway.steps.filter(step =>
    step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    step.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedCount = currentPathway.steps.filter(s => getStepStatus(s.id) === 'completed').length;
  const PathIcon = currentPathway.icon;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Guides" showSearch />

      <main className="px-4 py-6 max-w-lg mx-auto">
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

        {/* Dynamic Guides from Database */}
        {dynamicGuides.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Your Personalized {profile?.primary_goal === 'residency' ? 'Residency' : profile?.primary_goal === 'fellowship' ? 'Fellowship' : 'Med School'} Guides
              </h2>
            </div>
            <div className="grid gap-3">
              {dynamicGuides.slice(0, 3).map((guide, idx) => (
                <motion.button
                  key={guide.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => window.location.href = createPageUrl(`GuideDetail?id=${guide.slug}`)}
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
            {Object.entries(pathways).map(([key, path]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="rounded-xl py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md data-[state=active]:text-[rgb(var(--color-primary))] transition-all"
              >
                <path.icon className="w-4 h-4 mr-2" />
                {path.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Interactive Pathway Accordion */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PathwayAccordion
            pathway={currentPathway.title}
            steps={filteredSteps}
            progressList={progressList}
            icon={PathIcon}
            color={currentPathway.color}
          />
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}