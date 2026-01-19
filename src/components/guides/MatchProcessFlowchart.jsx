import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Calendar,
  Users,
  Trophy,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function MatchProcessFlowchart() {
  const phases = [
    {
      phase: 'Preparation Phase',
      color: 'blue',
      duration: '12-18 months before Match',
      steps: [
        { 
          icon: FileText, 
          title: 'ECFMG Certification',
          items: [
            'Complete pathway requirements',
            'Pass USMLE Step 1 & 2 CK',
            'OET Medicine (min. 350 all skills)',
            'Submit MyIntealth application'
          ],
          deadline: 'By September 2025'
        },
        {
          icon: Users,
          title: 'Clinical Experience',
          items: [
            'US Clinical Experience (USCE)',
            'Letters of Recommendation (3-4)',
            'Research/Publications (optional)',
            'Observerships/Externships'
          ],
          deadline: 'Throughout year'
        }
      ]
    },
    {
      phase: 'Application Phase',
      color: 'purple',
      duration: 'September - October 2025',
      steps: [
        {
          icon: FileText,
          title: 'ERAS Application',
          items: [
            'MyERAS registration opens',
            'Upload CV, personal statement',
            'Request LoRs through ERAS',
            'Select programs (20-60 programs)',
            'Submit applications'
          ],
          deadline: 'Sept 2025 (opens), Oct 2025 (programs receive)'
        },
        {
          icon: CheckCircle2,
          title: 'NRMP Registration',
          items: [
            'Register for NRMP Match',
            'Pay registration fee',
            'Verify ECFMG certification'
          ],
          deadline: 'By late September 2025'
        }
      ]
    },
    {
      phase: 'Interview Season',
      color: 'emerald',
      duration: 'October 2025 - February 2026',
      steps: [
        {
          icon: Calendar,
          title: 'Interview Invitations',
          items: [
            'Programs send invitations',
            'Schedule interviews (virtual/in-person)',
            'Prepare for common questions',
            'Research programs thoroughly'
          ],
          deadline: 'Oct 2025 - Jan 2026'
        },
        {
          icon: Users,
          title: 'Interviews',
          items: [
            'Attend interviews (10-15 typical)',
            'Send thank-you emails',
            'Evaluate program fit',
            'Track impressions'
          ],
          deadline: 'Through February 2026'
        }
      ]
    },
    {
      phase: 'Ranking & Match',
      color: 'amber',
      duration: 'February - March 2026',
      steps: [
        {
          icon: FileText,
          title: 'Create Rank List',
          items: [
            'Rank programs by preference',
            'Consider geography, training quality',
            'Submit via NRMP system',
            'No changes after deadline!'
          ],
          deadline: 'Late February 2026'
        },
        {
          icon: Trophy,
          title: 'Match Week',
          items: [
            'Monday: SOAP (if unmatched)',
            'Wednesday: "Did I Match?" results',
            'Friday: Match Day - Find out where!',
            'Celebrate! 🎉'
          ],
          deadline: 'Third week of March 2026'
        }
      ]
    }
  ];

  const colorMap = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-700 dark:text-purple-300',
      badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    },
    emerald: {
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    },
    amber: {
      gradient: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    }
  };

  return (
    <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="mb-6">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-indigo-500" />
          Complete Match Process Flowchart
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Visual guide from ECFMG certification to Match Day
        </p>
      </div>

      <div className="space-y-6">
        {phases.map((phase, phaseIdx) => {
          const colors = colorMap[phase.color];
          
          return (
            <div key={phaseIdx} className="relative">
              {/* Phase Header */}
              <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 mb-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-bold ${colors.text}`}>
                    {phase.phase}
                  </h4>
                  <Badge className={colors.badge}>
                    <Clock className="w-3 h-3 mr-1" />
                    {phase.duration}
                  </Badge>
                </div>
              </div>

              {/* Steps */}
              <div className="grid md:grid-cols-2 gap-4">
                {phase.steps.map((step, stepIdx) => {
                  const Icon = step.icon;
                  
                  return (
                    <div 
                      key={stepIdx}
                      className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      {/* Step Icon & Title */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-md`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-slate-800 dark:text-white">
                            {step.title}
                          </h5>
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <AlertCircle className="w-3 h-3" />
                            {step.deadline}
                          </div>
                        </div>
                      </div>

                      {/* Items Checklist */}
                      <ul className="space-y-2">
                        {step.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700 dark:text-slate-300">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Arrow to next phase */}
              {phaseIdx < phases.length - 1 && (
                <div className="flex justify-center py-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Next Phase
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Final Note */}
      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
        <div className="flex items-start gap-3">
          <Trophy className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
              Success Tip
            </h5>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              Start early! The most successful IMGs begin ECFMG certification 12-18 months before their target Match. Build relationships with mentors, get strong LORs, and apply broadly (typically 40-80 programs for IMGs).
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}