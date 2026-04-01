import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import ProgressRing from '@/components/common/ProgressRing';
import BadgeIcon from '@/components/common/BadgeIcon';
import StepCard from '@/components/common/StepCard';
import ErrorState from '@/components/common/ErrorState';
import LocationAwareTips from '@/components/location/LocationAwareTips';
import QuickStartChecklist from '@/components/dashboard/QuickStartChecklist';
import ResourceHub from '@/components/dashboard/ResourceHub';
import PathwayEligibilityChat from '@/components/ai/PathwayEligibilityChat';
import PremiumFeatureCard from '@/components/premium/PremiumFeatureCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Bell, 
  ChevronRight, 
  Calendar, 
  Trophy, 
  Flame,
  Sparkles,
  Users,
  GraduationCap,
  Target,
  Video
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const getPathwaySteps = (primaryGoal) => {
  const pathwayStepsMap = {
    residency: [
      { id: 'ecfmg_pathways', title: 'ECFMG Pathways', description: 'Complete certification pathways application', deadline: 'Jan 31, 2026' },
      { id: 'usmle_step1', title: 'USMLE Step 1', description: 'Pass the first licensing exam' },
      { id: 'usmle_step2', title: 'USMLE Step 2 CK', description: 'Pass Clinical Knowledge exam' },
      { id: 'oet_medicine', title: 'OET Medicine', description: 'English proficiency test for healthcare', deadline: 'Dec 2025' },
      { id: 'eras_registration', title: 'ERAS Registration', description: 'Register for residency application', deadline: 'Sept 2025' },
      { id: 'personal_statement', title: 'Personal Statement', description: 'Write your compelling story' },
      { id: 'lors', title: 'Letters of Recommendation', description: 'Secure strong recommendation letters' },
      { id: 'nrmp_match', title: 'NRMP Match', description: 'Register for the matching program', deadline: 'March 2026' }
    ],
    fellowship: [
      { id: 'ecfmg_certification', title: 'ECFMG Certification', description: 'Required for fellowship training' },
      { id: 'residency_completion', title: 'Residency Completion', description: 'Complete accredited residency program' },
      { id: 'board_eligibility', title: 'Board Eligibility', description: 'Meet specialty board requirements' },
      { id: 'fellowship_eras', title: 'Fellowship Application', description: 'ERAS or Fellowship Council' },
      { id: 'fellowship_interview', title: 'Fellowship Interviews', description: 'Interview at subspecialty programs' },
      { id: 'fellowship_match', title: 'Fellowship Match', description: 'NRMP SMS or other matching systems' }
    ],
    med_school: [
      { id: 'prerequisites', title: 'Prerequisites', description: 'US coursework and requirements' },
      { id: 'mcat', title: 'MCAT Exam', description: 'Medical College Admission Test' },
      { id: 'amcas', title: 'AMCAS Application', description: 'Primary application process' },
      { id: 'secondaries', title: 'Secondary Applications', description: 'School-specific applications' },
      { id: 'med_interviews', title: 'Interviews', description: 'MMI and traditional interviews' },
      { id: 'financial_proof', title: 'Financial Documentation', description: 'Proof of funding for 4 years' }
    ]
  };
  return pathwayStepsMap[primaryGoal] || pathwayStepsMap.residency;
};

