import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import logo from '@/assets/logo.png';
import { purchaseManager } from '@/lib/purchaseManager';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Lock, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function PremiumGate({ title, description, price, features, contentId, onUnlocked }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showStagingModal, setShowStagingModal] = useState(false);

  const handleActivateDemo = () => {
    purchaseManager.activateDemoAddOn(contentId, title);
    queryClient.invalidateQueries({ queryKey: ['purchases'] });
    setShowStagingModal(false);
    toast({
      title: 'Content Unlocked! 🎉',
      description: `Successfully unlocked ${title} in demo mode.`
    });
    if (onUnlocked) {
      onUnlocked();
    }
  };

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      return await purchaseManager.purchaseAddOn(contentId, title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast({
        title: 'Content Unlocked! 🎉',
        description: `You now have full access to ${title}.`
      });
      if (onUnlocked) {
        onUnlocked();
      }
    },
    onError: (error) => {
      console.warn('Purchase failed in staging mode:', error);
      setShowStagingModal(true);
    }
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title={title} logo={logo} showBack />

      <main className="px-4 py-12 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Lock Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] flex items-center justify-center shadow-xl">
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
          <Card className="border-2 border-[rgba(var(--color-primary),0.3)] dark:border-[rgba(var(--color-primary),0.5)] mb-6">
            <CardHeader className="bg-gradient-to-br from-[rgba(var(--color-primary),0.05)] to-[rgba(var(--color-secondary),0.1)] dark:from-[rgba(var(--color-primary),0.1)] dark:to-[rgba(var(--color-secondary),0.2)]">
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
                className="w-full h-12 bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] hover:opacity-90 text-white font-semibold shadow-lg"
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
                Secure checkout powered by {purchaseManager.isNative() ? (purchaseManager.isIOS() ? 'App Store' : 'Google Play') : 'Stripe'}
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
                You can activate this course in Demo Mode right now to preview and explore all modules.
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
              onClick={handleActivateDemo}
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