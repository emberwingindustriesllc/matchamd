import React, { useState } from 'react';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useToast } from '@/components/ui/use-toast';
import { purchaseManager } from '@/lib/purchaseManager';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Crown, 
  Star,
  Sparkles,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Lock,
  Eye,
  Loader2,
  ShieldCheck,
  Zap,
  Clock,
  Compass,
  FileText,
  Users,
  Video
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import BenefitComparison from '@/components/subscription/BenefitComparison';
import AsyncReviewModal from '@/components/reviews/AsyncReviewModal';

const plans = [
  {
    id: 'free',
    name: 'Match Starter',
    price: 0,
    icon: Star,
    color: 'from-slate-500 to-slate-600',
    description: 'Essential free tools for ECFMG & Match planning',
    features: [
      'Interactive ECFMG & USMLE Milestone Stepper',
      'Official verification portal gateway (MyIntealth, LoRP)',
      'Preview residency search (5 programs per specialty)',
      'Basic application cost estimator',
      'Community forum discussion & peer Q&A'
    ]
  },
  {
    id: 'premium',
    name: 'MatchaMD+',
    price: 9.99,
    icon: logo ? (({ className }) => <img src={logo} className={className} alt="MatchaMD+" />) : Crown,
    color: 'from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))]',
    popular: true,
    description: 'Full program intelligence & budget optimization suite',
    features: [
      'Everything in Free, plus:',
      'Full 50-state IMG residency & fellowship database',
      'Verified real hospital observership directory (25+ centers)',
      'Visa filters (H-1B, J-1, OPT/EAD) & IMG % analytics',
      'Program coordinator & director contact details',
      'Live budget deductor & cost optimizer calculator',
      'Standardized Medical CV & Profile PDF/JSON exporter',
      'All specialty roadmaps (Peds, IM, Surgery, FM)',
      'Self-guided behavioral interview question bank (STAR method)'
    ]
  },
  {
    id: 'pro',
    name: 'MatchaMD Pro',
    price: 29.99,
    icon: Sparkles,
    color: 'from-amber-500 to-orange-500',
    description: 'Software suite + 1 async clinical application review',
    features: [
      'Everything in MatchaMD+, plus:',
      '1 Physician async application review per season',
      'In-depth CV or Personal Statement rubric feedback',
      '5 to 7 business day written review turnaround',
      'Research abstract & study design presentation advisory',
      'Priority access to upcoming Phase 2 platform features'
    ]
  }
];

const addOns = [
  {
    id: 'review_cv_ps',
    name: 'Async CV & Personal Statement Review',
    price: 49.00,
    icon: FileText,
    type: 'review_modal',
    initialType: 'cv_ps',
    sla: '5-7 Business Days',
    description: 'Written clinical evaluation and margin feedback report from an experienced US physician reviewer.'
  },
  {
    id: 'review_research',
    name: 'Async Research & Study Design Critique',
    price: 39.00,
    icon: Compass,
    type: 'review_modal',
    initialType: 'research',
    sla: '5-7 Business Days',
    description: 'Advisory review of study methodology, abstract structure, and optimal presentation on your ERAS CV.'
  },
  {
    id: 'interview_premium',
    name: 'Interview Mastery Course',
    price: 9.99,
    icon: MessageSquare,
    type: 'route',
    route: 'InterviewCourse',
    description: 'Self-paced video modules, high-yield behavioral prompts, and residency interview strategies.'
  },
  {
    id: 'quiz_usmle',
    name: 'USMLE Practice Question Pack',
    price: 4.99,
    icon: BookOpen,
    type: 'route',
    route: 'USMLEQuizPack',
    description: 'High-yield clinical vignette practice questions for Step 1 & Step 2 CK preparation.'
  }
];

