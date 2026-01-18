import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
    color: 'from-indigo-500 to-purple-500',
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
    color: 'from-amber-500 to-orange-500',
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
  const [viewMode, setViewMode] = useState('accordion'); // 'accordion' or 'list'

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: progressList = [] } = useQuery({
    queryKey: ['progress'],
    queryFn: () => base44.entities.Progress.filter({ user_id: user?.id }),
    enabled: !!user?.id,
    retry: 2,
    staleTime: 2 * 60 * 1000
  });

  const { data: profiles, error: profileError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: user?.id }),
    enabled: !!user?.id,
    retry: 2,
    staleTime: 5 * 60 * 1000
  });

  const { data: dynamicGuides = [], isLoading: guidesLoading, error: guidesError } = useQuery({
    queryKey: ['guides', profiles?.[0]?.primary_goal],
    queryFn: async () => {
      const guides = await base44.entities.Guide.filter(
        { category: profiles?.[0]?.primary_goal, published: true },
        'order'
      );
      return guides;
    },
    enabled: !!profiles?.[0],
    staleTime: 10 * 60 * 1000
  });

  const profile = profiles?.[0];
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header title="Guides" showSearch />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-2xl border-slate-200 dark:border-slate-700"
          />
        </div>

        {/* Pathway Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full h-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl grid grid-cols-3">
            {Object.entries(pathways).map(([key, path]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="rounded-xl py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm"
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