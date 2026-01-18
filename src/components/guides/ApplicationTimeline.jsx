import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ExternalLink, AlertCircle } from 'lucide-react';

export default function ApplicationTimeline() {
  const milestones = [
    {
      date: 'August 2025',
      title: 'MyIntealth Portal Opens',
      description: 'Online application system launched for pathways certification',
      status: 'completed',
      color: 'emerald'
    },
    {
      date: 'September 24, 2025',
      title: 'ERAS Applications Open',
      description: 'Your ECFMG certification status becomes visible to programs',
      status: 'completed',
      color: 'blue',
      critical: true
    },
    {
      date: 'January 31, 2026',
      title: 'ECFMG Certification Deadline',
      description: 'Final deadline for receiving ECFMG certification for 2026 Match',
      status: 'upcoming',
      color: 'rose',
      critical: true
    },
    {
      date: 'March 2026',
      title: 'NRMP ROL Deadline',
      description: 'Submit your rank order list for the Match',
      status: 'upcoming',
      color: 'purple',
      critical: true
    },
    {
      date: 'December 31, 2028',
      title: '2026 Pathways Expire',
      description: 'Revalidation required for use beyond this date',
      status: 'future',
      color: 'amber'
    }
  ];

  return (
    <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-indigo-500" />
        Application Timeline & Key Deadlines
      </h3>

      {/* MyIntealth Info */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-4 mb-4 border border-indigo-200 dark:border-indigo-800">
        <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
          📝 Apply via MyIntealth Portal
        </h4>
        <p className="text-sm text-indigo-800 dark:text-indigo-400 mb-3">
          ECFMG launched the MyIntealth online application system in August 2025. All pathway applications are submitted through this portal.
        </p>
        <a
          href="https://www.ecfmg.org/certification-pathways/myintealth.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:underline"
        >
          Access MyIntealth Portal
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
        
        <div className="space-y-6">
          {milestones.map((milestone, idx) => (
            <div key={idx} className="relative pl-10">
              <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                milestone.status === 'completed' 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500' 
                  : milestone.status === 'upcoming'
                  ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                  : 'bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600'
              }`}>
                {milestone.status === 'completed' ? (
                  <span className="text-emerald-600 text-sm">✓</span>
                ) : (
                  <Clock className={`w-4 h-4 ${
                    milestone.status === 'upcoming' ? 'text-blue-600' : 'text-slate-400'
                  }`} />
                )}
              </div>

              <div className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-semibold ${
                    milestone.status === 'upcoming' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {milestone.date}
                  </span>
                  {milestone.critical && (
                    <Badge variant="destructive" className="text-xs">CRITICAL</Badge>
                  )}
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
                  {milestone.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {milestone.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revalidation Note */}
      <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
        <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Pathway Revalidation
        </h4>
        <p className="text-sm text-amber-700 dark:text-amber-400">
          If your 2026 Pathway expires (Dec 31, 2028) and you need certification beyond that date, you must reapply through the same MyIntealth process. This applies to repeat applicants or those extending their certification.
        </p>
      </div>
    </Card>
  );
}