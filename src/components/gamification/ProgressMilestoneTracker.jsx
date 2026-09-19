import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Trophy, Award, Sparkles, Stethoscope, FileCheck } from 'lucide-react';

export default function ProgressMilestoneTracker({ completedCount = 0, totalCount = 1 }) {
  const safeTotal = totalCount > 0 ? totalCount : 1;
  const percentage = Math.min(100, Math.max(0, Math.round((completedCount / safeTotal) * 100)));

  // 4 Standard GME Residency Milestones
  const milestones = [
    { label: 'Foundations', threshold: 25, icon: Stethoscope, desc: 'Prerequisites & Setup' },
    { label: 'Documentation', threshold: 50, icon: FileCheck, desc: 'Transcripts & Credentials' },
    { label: 'Verification', threshold: 75, icon: Award, desc: 'Clinical & Exam Readiness' },
    { label: 'Match Ready', threshold: 100, icon: Trophy, desc: 'Submission & Interviews' },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-900/50">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide uppercase text-indigo-200">
              Residency Pathway Milestone Tracker
            </h3>
            <p className="text-xs text-slate-400">
              {completedCount} of {totalCount} pathway items verified
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-white">{percentage}%</span>
          <p className="text-[10px] text-indigo-300 font-medium">COMPLETION</p>
        </div>
      </div>

      {/* Modern Progress Line */}
      <div className="relative mb-6">
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-400 via-indigo-400 to-purple-400 rounded-full shadow-lg"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 4 Clinical Milestone Nodes */}
      <div className="grid grid-cols-4 gap-2">
        {milestones.map((m, idx) => {
          const isPassed = percentage >= m.threshold;
          const Icon = m.icon;

          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl border transition-all ${
                isPassed
                  ? 'bg-indigo-900/40 border-indigo-500/50 text-white shadow-sm'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isPassed
                      ? 'bg-teal-400/20 text-teal-300'
                      : 'bg-slate-700/50 text-slate-500'
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="text-[10px] font-semibold opacity-75">{m.threshold}%</span>
              </div>
              <p className="font-bold text-xs truncate">{m.label}</p>
              <p className="text-[10px] opacity-70 truncate mt-0.5">{m.desc}</p>
            </div>
          );
        })}
      </div>

      {percentage === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center gap-2 text-emerald-300 font-semibold text-xs"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Pathway Complete — All Milestones Fulfilled!</span>
        </motion.div>
      )}
    </div>
  );
}