export default function Subscription() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showStagingModal, setShowStagingModal] = useState(false);
  const [stagingItem, setStagingItem] = useState(null);
  const [purchasingPlanId, setPurchasingPlanId] = useState(null);
  const [purchasingAddOnId, setPurchasingAddOnId] = useState(null);
  
  // Async Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewModalType, setReviewModalType] = useState('cv_ps');

  // Roadmap Waitlist Dialog
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);
  const [waitlistFeature, setWaitlistFeature] = useState('');
  const [waitlistEmail, setWaitlistEmail] = useState('');

  const { user } = useAuth();

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      let dbSub = [];
      if (user?.id) {
        try {
          const { data } = await supabase.from('subscriptions').select('*').eq('user_id', user?.id);
          if (data) dbSub = data;
        } catch (e) {
          console.warn('Failed to fetch subscription from DB', e);
        }
      }
      let localSub = null;
      try {
        localSub = JSON.parse(localStorage.getItem('matchamd_active_subscription'));
      } catch (e) {}
      if (localSub) return [localSub, ...dbSub];
      return dbSub;
    }
  });

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
      } catch (e) {}
      return [...dbPurchases, ...localPurchases];
    }
  });

  const currentSubscription = subscriptions?.[0];

  const handleActivateDemo = (item) => {
    if (!item || item.type === 'plan') {
      const planId = item?.id || 'premium';
      purchaseManager.activateDemoSubscription(planId);
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setShowStagingModal(false);
      toast({
        title: 'Demo Access Activated! 🎉',
        description: `Unlocked MatchaMD+ (${planId}) in staging/demo mode.`
      });
      navigate(createPageUrl('Profile'), { replace: true });
    } else if (item.type === 'addon') {
      purchaseManager.activateDemoAddOn(item.id, item.name);
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      setShowStagingModal(false);
      toast({
        title: 'Content Unlocked! 🎉',
        description: `Successfully unlocked ${item.name} in demo mode.`
      });
      if (item.route) {
        navigate(createPageUrl(item.route));
      }
    }
  };

  const purchaseMutation = useMutation({
    /** @param {string} planId */
    mutationFn: async (planId) => {
      setPurchasingPlanId(planId);
      if (planId === 'free') {
        if (currentSubscription) {
          const { data, error } = await supabase.from('subscriptions').update({
            plan: 'free',
            status: 'active'
          }).eq('id', currentSubscription.id).select().single();
          if (error) throw error;
          return data;
        }
        return;
      }
      return await purchaseManager.purchasePlan(planId);
    },
    onSuccess: (res, planId) => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast({
        title: planId === 'free' ? 'Plan updated' : 'Subscription activated!',
        description: planId === 'free' ? 'Switched to Free plan.' : 'Thank you for subscribing to MatchaMD!'
      });
      if (planId !== 'free') {
        navigate(createPageUrl('Profile'), { replace: true });
      }
    },
    onError: (error, planId) => {
      console.warn('Purchase plan error (Stripe staging):', error);
      setStagingItem({ type: 'plan', id: planId });
      setShowStagingModal(true);
    },
    onSettled: () => {
      setPurchasingPlanId(null);
    }
  });

  const purchaseAddOnMutation = useMutation({
    /** @param {any} addOn */
    mutationFn: async (addOn) => {
      setPurchasingAddOnId(addOn.id);
      return await purchaseManager.purchaseAddOn(addOn.id, addOn.name);
    },
    onSuccess: (res, addOn) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast({
        title: 'Content Unlocked!',
        description: `Successfully unlocked ${addOn.name}.`
      });
      if (addOn.type === 'review_modal') {
        setReviewModalType(addOn.initialType || 'cv_ps');
        setReviewModalOpen(true);
      } else if (addOn.route) {
        navigate(createPageUrl(addOn.route));
      }
    },
    onError: (error, addOn) => {
      console.warn('Purchase add-on error (Stripe staging):', error);
      setStagingItem({ type: 'addon', id: addOn.id, name: addOn.name, route: addOn.route });
      setShowStagingModal(true);
    },
    onSettled: () => {
      setPurchasingAddOnId(null);
    }
  });

  const manageSubscriptionMutation = useMutation({
    mutationFn: async () => {
      await purchaseManager.manageSubscription();
    }
  });

  const hasPurchased = (addOnId) => purchases.some(p => p.content_id === addOnId);

  const handleJoinWaitlist = (e) => {
    e.preventDefault();
    if (!waitlistEmail.trim()) return;
    try {
      const existing = JSON.parse(localStorage.getItem('matchamd_waitlist') || '[]');
      localStorage.setItem('matchamd_waitlist', JSON.stringify([{ email: waitlistEmail, feature: waitlistFeature, date: new Date().toISOString() }, ...existing]));
    } catch (err) {}
    toast({
      title: 'Added to Priority Waitlist! 🚀',
      description: `We'll notify ${waitlistEmail} as soon as ${waitlistFeature || 'new features'} launch.`,
    });
    setShowWaitlistDialog(false);
    setWaitlistEmail('');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="MatchaMD Plans & Pricing" 
        logo={logo}
        showBack={true} 
      />

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Save Thousands on Blind Applications & Maximize Your Match Chances
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Honest, High-Yield Match Planning Tools
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Get instant access to our verified 50-state program database, real hospital observerships, live budget deductor, and physician clinical reviews.
          </p>
        </motion.div>

        {/* Current Plan */}
        {currentSubscription && currentSubscription.plan !== 'free' && (
          <Card className="p-6 mb-8 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/30 dark:to-slate-900 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Your Active Plan</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                  {currentSubscription.plan === 'premium' ? 'MatchaMD+' : currentSubscription.plan}
                </h3>
              </div>
              <Badge className="bg-emerald-600 text-white font-medium">
                {currentSubscription.status === 'active' ? 'Active' : currentSubscription.status}
              </Badge>
            </div>
            <Button 
              variant="outline"
              onClick={() => manageSubscriptionMutation.mutate()}
              disabled={manageSubscriptionMutation.isPending}
              className="w-full text-xs font-semibold"
            >
              Manage Subscription Settings
            </Button>
          </Card>
        )}

        {/* Subscription Plans */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Choose Your Plan</h2>
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Cancel anytime with 1 click</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = currentSubscription?.plan === plan.id;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative flex flex-col"
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-[rgb(var(--color-primary))] text-white px-3.5 py-0.5 text-xs shadow-sm">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <Card className={`p-6 flex-1 flex flex-col justify-between ${plan.popular ? 'border-2 border-[rgb(var(--color-primary))] shadow-md' : 'border-slate-200 dark:border-slate-800'}`}>
                    <div>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {plan.name}
                      </h3>
                      
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 min-h-[32px]">
                        {plan.description}
                      </p>
                      
                      <div className="mb-6">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">
                          ${plan.price}
                        </span>
                        <span className="text-slate-500 text-xs">/month</span>
                      </div>
                      
                      <ul className="space-y-2.5 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs">
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button
                      onClick={() => {
                        if (isCurrentPlan) {
                          toast({ title: 'Current Active Plan', description: `You are currently subscribed to ${plan.name}.` });
                        } else {
                          purchaseMutation.mutate(plan.id);
                        }
                      }}
                      disabled={purchasingPlanId === plan.id}
                      className={`w-full text-xs font-semibold ${plan.popular ? 'bg-[rgb(var(--color-primary))] hover:opacity-90 text-white' : ''}`}
                      variant={isCurrentPlan ? 'outline' : 'default'}
                    >
                      {purchasingPlanId === plan.id ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : isCurrentPlan ? (
                        'Active Plan'
                      ) : plan.price === 0 ? (
                        'Downgrade to Free'
                      ) : (
                        'Subscribe'
                      )}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="mb-12">
          <BenefitComparison />
        </div>

        {/* Add-ons Section */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              Physician Reviews & Add-ons
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              One-time expert reviews and specialized course modules delivered with clear turnaround timelines.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {addOns.map((addOn) => {
              const Icon = addOn.icon;
              const purchased = hasPurchased(addOn.id);
              
              return (
                <Card key={addOn.id} className="p-5 flex flex-col justify-between border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            {addOn.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">${addOn.price}</span>
                            {addOn.sla && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {addOn.sla}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                      {addOn.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {addOn.type === 'review_modal' ? (
                      <Button
                        onClick={() => {
                          setReviewModalType(addOn.initialType || 'cv_ps');
                          setReviewModalOpen(true);
                        }}
                        className="w-full text-xs font-semibold bg-[rgb(var(--color-primary))] text-white hover:opacity-90 gap-1.5"
                        size="sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Submit for Review (${addOn.price})
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => navigate(createPageUrl(addOn.route))}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          {purchased ? 'Open' : 'Preview'}
                        </Button>
                        <Button
                          onClick={() => {
                            if (purchased) {
                              navigate(createPageUrl(addOn.route));
                            } else {
                              purchaseAddOnMutation.mutate(addOn);
                            }
                          }}
                          disabled={purchasingAddOnId === addOn.id}
                          size="sm"
                          className="flex-1 text-xs font-semibold"
                          variant={purchased ? 'outline' : 'default'}
                        >
                          {purchasingAddOnId === addOn.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : purchased ? (
                            'Unlocked'
                          ) : (
                            `Buy ($${addOn.price})`
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Dedicated Platform Roadmap & Phase 2 Vision */}
        <div className="mb-12 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Platform Vision & Roadmap
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Upcoming in Phase 2</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                We believe in complete transparency. These high-touch human & AI services are actively being built and will launch as our verified mentor community expands.
              </p>
            </div>
            <Button
              onClick={() => {
                setWaitlistFeature('All Phase 2 Features');
                setShowWaitlistDialog(true);
              }}
              className="bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold shrink-0"
            >
              Get Early Access Alert
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  Verified Mentor Network
                  <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-400/40">In Development</Badge>
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  1-on-1 direct messaging and verified resident/attending pairings. Currently vetting our Founding Mentor roster.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  Interactive AI Mock Interviews
                  <Badge variant="outline" className="text-[10px] text-indigo-300 border-indigo-400/40">Roadmap</Badge>
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Simulate high-pressure residency behavioral interviews with real-time feedback on vocal cadence and STAR structure.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  Program Director Live Q&A
                  <Badge variant="outline" className="text-[10px] text-indigo-300 border-indigo-400/40">Roadmap</Badge>
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Exclusive seasonal webinars with GME leadership discussing visa policy shifts, signaling strategies, and selection priorities.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  Founding Mentor Application
                  <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-400/40">Now Open</Badge>
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Are you a US resident or attending physician? Join our founding advisory group to mentor the next generation of IMGs.
                </p>
                <Button 
                  onClick={() => navigate(createPageUrl('Mentors'))}
                  variant="link" 
                  className="text-xs text-emerald-400 hover:text-emerald-300 p-0 h-auto mt-2"
                >
                  Apply to be a Mentor →
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <Card className="p-4 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400 text-center leading-relaxed">
            MatchaMD is an independent educational companion for residency applicants and is not affiliated with the NRMP, ECFMG, or AAMC. All subscriptions can be managed or canceled anytime from your account.
          </p>
        </Card>
      </main>

      {/* Async Review Submission Modal */}
      <AsyncReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        initialType={reviewModalType}
      />

      {/* Waitlist Dialog */}
      <Dialog open={showWaitlistDialog} onOpenChange={setShowWaitlistDialog}>
        <DialogContent className="rounded-2xl max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Join the Phase 2 Priority Waitlist</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Be the first to know when verified mentorship, mock interview simulators, and live webinars go live.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleJoinWaitlist} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Your Email Address
              </label>
              <input
                type="email"
                required
                placeholder="doctor@example.com"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowWaitlistDialog(false)} size="sm">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[rgb(var(--color-primary))] text-white">
                Join Waitlist
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stripe Staging & Demo Mode Modal */}
      <Dialog open={showStagingModal} onOpenChange={setShowStagingModal}>
        <DialogContent className="rounded-3xl max-w-md p-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  Payment Gateway Notice
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Staging Mode & Test Access
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 my-2">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              MatchaMD production payment processing is currently in staging mode while merchant banking accounts and live webhooks are being connected.
            </p>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/60 dark:from-indigo-950/30 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/60">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  Instant Demo Access Available
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                You can activate complete MatchaMD+ features in Demo Mode right now to preview and explore all premium content.
              </p>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowStagingModal(false)}
              className="flex-1 rounded-xl text-xs"
            >
              Dismiss
            </Button>
            <Button
              onClick={() => handleActivateDemo(stagingItem)}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Unlock in Demo Mode
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}