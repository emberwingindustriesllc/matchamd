import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, ExternalLink, BookOpen } from 'lucide-react';

export default function OETRequirements() {
  const skills = [
    { name: 'Listening', minScore: 350 },
    { name: 'Reading', minScore: 350 },
    { name: 'Writing', minScore: 350 },
    { name: 'Speaking', minScore: 350 }
  ];

  return (
    <Card className="p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-lg text-amber-900 dark:text-amber-300 mb-1">
            CRITICAL: OET Medicine Requirement
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-400">
            All 2026 Pathways require satisfactory OET Medicine scores
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Score Requirements */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
          <h4 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Minimum Scores Required
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {skills.map((skill) => (
              <div key={skill.name} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {skill.name}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-emerald-600">
                    {skill.minScore}
                  </span>
                  <span className="text-xs text-slate-500">minimum</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
            You must score <strong>minimum 350 in ALL FOUR skills</strong> - no exceptions
          </p>
        </div>

        {/* Test Date Requirement */}
        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 border border-rose-200 dark:border-rose-800">
          <h4 className="font-semibold text-rose-800 dark:text-rose-300 mb-2">
            ⚠️ Test Date Validity Window
          </h4>
          <p className="text-sm text-rose-700 dark:text-rose-400">
            Your OET test must be taken on or after <strong>January 1, 2024</strong>. Tests before this date are NOT accepted for 2026 Pathways.
          </p>
        </div>

        {/* Preparation Resources */}
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Preparation Resources
          </h4>
          <div className="space-y-2">
            <a
              href="https://www.occupationalenglishtest.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow"
            >
              <div>
                <div className="font-medium text-sm text-slate-800 dark:text-white">
                  Official OET Registration
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Book your test and access prep materials
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-indigo-600" />
            </a>

            <a
              href="https://www.occupationalenglishtest.org/prepare/practice-tests/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow"
            >
              <div>
                <div className="font-medium text-sm text-slate-800 dark:text-white">
                  Free OET Practice Tests
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Official practice materials
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-indigo-600" />
            </a>

            <a
              href="https://preparation.occupationalenglishtest.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow"
            >
              <div>
                <div className="font-medium text-sm text-slate-800 dark:text-white">
                  OET Online Preparation
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Premium prep courses and materials
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-indigo-600" />
            </a>
          </div>
        </div>

        {/* Score Report */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            📊 After Your Test
          </h4>
          <ul className="space-y-1.5 text-sm text-blue-700 dark:text-blue-400">
            <li>• Results available within 7-15 business days</li>
            <li>• Scores valid for 2 years from test date</li>
            <li>• Official score report sent directly to ECFMG upon request</li>
            <li>• Keep a copy of your scores for ERAS application</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}