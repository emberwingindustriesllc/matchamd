import React from 'react';
import { Check, X, Zap, Crown, Sparkles, Database, FileSpreadsheet, Calculator, FileDown, ShieldCheck, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  { 
    category: 'Program & Clinical Intelligence',
    items: [
      { name: '50-State Residency Program Database', free: 'Preview (5/specialty)', premium: 'Unlimited (All 50 States)', pro: 'Unlimited (All 50 States)' },
      { name: 'Fellowship Programs (NICU, PHM, Cardio, GI, Pulm)', free: 'Preview', premium: 'Full Database Access', pro: 'Full Database Access' },
      { name: 'Real Verified Hospital Observership Directory', free: 'Preview (3 programs)', premium: 'Full Directory (25+ Centers)', pro: 'Full Directory (25+ Centers)' },
      { name: 'Visa Sponsorship Filters (H-1B, J-1, OPT/EAD)', free: false, premium: true, pro: true },
      { name: 'IMG Match % & Score Cutoff Intel', free: 'Basic', premium: 'Detailed Analytics', pro: 'Detailed Analytics' },
      { name: 'Program Coordinator & Contact Emails', free: false, premium: true, pro: true },
    ]
  },
  {
    category: 'Application Planning & Budgeting',
    items: [
      { name: 'Match Cost & Live Budget Deductor Calculator', free: 'Basic Calculator', premium: 'Full Budgeting + Live Deduction', pro: 'Full Budgeting + Live Deduction' },
      { name: 'Standardized Medical CV & Profile Exporter (PDF/JSON)', free: 'View Only', premium: 'Unlimited Exports (PDF, JSON, Text)', pro: 'Unlimited Exports (PDF, JSON, Text)' },
      { name: 'Specialty Roadmap Guides (Peds, IM, Surg, FM)', free: 'Basic Guides', premium: 'Full Specialty Roadmaps', pro: 'Full Specialty Roadmaps' },
      { name: 'Self-Guided Behavioral Interview Question Bank', free: 'Preview', premium: 'Full Question Bank + STAR Guides', pro: 'Full Question Bank + STAR Guides' },
      { name: 'Milestone Progress Tracker & Portal Gateway', free: true, premium: true, pro: true },
    ]
  },
  {
    category: 'Physician Clinical Review (Asynchronous)',
    items: [
      { name: 'Founder CV & Personal Statement Review', free: 'Not Included', premium: 'Available as Add-On', pro: '1 Review Included (5-7d SLA)' },
      { name: 'Research Abstract & Study Design Critique', free: 'Not Included', premium: 'Available as Add-On', pro: '1 Review Included (5-7d SLA)' },
      { name: 'Standard Review Turnaround Time', free: '—', premium: '5-7 Business Days (Add-on)', pro: '5-7 Business Days' },
    ]
  }
];

export default function BenefitComparison() {
  const renderValue = (value) => {
    if (value === true) return <Check className="w-5 h-5 text-emerald-500 mx-auto" />;
    if (value === false) return <X className="w-5 h-5 text-slate-300 dark:text-slate-600 mx-auto" />;
    return <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">{value}</span>;
  };

  return (
    <Card className="p-6 overflow-x-auto border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Compare Platform Features
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Honest, transparent features designed to save you thousands in application fees and optimize your match strategy.
        </p>
      </div>
      
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold text-sm">Feature</th>
            <th className="text-center py-3 px-3">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                </div>
                <span className="font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-300">Free</span>
              </div>
            </th>
            <th className="text-center py-3 px-3 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-t-lg">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-[rgb(var(--color-primary))] flex items-center justify-center">
                  <Crown className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold text-xs sm:text-sm text-[rgb(var(--color-primary))]">MatchaMD+</span>
              </div>
            </th>
            <th className="text-center py-3 px-3">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold text-xs sm:text-sm text-amber-600 dark:text-amber-400">MatchaMD Pro</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((category, catIdx) => (
            <React.Fragment key={catIdx}>
              <tr>
                <td colSpan={4} className="pt-6 pb-2">
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider bg-slate-50 dark:bg-slate-800/60 py-1.5 px-3 rounded">
                    {category.category}
                  </h4>
                </td>
              </tr>
              {category.items.map((item, itemIdx) => (
                <tr key={itemIdx} className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {item.name}
                  </td>
                  <td className="py-3 px-3 text-center">{renderValue(item.free)}</td>
                  <td className="py-3 px-3 text-center bg-emerald-50/20 dark:bg-emerald-950/10 font-semibold">{renderValue(item.premium)}</td>
                  <td className="py-3 px-3 text-center">{renderValue(item.pro)}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </Card>
  );
}