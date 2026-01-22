import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getStripe } from '@/components/stripe/StripeProvider';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

export default function PremiumGate({ title, description, price, features, contentId }) {
  const navigate = useNavigate();

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('stripeOneTimeCheckout', {
        addOnId: contentId,
        addOnName: title
      });
      if (data.url) {
        window.location.href = data.url;
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header title={title} showBack />

      <main className="px-4 py-12 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Lock Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl">
            <Lock className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Premium Content
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            {description}
          </p>

          {/* Pricing Card */}
          <Card className="border-2 border-indigo-200 dark:border-indigo-800 mb-6">
            <CardHeader className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <CardTitle className="text-center">
                <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  ${price}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  One-time purchase • Lifetime access
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3 mb-6">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 text-left">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => purchaseMutation.mutate()}
                disabled={purchaseMutation.isPending}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold"
              >
                {purchaseMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Purchase Now
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
                Secure payment powered by Stripe
              </p>
            </CardContent>
          </Card>

          {/* Alternative Options */}
          <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Want access to all premium content?
              </p>
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl('Subscription'))}
                className="w-full"
              >
                View Subscription Plans
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}