export default function Dashboard() {
  const navigate = useNavigate();
  
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles, error: profileError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: user?.id }),
    enabled: !!user?.id,
    retry: 2,
    staleTime: 5 * 60 * 1000
  });

  const { data: progressList = [] } = useQuery({
    queryKey: ['progress'],
    queryFn: () => base44.entities.Progress.filter({ user_id: user?.id }),
    enabled: !!user?.id,
    retry: 2,
    staleTime: 2 * 60 * 1000
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.filter({ user_id: user?.id, read: false }),
    enabled: !!user?.id,
    retry: 1,
    staleTime: 1 * 60 * 1000
  });

  const { data: guides = [] } = useQuery({
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

  useEffect(() => {
    if (user && profiles !== undefined && !profile) {
      navigate(createPageUrl('Onboarding'));
    }
  }, [user, profiles, profile, navigate]);

  if (!profile) {
    if (profileError) {
      return (
        <>
          <Header logo={logo} />
          <ErrorState 
            title="Unable to Load Profile"
            message="We couldn't load your profile. Please check your connection and try again."
            onRetry={() => window.location.reload()}
          />
          <BottomNav />
        </>
      );
    }
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentSteps = getPathwaySteps(profile?.primary_goal);
  const completedSteps = progressList.filter(p => p.status === 'completed').length;
  const totalSteps = currentSteps.length;
  const overallProgress = Math.round((completedSteps / totalSteps) * 100);

  const getStepStatus = (stepId) => {
    const progress = progressList.find(p => p.module_id === stepId);
    return progress?.status || 'not_started';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header 
        title="MatchaMD" 
        rightContent={
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl"
            onClick={() => navigate(createPageUrl('Notifications'))}
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Button>
        }
      />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[rgb(var(--color-primary))] via-[rgb(110,135,30)] to-[rgb(80,105,20)] p-6 text-white shadow-lg"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm mb-1">Welcome back,</p>
                <h2 className="text-2xl font-bold">{profile.display_name || user?.full_name}</h2>
              </div>
              <ProgressRing progress={overallProgress} size={80} strokeWidth={6} />
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">{profile.points || 0} pts</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-medium">3 day streak</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Location-Aware Tips */}
        <LocationAwareTips compact />

        {/* Your ECFMG Pathway - Prominent Section */}
        {profile?.primary_goal === 'residency' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate(createPageUrl('GuideDetail?id=ecfmg_pathways'))}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Critical First Step
                </Badge>
              </div>
              <h3 className="text-xl font-bold mb-1">Your ECFMG Pathway</h3>
              <p className="text-white/90 text-sm mb-3">
                Choose from 6 certification pathways based on your medical school and licensure status
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                  <Target className="w-3 h-3" />
                  Pathway 1, 3, 4, 5, or 6
                </span>
                <ChevronRight className="w-5 h-5 ml-auto" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate(createPageUrl('Community'))}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgba(var(--color-primary),0.8)] to-[rgba(var(--color-primary),1)] flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white">Community</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Connect with peers</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => navigate(createPageUrl('Mentors'))}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white">Find Mentor</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get guidance</p>
          </motion.button>
        </div>

        {/* AI Pathway Assistant - Free Feature */}
        <PathwayEligibilityChat userProfile={profile} />

        {/* Quick Start Checklist - Immediate Value */}
        <QuickStartChecklist profile={profile} progressList={progressList} />

        {/* Essential Resources - Vetted Links */}
        <ResourceHub />

        {/* Premium Feature Teaser */}
        <PremiumFeatureCard
          title="Advanced Mentorship"
          description="Get personalized 1-on-1 guidance from verified mentors who've successfully matched"
          features={[
            'Monthly video sessions with matched physicians',
            'Personal statement review & feedback',
            'Mock interviews with specialty-specific mentors',
            'Priority access to limited mentorship slots'
          ]}
          isPremium={true}
          unlocked={false}
        />

        {/* Upcoming Deadlines */}
        <Card className="p-4 rounded-2xl border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-slate-800 dark:text-white">Upcoming Deadlines</h3>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {currentSteps.filter(s => s.deadline).slice(0, 3).map(step => (
              <div key={step.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{step.title}</span>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">{step.deadline}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Badges */}
        {profile.badges?.length > 0 && (
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Your Achievements</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {profile.badges.map(badge => (
                <BadgeIcon key={badge} type={badge} size="lg" showLabel />
              ))}
            </div>
          </div>
        )}

        {/* Your Pathway */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white">
              Your {profile.primary_goal === 'residency' ? 'Residency' : profile.primary_goal === 'fellowship' ? 'Fellowship' : 'Med School'} Path
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(createPageUrl('Guides'))}
              className="text-indigo-600 dark:text-indigo-400"
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {currentSteps.slice(0, 4).map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
              >
                <StepCard
                  step={idx + 1}
                  title={step.title}
                  description={step.description}
                  status={getStepStatus(step.id)}
                  deadline={step.deadline}
                  onClick={() => navigate(createPageUrl(`GuideDetail?id=${step.id}`))}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}