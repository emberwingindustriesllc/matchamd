import React, { useState } from 'react';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
  Trophy,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Lock
} from 'lucide-react';
import BenefitComparison from '@/components/subscription/BenefitComparison';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    icon: Star,
    color: 'from-slate-500 to-slate-600',
    description: 'Start your journey with essential tools',
    features: [
      'Access to basic pathway guides',
      'Community forum participation',
      'Progress tracking dashboard',
      'Public mentor directory',
      'Weekly newsletter with tips',
      '3 mentor connection requests per month'
    ]
  },
  {
    id: 'premium',
    name: 'MatchaMD+',
    price: 9.99,
    icon: logo ? (({ className }) => <img src={logo} className={className} alt="MatchaMD+" />) : Crown,
    color: 'from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))]',
    popular: true,
    description: 'The ultimate USMLE & Match companion',
    features: [
      'Everything in Free, plus:',
      'Unlimited mentor connection requests',
      'Complete specialty-specific guides',
      'Comprehensive interview preparation materials',
      'Priority support in community',
      'Personalized application timeline',
      'Professional CV & personal statement templates',
      'Ad-free experience across the platform'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    icon: Sparkles,
    color: 'from-amber-500 to-orange-500',
    description: 'Maximum support for competitive advantage',
    features: [
      'Everything in Premium, plus:',
      'One scheduled 1-on-1 mentor session monthly',
      'Professional application review service',
      'Access to mock interview sessions',
      'Exclusive live webinars with program directors',
      'Personalized program research assistance',
      'Early access to new features & content',
      'White-glove priority support (2-hour response)'
    ]
  }
];

const addOns = [
  {
    id: 'quiz_usmle',
    name: 'USMLE Quiz Pack',
    price: 4.99,
    icon: BookOpen,
    description: '500+ practice questions for Step 1 & 2'
  },
  {
    id: 'specialty_surgery',
    name: 'Surgery Specialty Guide',
    price: 3.99,
    icon: Trophy,
    description: 'Deep dive into surgical residency applications'
  },
  {
    id: 'interview_premium',
    name: 'Interview Mastery Course',
    price: 9.99,
    icon: MessageSquare,
    description: '20+ video lessons + practice questions'
  }
];

export default function Subscription() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { user } = useAuth();


  const { data: subscriptions } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('subscriptions').select('*').eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ['purchases', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('purchased_content').select('*').eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const currentSubscription = subscriptions?.[0];

  const purchaseMutation = useMutation({
    /** @param {string} planId */
    mutationFn: async (planId) => {
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
      
      await purchaseManager.purchasePlan(planId);
    }
  });

  const purchaseAddOnMutation = useMutation({
    /** @param {{id: string, name: string}} addOn */
    mutationFn: async (addOn) => {
      await purchaseManager.purchaseAddOn(addOn.id, addOn.name);
    }
  });

  const manageSubscriptionMutation = useMutation({
    mutationFn: async () => {
      await purchaseManager.manageSubscription();
    }
  });

  const hasPurchased = (addOnId) => purchases.some(p => p.content_id === addOnId);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="MatchaMD Subscription" 
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[rgba(var(--color-primary),0.1)] to-[rgba(var(--color-primary),0.2)] border border-[rgba(var(--color-primary),0.3)] mb-4">
            <TrendingUp className="w-4 h-4 text-[rgb(var(--color-primary))]" />
            <span className="text-sm font-medium text-[rgb(var(--color-primary))]">
              Accelerate Your Medical Career
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Choose Your Success Plan
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Get personalized guidance, exclusive resources, and expert mentorship to match into your dream program
          </p>
        </motion.div>

        {/* Current Plan */}
        {currentSubscription && currentSubscription.plan !== 'free' && (
          <Card className="p-6 mb-8 bg-gradient-to-br from-[rgba(var(--color-primary),0.1)] to-[rgba(var(--color-primary),0.2)] border-[rgba(var(--color-primary),0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Current Plan</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                  {currentSubscription.plan}
                </h3>
              </div>
              <Badge className="bg-green-500 text-white">
                {currentSubscription.status === 'active' ? 'Active' : currentSubscription.status}
              </Badge>
            </div>
            <Button 
              variant="outline"
              onClick={() => manageSubscriptionMutation.mutate()}
              disabled={manageSubscriptionMutation.isPending}
              className="w-full"
            >
              Manage Subscription
            </Button>
          </Card>
        )}

        {/* Subscription Plans */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Subscription Plans</h2>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Lock className="w-4 h-4" />
                Cancel anytime
              </span>
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
                  className="relative"
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(110,135,30)] text-white px-4">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <Card className={`p-6 h-full ${plan.popular ? 'border-2 border-[rgb(var(--color-primary))]' : ''}`}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                      {plan.name}
                    </h3>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {plan.description}
                    </p>
                    
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-slate-900 dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">/month</span>
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      onClick={() => purchaseMutation.mutate(plan.id)}
                      disabled={isCurrentPlan}
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] text-white' : ''}`}
                      variant={isCurrentPlan ? 'outline' : 'default'}
                    >
                      {isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Downgrade to Free' : 'Subscribe'}
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

        {/* Add-ons */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Premium Add-ons</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">One-time purchases to enhance your journey</p>
          
          <div className="grid md:grid-cols-3 gap-4">
            {addOns.map((addOn) => {
              const Icon = addOn.icon;
              const purchased = hasPurchased(addOn.id);
              
              return (
                <Card key={addOn.id} className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                        {addOn.name}
                      </h3>
                      <p className="text-xs text-slate-500">${addOn.price}</p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                    {addOn.description}
                  </p>
                  
                  <Button
                    onClick={() => purchaseAddOnMutation.mutate(addOn)}
                    disabled={purchased}
                    size="sm"
                    className="w-full"
                    variant={purchased ? 'outline' : 'default'}
                  >
                    {purchased ? 'Purchased' : 'Buy Now'}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <Card className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
            All subscriptions auto-renew. Cancel anytime from settings. 7-day money-back guarantee for new subscribers.
            By subscribing, you agree to our Terms of Service.
          </p>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}