import React from 'react';
import { Card } from '@/components/ui/card';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function DocumentSubmissionNotice({ compact = false }) {
  return (
    <Card className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-teal-50/50 to-white dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 border-2 border-indigo-200/80 dark:border-indigo-800/60 shadow-sm">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/20">
          <ShieldCheck className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Official Document Submission Notice
            </h4>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
              Companion Workspace
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            <strong>MatchaMD is your personalized planning & tracking companion.</strong> To ensure GME compliance and legal authenticity, official residency documents (USMLE transcripts, Form 186, MSPE, and official Letters of Recommendation) cannot be submitted through third-party apps—they must be uploaded directly to authorized accredited portals.
          </p>

          {!compact && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3.5 pt-3 border-t border-indigo-100 dark:border-slate-800">
              <a
                href="https://myintealth.ecfmg.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors group"
              >
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    MyIntealth / ECFMG Portal
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">Form 186, Diploma, Pathways</p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-1" />
              </a>

              <a
                href="https://students-residents.aamc.org/applying-residencies-eras/military-and-residency-applicants"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors group"
              >
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    AAMC MyERAS Portal
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">LoRP Letter Requests, MSPE</p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-1" />
              </a>

              <a
                href="https://www.fsmb.org/usmle"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors group"
              >
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    FSMB USMLE Portal
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">Step 1/2 CK Registrations & Transcripts</p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-1" />
              </a>

              <a
                href="https://oet.com/learn/preparation-portal"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors group"
              >
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    OET Medicine Preparation
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">Sample Tests & Scheduling</p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-1" />
              </a>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
