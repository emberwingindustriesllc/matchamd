import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Sparkles, Coffee, Award, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const STORAGE_KEY = 'matchamd_readiness_milestones_v1';

export const CORE_IMG_MILESTONES = [
  {
    id: 'ecfmg_form_186',
    label: 'ECFMG Form 186',
    shortDesc: 'NotaryCam identity & MyIntealth verification',
    guideId: 'ecfmg_certification',
  },
  {
    id: 'oet_medicine',
    label: 'OET Medicine',
    shortDesc: 'Score ≥350 (L/R/S) & ≥300 (Writing)',
    guideId: 'ecfmg_pathways',
  },
  {
    id: 'pathway_approval',
    label: 'Pathway Approval',
    shortDesc: 'ECFMG Pathway 1–6 clinical skills approval',
    guideId: 'ecfmg_pathways',
  },
  {
    id: 'usmle_step1',
    label: 'Step 1 Passed',
    shortDesc: 'USMLE Step 1 Pass on official transcript',
    guideId: 'usmle_step1',
  },
  {
    id: 'usmle_step2_ck',
    label: 'Step 2 CK',
    shortDesc: 'Numerical score ready before Sept ERAS opening',
    guideId: 'usmle_step2',
  },
  {
    id: 'usce_lors',
    label: 'USCE LoRs (3–4)',
    shortDesc: 'Hands-on / Hospital letterhead LoRs uploaded',
    guideId: 'clinical_experience',
  },
  {
    id: 'mspe_transcript',
    label: 'MSPE & Transcript',
    shortDesc: 'Medical school Dean’s Letter & transcript verified',
    guideId: 'eras_application',
  },
  {
    id: 'eras_token',
    label: 'ERAS Token & NRMP',
    shortDesc: 'MyERAS token activated & NRMP ID linked',
    guideId: 'eras_application',
  },
];

