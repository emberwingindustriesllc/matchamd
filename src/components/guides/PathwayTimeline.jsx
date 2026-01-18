import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  Calendar,
  FileText,
  GraduationCap,
  Stethoscope,
  Trophy
} from 'lucide-react';

export default function PathwayTimeline({ pathway = 'residency' }) {
  const milestones = [
    {
      phase: 'Foundation',
      icon: GraduationCap,
      color: 'from-blue-500 to-blue-600',
      tasks: [
        { id: 1, title: 'Create ECFMG Account', duration: '1 week', status: 'completed' },
        { id: 2, title: 'Medical School Verification', duration: '4-8 weeks', status: 'in_progress' },
        { id: 3, title: 'Obtain Medical Diploma/Transcript', duration: '2-4 weeks', status: 'pending' }
      ]
    },
    {
      phase: 'USMLE Preparation',
      icon: FileText,
      color: 'from-emerald-500 to-emerald-600',
      tasks: [
        { id: 4, title: 'USMLE Step 1 Prep & Exam', duration: '6-12 months', status: 'pending' },
        { id: 5, title: 'USMLE Step 2 CK Prep & Exam', duration: '4-8 months', status: 'pending' }
      ]
    },
    {
      phase: 'OET & Pathways',
      icon: Stethoscope,
      color: 'from-purple-500 to-purple-600',
      tasks: [
        { id: 6, title: 'OET Medicine Registration', duration: '2-4 weeks', status: 'pending' },
        { id: 7, title: 'OET Exam (min. 350 all skills)', duration: '1 day', status: 'pending' },
        { id: 8, title: 'Complete Pathway Requirements', duration: 'Varies by pathway', status: 'pending' },
        { id: 9, title: 'Submit MyIntealth Application', duration: '2-3 weeks', status: 'pending' }
      ]
    },
    {
      phase: 'Certification',
      icon: Trophy,
      color: 'from-amber-500 to-amber-600',
      tasks: [
        { id: 10, title: 'ECFMG Review & Verification', duration: '4-8 weeks', status: 'pending' },
        { id: 11, title: 'Receive ECFMG Certification', duration: '1 week', status: 'pending' }
      ]
    },
    {
      phase: 'Match Process',
      icon: Calendar,
      color: 'from-rose-500 to-rose-600',
      tasks: [
        { id: 12, title: 'ERAS Application (Sept 2025)', duration: '1 month', status: 'pending' },
        { id: 13, title: 'Interview Season', duration: 'Oct 2025 - Feb 2026', status: 'pending' },
        { id: 14, title: 'Submit NRMP Rank List', duration: 'March 2026', status: 'pending' },
        { id: 15, title: 'Match Day!', duration: 'March 2026', status: 'pending' }
      ]
    }
  ];

  return (
    <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-slate-800 dark:text-white">
          Complete Pathway Timeline
        </h3>
      </div>

      <div className="space-y-6">
        {milestones.map((milestone, phaseIdx) => {
          const Icon = milestone.icon;
          const completedTasks = milestone.tasks.filter(t => t.status === 'completed').length;
          const inProgressTasks = milestone.tasks.filter(t => t.status === 'in_progress').length;
          const progress = (completedTasks / milestone.tasks.length) * 100;

          return (
            <div key={phaseIdx} className="relative">
              {/* Phase Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${milestone.color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-800 dark:text-white">
                      {milestone.phase}
                    </h4>
                    {completedTasks === milestone.tasks.length && (
                      <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                        Complete
                      </Badge>
                    )}
                    {inProgressTasks > 0 && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        In Progress
                      </Badge>
                    )}
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${milestone.color} transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="ml-5 border-l-2 border-slate-200 dark:border-slate-700 pl-6 space-y-3">
                {milestone.tasks.map((task, taskIdx) => (
                  <div 
                    key={task.id}
                    className="relative group"
                  >
                    {/* Task Bullet */}
                    <div className={`absolute -left-[29px] w-4 h-4 rounded-full border-2 ${
                      task.status === 'completed' 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : task.status === 'in_progress'
                        ? 'bg-blue-500 border-blue-500 animate-pulse'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                    }`}>
                      {task.status === 'completed' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white absolute -top-[1px] -left-[1px]" />
                      )}
                    </div>

                    {/* Task Content */}
                    <div className={`p-3 rounded-lg transition-all ${
                      task.status === 'completed'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                        : task.status === 'in_progress'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-sm font-medium ${
                          task.status === 'completed'
                            ? 'text-emerald-800 dark:text-emerald-300'
                            : task.status === 'in_progress'
                            ? 'text-blue-800 dark:text-blue-300'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {task.title}
                        </span>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {task.duration}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">1</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Completed</div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">1</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">In Progress</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-2xl font-bold text-slate-600">13</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Pending</div>
          </div>
        </div>
      </div>
    </Card>
  );
}