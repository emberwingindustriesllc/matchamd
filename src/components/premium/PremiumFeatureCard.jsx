import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PremiumFeatureCard({ 
  title, 
  description, 
  features = [],
  isPremium = true,
  unlocked = false,
  icon: Icon = Crown,
  color = 'from-amber-500 to-orange-500'
}) {
  const navigate = useNavigate();

  if (!isPremium || unlocked) {
    return null; // Don't show card if not premium or already unlocked
  }

  return (
    <Card className="border-2 border-amber-200 dark:border-amber-800 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 mt-1">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
          </div>
          <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
        
        {features.length > 0 && (
          <ul className="space-y-2">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <Button
          onClick={() => navigate(createPageUrl('Subscription'))}
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Premium - $9.99/month
        </Button>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          Cancel anytime • 7-day free trial
        </p>
      </CardContent>
    </Card>
  );
}