export default function MatchaReadinessCup({ profile }) {
  const navigate = useNavigate();

  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    // Derive sensible defaults from profile
    const defaults = [];
    if (profile?.usmle_step1_status === 'passed' || profile?.step_1_status === 'passed') {
      defaults.push('usmle_step1');
    }
    if (profile?.usmle_step2_status === 'passed' || profile?.step_2_ck_status === 'passed') {
      defaults.push('usmle_step2_ck');
    }
    if (profile?.ecfmg_certified) {
      defaults.push('ecfmg_form_186', 'oet_medicine', 'pathway_approval');
    }
    if (profile?.us_clinical_experience) {
      defaults.push('usce_lors');
    }
    return defaults;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));
    } catch {
      // ignore
    }
  }, [completedIds]);

  const toggleMilestone = (id) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const completedCount = completedIds.length;
  const totalCount = CORE_IMG_MILESTONES.length;
  const fillPercentage = Math.round((completedCount / totalCount) * 100);

  // SVG Ring & Cup geometry
  const ringSize = 132;
  const strokeWidth = 8;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (fillPercentage / 100) * circumference;

  const getReadinessTier = (pct) => {
    if (pct === 100) return { label: 'Ceremonial Grade Match-Ready!', color: 'text-[#4ADE80]' };
    if (pct >= 75) return { label: 'Whisked & Competitive', color: 'text-[#10B981]' };
    if (pct >= 38) return { label: 'Brewing Momentum', color: 'text-amber-400' };
    return { label: 'Fresh Matcha Leaves', color: 'text-emerald-300' };
  };

  const tier = getReadinessTier(fillPercentage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#1E293B] border border-emerald-500/25 dark:border-emerald-500/30 p-5 shadow-xl"
    >
      {/* Subtle Electric Matcha ambient glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#10B981]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-[#4ADE80]/10 blur-2xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#4ADE80] flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Coffee className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  Matcha Readiness Cup
                </h3>
                <Badge className="bg-[#10B981]/15 text-[#10B981] dark:text-[#4ADE80] border border-[#10B981]/30 text-[10px] px-2 py-0">
                  Interactive
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tap your completed IMG milestones to fill your Matcha cup
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-[#10B981] dark:text-[#4ADE80]">
              {completedCount}/{totalCount}
            </span>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Milestones
            </p>
          </div>
        </div>

        {/* Visual Matcha Cup + Progress Ring Hero */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-900 dark:bg-[#0F172A] border border-slate-800 mb-4 text-white">
          <div className="relative flex items-center justify-center shrink-0" style={{ width: ringSize, height: ringSize }}>
            {/* Outer Animated Progress Ring */}
            <svg width={ringSize} height={ringSize} className="transform -rotate-90">
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                strokeWidth={strokeWidth}
                stroke="rgba(255,255,255,0.08)"
                fill="transparent"
              />
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                strokeWidth={strokeWidth}
                stroke="url(#matchaCupRingGrad)"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="matchaCupRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4ADE80" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Animated Matcha Cup Liquid */}
            <div className="absolute inset-4 rounded-full overflow-hidden bg-slate-950/90 border border-emerald-500/30 flex flex-col items-center justify-center">
              {/* Rising Matcha Liquid Wave */}
              <motion.div
                initial={false}
                animate={{ height: `${fillPercentage}%` }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#059669] via-[#10B981] to-[#4ADE80]/85"
                style={{ opacity: fillPercentage > 0 ? 0.85 : 0 }}
              >
                {/* Foam crest */}
                <div className="w-full h-2 bg-[#A7F3D0]/70 blur-[1px]" />
              </motion.div>

              {/* Percentage & Steam */}
              <div className="relative z-10 text-center select-none">
                <Sparkles className="w-3.5 h-3.5 mx-auto mb-0.5 text-[#4ADE80]" />
                <div className="text-2xl font-black tracking-tight text-white drop-shadow">
                  {fillPercentage}%
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-200/90">
                  Brewed
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className={`text-xs font-bold uppercase tracking-wider ${tier.color} flex items-center justify-center sm:justify-start gap-1.5`}>
              <Award className="w-4 h-4" />
              <span>{tier.label}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {fillPercentage === 100
                ? 'All 8 core IMG Match milestones are complete! Your application package is ready for ERAS submission and interview waves.'
                : `You have completed ${completedCount} of 8 core IMG residency milestones. Check off each milestone below as you progress toward Match Day.`}
            </p>
            <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={() => navigate(createPageUrl('ScamShield'))}
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-colors"
              >
                🛡️ Verify USCE on Scam Shield
                <ChevronRight className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => navigate(createPageUrl('IMGPrograms'))}
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
              >
                🏥 Browse Programs
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 8 Core IMG Milestones Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CORE_IMG_MILESTONES.map((milestone) => {
            const isDone = completedIds.includes(milestone.id);
            return (
              <div
                key={milestone.id}
                onClick={() => toggleMilestone(milestone.id)}
                role="checkbox"
                aria-checked={isDone}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleMilestone(milestone.id);
                  }
                }}
                className={`group flex items-start gap-2.5 p-2.5 rounded-xl border text-left cursor-pointer transition-all select-none ${
                  isDone
                    ? 'bg-[#10B981]/10 dark:bg-[#10B981]/15 border-[#10B981]/50 text-slate-900 dark:text-white shadow-sm'
                    : 'bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] dark:text-[#4ADE80]" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-xs font-bold truncate ${isDone ? 'text-emerald-700 dark:text-[#4ADE80]' : ''}`}>
                      {milestone.label}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(createPageUrl(`GuideDetail?id=${milestone.guideId}`));
                      }}
                      className="text-[10px] text-slate-400 hover:text-[#10B981] dark:hover:text-[#4ADE80] underline opacity-80 hover:opacity-100 shrink-0"
                    >
                      Guide
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    {milestone.shortDesc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
