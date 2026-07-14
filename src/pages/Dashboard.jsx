import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
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
  Stethoscope,
  Coins,
  Calculator,
  Brain,
  Globe,
  Star,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getJourneyHighlights, getNextActionChecklist } from '@/lib/personalJourney';

const getPathwaySteps = (primaryGoal) => {
  const pathwayStepsMap = {
    residency: [
      { id: 'ecfmg_pathways', title: 'ECFMG Pathways', description: 'Complete certification pathways application', deadline: 'Jan 31, 2026' },
      { id: 'usmle_step1', title: 'USMLE Step 1', description: 'Pass the first licensing exam' },
      { id: 'usmle_step2', title: 'USMLE Step 2 CK', description: 'Aim for ≥240 for best IMG match chances' },
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
  
  const { user } = useAuth();


  const { data: profiles, error: profileError } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 5 * 60 * 1000
  });

  const { data: progressList = [] } = useQuery({
    queryKey: ['progress', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('progress').select('*').eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 2 * 60 * 1000
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('notifications').select('*').eq('user_id', user?.id).eq('read', false);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 1 * 60 * 1000
  });

  const { data: guides = [] } = useQuery({
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

  // Dynamic Match Readiness Algorithm for the intelligence dashboard
  const matchReadinessStats = useMemo(() => {
    if (!profile) {
      return {
        score: 30,
        strengths: [],
        gaps: [],
        recommendedActions: ['Target and explore 10 more compatible programs.', 'Schedule a mock interview session.']
      };
    }
    let score = 30; // base score for starting out
    const strengths = [];
    const gaps = [];
    const tasks = [];

    // 1. Exam Score Contribution
    if (profile?.usmle_step2_status === 'passed') {
      const s2Score = profile?.usmle_step2_score ? Number(profile.usmle_step2_score) : 230;
      score += s2Score >= 250 ? 25 : s2Score >= 240 ? 20 : 15;
      strengths.push({ name: 'Clinical Knowledge Exam', stars: s2Score >= 250 ? 5 : s2Score >= 240 ? 4 : 3 });
    } else {
      gaps.push({ name: 'USMLE Step 2 CK Prep', severity: 'high', desc: 'Secure an exam date and aim for a target score of ≥240.' });
      tasks.push('Plan/schedule your USMLE Step 2 CK exam date.');
    }

    if (profile?.usmle_step1_status === 'passed') {
      score += 10;
      strengths.push({ name: 'Basic Sciences Foundation', stars: 5 });
    } else {
      gaps.push({ name: 'USMLE Step 1 Status', severity: 'medium', desc: 'Step 1 is pass/fail but mandatory for residency screening.' });
    }

    // 2. Clinical Experience Contribution
    if (profile?.us_clinical_experience) {
      score += 20;
      strengths.push({ name: 'US Clinical Exposure (USCE)', stars: 5 });
    } else {
      gaps.push({ name: 'US Hands-on Rotations', severity: 'high', desc: 'Obtain 2-3 months of hands-on US clinical experience.' });
      tasks.push('Inquire about observership/hands-on clinical rotations.');
    }

    // 3. ECFMG Certification Contribution
    if (profile?.ecfmg_status === 'certified') {
      score += 15;
      strengths.push({ name: 'ECFMG Certification status', stars: 5 });
    } else if (profile?.ecfmg_status === 'pathway_approved') {
      score += 10;
      strengths.push({ name: 'ECFMG Pathway selection', stars: 4 });
      gaps.push({ name: 'Final Certification Release', severity: 'medium', desc: 'Ensure final medical school diploma is uploaded for ECFMG release.' });
    } else {
      gaps.push({ name: 'ECFMG Pathway Verification', severity: 'medium', desc: 'Check eligibility pathways and apply before January.' });
      tasks.push('Complete OET Medicine and select an ECFMG Pathway.');
    }

    // 4. Letters of Recommendation and Personal Statement
    const savedPS = localStorage.getItem(`match_personal_statement_${user?.id}`);
    if (savedPS && savedPS.trim().length > 200) {
      score += 10;
      strengths.push({ name: 'Personal Statement Draft', stars: 4 });
    } else {
      gaps.push({ name: 'Personal Statement Review', severity: 'low', desc: 'Craft a compelling narrative explaining your resilience as an IMG.' });
      tasks.push('Draft your Personal Statement and run our review scan.');
    }

    score = Math.min(score, 100);

    return {
      score,
      strengths: strengths.slice(0, 3),
      gaps: gaps.slice(0, 2),
      recommendedActions: tasks.length > 0 ? tasks : ['Target and explore 10 more compatible programs.', 'Schedule a mock interview session.']
    };
  }, [profile, user?.id]);

  useEffect(() => {
    if (user && profiles !== undefined && !profile) {
      navigate(createPageUrl('Onboarding'));
    }
  }, [user, profiles, profile, navigate]);

  if (!profile) {
    if (profileError) {
      return (
        <>
          <Header logo={logo} title="Dashboard Error" />
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
  const journeyHighlights = getJourneyHighlights(profile || {}, profile?.custom_entries || [], profile?.favorite_programs?.length || 0);
  const nextActions = getNextActionChecklist(profile || {}, profile?.custom_entries || [], profile?.favorite_programs?.length || 0);



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

        {/* Applicant Intelligence & Match Readiness Dashboard (Differentiator Card) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100 dark:border-slate-850 bg-gradient-to-br from-indigo-50/50 to-purple-50/20 dark:from-indigo-950/15 dark:to-slate-900/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-base text-slate-800 dark:text-white">Applicant Intelligence</h3>
              </div>
              <Badge className="bg-indigo-600 text-white font-bold hover:bg-indigo-700">
                {matchReadinessStats.score}% Match Ready
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Personalized evaluation based on your international graduate portfolio metrics.
            </p>
          </div>

          <div className="p-5 space-y-4">
            {/* Strengths */}
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mb-2 uppercase tracking-wider">
                ✓ Core Strengths
              </span>
              {matchReadinessStats.strengths.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No verified strengths yet. Update your profile to trigger insights.</p>
              ) : (
                <div className="space-y-2">
                  {matchReadinessStats.strengths.map((str, i) => (
                    <div key={i} className="flex justify-between items-center text-xs p-2 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/30 dark:border-emerald-950/20">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{str.name}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className={`w-3.5 h-3.5 ${idx < str.stars ? 'text-amber-500 fill-current' : 'text-slate-200 dark:text-slate-800'}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Needs Attention */}
            {matchReadinessStats.gaps.length > 0 && (
              <div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block mb-2 uppercase tracking-wider">
                  ⚠️ Needs Attention
                </span>
                <div className="space-y-2">
                  {matchReadinessStats.gaps.map((gap, i) => (
                    <div key={i} className="text-xs p-2.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/30 dark:border-amber-950/20 flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{gap.name}</span>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">{gap.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-3.5">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 block mb-2 uppercase tracking-wider">
                💡 Recommended Next Steps
              </span>
              <ul className="space-y-1.5 text-xs">
                {matchReadinessStats.recommendedActions.map((act, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-400 leading-normal">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 p-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">Your plan today</p>
                <h3 className="mt-2 text-xl font-semibold">{journeyHighlights.headline}</h3>
                <p className="mt-2 text-sm text-white/85">{journeyHighlights.summary}</p>
              </div>
              <Badge variant="secondary" className="border-white/20 bg-white/15 text-white">
                {journeyHighlights.isInUS ? 'U.S. based' : journeyHighlights.isOverseas ? 'Overseas' : 'Location pending'}
              </Badge>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/80">
              <p className="text-xs text-slate-500">Saved items</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{journeyHighlights.savedItems}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/80">
              <p className="text-xs text-slate-500">Saved programs</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{journeyHighlights.savedPrograms}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/80">
              <p className="text-xs text-slate-500">Priority</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{journeyHighlights.nextAction}</p>
            </div>
          </div>

          <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Next actions</h4>
              <span className="text-xs text-slate-500">Keep momentum</span>
            </div>
            <div className="space-y-2">
              {nextActions.map((action) => (
                <div key={action.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/70">
                  <div className={`mt-0.5 h-8 w-8 rounded-xl bg-gradient-to-br ${action.accent}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{action.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* USMLE Status Summary — from saved profile */}
        {(profile.usmle_step1_status !== 'not_started' || profile.usmle_step2_status !== 'not_started') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4"
          >
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3 text-sm">Your USMLE Status</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Step 1', status: profile.usmle_step1_status, score: profile.usmle_step1_score },
                { label: 'Step 2 CK', status: profile.usmle_step2_status, score: profile.usmle_step2_score },
                { label: 'Step 3', status: profile.usmle_step3_status, score: null },
              ].map(({ label, status, score }) => (
                <div key={label} className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                  <Badge
                    className={`text-xs ${
                      status === 'passed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      status === 'studying' || status === 'scheduled' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {status === 'not_started' ? 'Pending' : status?.replace('_', ' ')}
                  </Badge>
                  {score && <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">{score}</p>}
                  {label === 'Step 2 CK' && status === 'passed' && score && parseInt(score) >= 240 && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">✓ Competitive</p>
                  )}
                  {label === 'Step 2 CK' && status === 'passed' && score && parseInt(score) < 240 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">Target ≥240</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

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

        {/* Match Journey & Program Tracker Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          onClick={() => navigate(createPageUrl('IMGPrograms'))}
          className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white shadow-[0_24px_60px_-24px_rgba(79,70,229,0.7)] cursor-pointer hover:-translate-y-0.5 transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Match Hub
              </Badge>
            </div>
            <h3 className="text-xl font-bold mb-1">Match Journey & Programs</h3>
            <p className="text-white/95 text-sm mb-3">
              Search real-world IMG programs, track applications, log interviews, and plan your rank order list.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex-1 flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <Stethoscope className="w-3 h-3" />
                Specialties & Fit Match
              </span>
              <span className="flex-1 flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <Calendar className="w-3 h-3" />
                Track Interviews & ROL
              </span>
              <ChevronRight className="w-5 h-5 ml-auto" />
            </div>
          </div>
        </motion.div>

        {/* Match Cost & Budget Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.09 }}
          onClick={() => navigate(createPageUrl('MatchCostCalculator'))}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                New Tool
              </Badge>
            </div>
            <h3 className="text-xl font-bold mb-1">Match Budget & Cost Planner</h3>
            <p className="text-white/95 text-sm mb-3">
              Estimate USMLE, ECFMG, rotation, travel, and ERAS costs. Convert to your local currency and see strategies to save.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex-1 flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <Calculator className="w-3 h-3" />
                Budget Estimator
              </span>
              <span className="flex-1 flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <Globe className="w-3 h-3" />
                Local Currency Conversion
              </span>
              <ChevronRight className="w-5 h-5 ml-auto" />
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate(createPageUrl('Community'))}
            className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[rgba(var(--color-primary),0.8)] to-[rgba(var(--color-primary),1)] flex items-center justify-center mb-2">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white text-xs">Community</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Peers</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => navigate(createPageUrl('Mentors'))}
            className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-2">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white text-xs">Find Mentor</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Guidance</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate(createPageUrl('USMLEQuizPack'))}
            className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-2">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white text-xs">Quiz Pack</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">500+ Qs</p>
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