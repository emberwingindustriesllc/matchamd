import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Crown, 
  Zap, 
  Star,
  Sparkles,
  Trophy,
  Users,
  BookOpen,
  MessageSquare
} from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    icon: Star,
    color: 'from-slate-500 to-slate-600',
    features: [
      'Basic pathway guides',
      'Community access',
      'Progress tracking',
      'Public mentor directory',
      'Weekly newsletter'
    ],
    limitations: [
      'Limited to 3 mentor requests/month',
      'No specialty-specific guides',
      'Standard support'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    icon: Crown,
    color: 'from-indigo-500 to-purple-500',
    popular: true,
    features: [
      'All Free features',
      'Unlimited mentor requests',
      'Specialty-specific guides',
      'Interview prep materials',
      'Priority community support',
      'Personalized timeline',
      'CV/PS templates',
      'Ad-free experience'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    icon: Sparkles,
    color: 'from-amber-500 to-orange-500',
    features: [
      'All Premium features',
      '1-on-1 monthly mentor session',
      'Application review service',
      'Mock interview access',
      'Exclusive webinars',
      'Program research assistance',
      'Early access to new features',
      'White-glove support'
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

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: () => base44.entities.Subscription.filter({ user_id: user?.id }),
    enabled: !!user?.id
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ['purchases', user?.id],
    queryFn: () => base44.entities.PurchasedContent.filter({ user_id: user?.id }),
    enabled: !!user?.id
  });

  const currentSubscription = subscriptions?.[0];

  const upgradeMutation = useMutation({
    mutationFn: async (planId) => {
      // In production, this would integrate with Stripe
      if (currentSubscription) {
        return base44.entities.Subscription.update(currentSubscription.id, {
          plan: planId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      } else {
        return base44.entities.Subscription.create({
          user_id: user.id,
          plan: planId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    }
  });

  const purchaseAddOnMutation = useMutation({
    mutationFn: async (addOn) => {
      return base44.entities.PurchasedContent.create({
        user_id: user.id,
        content_type: addOn.id.includes('quiz') ? 'quiz_pack' : addOn.id.includes('specialty') ? 'specialty_guide' : 'interview_prep',
        content_id: addOn.id,
        price: addOn.price
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    }
  });

  const hasPurchased = (addOnId) => purchases.some(p => p.content_id === addOnId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header title="Premium" showBack />

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Current Plan */}
        {currentSubscription && (
          <Card className="p-6 mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Current Plan</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                  {currentSubscription.plan}
                </h3>
              </div>
              <Badge className="bg-green-500 text-white">Active</Badge>
            </div>
          </Card>
        )}

        {/* Subscription Plans */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Choose Your Plan</h2>
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
                      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <Card className={`p-6 h-full ${plan.popular ? 'border-2 border-indigo-500 dark:border-indigo-400' : ''}`}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-slate-900 dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">/month</span>
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                        </li>
                      ))}
                      {plan.limitations?.map((limit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-500">
                          <span className="w-5 h-5 flex-shrink-0">•</span>
                          <span>{limit}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      onClick={() => upgradeMutation.mutate(plan.id)}
                      disabled={isCurrentPlan || upgradeMutation.isPending}
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : ''}`}
                      variant={isCurrentPlan ? 'outline' : 'default'}
                    >
                      {isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Select Free' : 'Upgrade'}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
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
                    disabled={purchased || purchaseAddOnMutation.isPending}
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