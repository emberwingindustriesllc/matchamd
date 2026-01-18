import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, FileText, Video, BookOpen } from 'lucide-react';

export default function OfficialReferences() {
  const references = [
    {
      category: 'Primary Sources',
      icon: FileText,
      color: 'indigo',
      sources: [
        {
          title: 'Requirements for 2026 Pathways for ECFMG Certification',
          url: 'https://www.ecfmg.org/certification-pathways/requirements.html',
          type: 'Official Documentation'
        },
        {
          title: 'Certification Pathways - Main Page',
          url: 'https://www.ecfmg.org/certification/',
          type: 'Official Page'
        },
        {
          title: 'Detailed Information and Online Application for 2026 Pathways',
          url: 'https://www.ecfmg.org/news/2025/08/01/detailed-information-online-application-2026-pathways-now-available/',
          type: 'ECFMG News'
        },
        {
          title: 'ECFMG 2026 Information Booklet',
          url: 'https://www.ecfmg.org/certification-pathways/booklet.html',
          type: 'Official Booklet',
          description: 'Clinical Skills Requirement and Communication Skills Requirement'
        }
      ]
    },
    {
      category: 'Pathway-Specific Information',
      icon: BookOpen,
      color: 'emerald',
      sources: [
        {
          title: 'Pathway 1: Already Licensed to Practice Medicine',
          url: 'https://www.ecfmg.org/certification-pathways/pathway-1.html',
          type: 'Official Guide'
        },
        {
          title: '2026 Pathways | Pathways 3, 4, and 5',
          url: 'https://www.ecfmg.org/certification-pathways/pathways-3-4-5.html',
          type: 'Official Guide'
        },
        {
          title: '2026 Pathways | Assessment of Communication Skills',
          url: 'https://www.ecfmg.org/certification-pathways/communication-skills.html',
          type: 'Official Guide',
          description: 'Including English Language Proficiency (OET)'
        }
      ]
    },
    {
      category: 'Application & Process',
      icon: FileText,
      color: 'blue',
      sources: [
        {
          title: 'Important Information on 2026 Pathways; Application Opens August 2025',
          url: 'https://www.ecfmg.org/news/2025/06/15/important-information-2026-pathways-application-open-august/',
          type: 'ECFMG News'
        },
        {
          title: 'Information on Expiration of Pathways and ECFMG Certificate',
          url: 'https://www.ecfmg.org/certification-pathways/expiration.html',
          type: 'Official Policy'
        },
        {
          title: '2026 Pathways | FAQs',
          url: 'https://www.ecfmg.org/certification-pathways/faqs.html',
          type: 'Official FAQ'
        }
      ]
    },
    {
      category: 'Educational Resources',
      icon: Video,
      color: 'purple',
      sources: [
        {
          title: '2026 Pathways for ECFMG Certification | How to Become ECFMG Certified?',
          url: 'https://www.youtube.com/watch?v=ecfmg2026pathways',
          type: 'YouTube Video',
          description: 'Official video guide'
        },
        {
          title: 'The Pathways for ECFMG Certification for MATCH 2026',
          url: 'https://www.ecfmg.org/certification-pathways/match-2026.html',
          type: 'Match Guide'
        }
      ]
    },
    {
      category: 'Community Resources',
      icon: BookOpen,
      color: 'amber',
      sources: [
        {
          title: '2026 ECFMG Pathways Will Open This August – Official Update from ECFMG',
          url: 'https://www.reddit.com/r/IMGreddit/',
          type: 'Community Discussion',
          description: 'r/IMGreddit community discussions'
        }
      ]
    }
  ];

  return (
    <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          Official References & Citations
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          All information is sourced from official ECFMG documentation. Always verify with the latest updates at ecfmg.org.
        </p>
      </div>

      <div className="space-y-6">
        {references.map((category, idx) => {
          const Icon = category.icon;
          const colorMap = {
            indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
            emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          };

          return (
            <div key={idx}>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-3 ${colorMap[category.color]}`}>
                <Icon className="w-4 h-4" />
                <h4 className="font-semibold text-sm">
                  {category.category}
                </h4>
              </div>

              <div className="space-y-2">
                {category.sources.map((source, sourceIdx) => (
                  <a
                    key={sourceIdx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-xl transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-slate-800 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {source.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {source.type}
                          </Badge>
                          {source.description && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {source.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Last Updated */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          📅 Information current as of January 2026. For the most recent updates, always check{' '}
          <a 
            href="https://www.ecfmg.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            ecfmg.org
          </a>
        </p>
      </div>
    </Card>
  );
}