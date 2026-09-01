import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ExternalLink, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function QuickStartChecklist({ profile, progressList }) {
  const navigate = useNavigate();

  const quickStartItems = [
    {
      id: 'ecfmg_pathways',
      title: 'Determine Your ECFMG Pathway',
      description: 'Pathway 1 (licensed), 3 (WFME), 4, 5, or 6',
      deadline: 'Start ASAP - 12-18 months before Match',
      link: createPageUrl('GuideDetail?id=ecfmg_pathways'),
      external: false,
      priority: 'critical'
    },
    {
      id: 'check_wfme',
      title: 'Verify WFME Accreditation',
      description: 'Check if your med school qualifies for Pathway 3 (fastest)',
      link: 'https://www.wfme.org',
      external: true,
      priority: 'critical'
    },
    {
      id: 'usmle_step1',
      title: 'Register for USMLE Step 1',
      description: 'Pass/Fail - focus on understanding concepts',
      deadline: '18+ months before Match',
      link: createPageUrl('GuideDetail?id=usmle_step1'),
      external: false,
      priority: 'high'
    },
    {
      id: 'oet_medicine',
      title: 'Schedule OET Medicine',
      description: 'Minimum 350 per sub-test required for ECFMG',
      link: 'https://www.occupationalenglishtest.org',
      external: true,
      priority: 'high'
    },
    {
      id: 'join_community',
      title: 'Connect with IMG Community',
      description: 'Get advice from 16,000+ IMG applicants',
      link: createPageUrl('Community'),
      external: false,
      priority: 'medium'
    }
  ];

  const getItemStatus = (itemId) => {
    const progress = progressList.find(p => p.module_id === itemId);
    return progress?.status === 'completed';
  };

  const completedCount = quickStartItems.filter(item => getItemStatus(item.id)).length;

  const priorityColors = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  };

  return (
    <Card className="border-[rgb(var(--color-primary),0.2)] dark:border-[rgb(var(--color-primary),0.4)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Quick Start Checklist</CardTitle>
          <Badge variant="secondary" className="bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-primary))] dark:bg-[rgba(var(--color-primary),0.2)] dark:text-emerald-400">
            {completedCount}/{quickStartItems.length}
          </Badge>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Essential first steps for US medical match success
        </p>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {quickStartItems.map((item) => {
          const isCompleted = getItemStatus(item.id);
          return (
            <div
              key={item.id}
              onClick={() => {
                if (item.external) {
                  window.open(item.link, '_blank');
                } else {
                  navigate(item.link);
                }
              }}
              className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer group hover:border-indigo-400 dark:hover:border-indigo-600"
            >
              <div className="flex items-start gap-3">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 flex-shrink-0 mt-0.5 transition-colors" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h4>
                    <Badge className={`${priorityColors[item.priority]} text-xs px-1.5 py-0 font-medium`}>
                      {item.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    {item.deadline ? (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">⏰ {item.deadline}</span>
                    ) : <span />}
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      {item.external ? 'Open Portal' : 'Jump to Guide'}
                      {item.external ? <ExternalLink className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}