import React from 'react';
import { Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PremiumGate({ 
  title = 'Premium Feature',
  description = 'Upgrade to access this content',
  requiredPlan = 'premium',
  children,
  isPremium = false
}) {
  const navigate = useNavigate();

  if (isPremium) {
    return children;
  }

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Crown className="w-8 h-8 text-white" />
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      
      <div className="flex items-center justify-center gap-3">
        <Lock className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Requires {requiredPlan === 'pro' ? 'Pro' : 'Premium'} subscription
        </span>
      </div>
      
      <Button 
        onClick={() => navigate(createPageUrl('Subscription'))}
        className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600"
      >
        <Crown className="w-4 h-4 mr-2" />
        Upgrade Now
      </Button>
    </Card>
  );
}