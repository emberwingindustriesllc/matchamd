import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, FileText, BookOpen } from 'lucide-react';

export default function OfficialReferences() {
  const references = [
    {
      category: 'Primary Sources',
      icon: FileText,
      color: 'indigo',
      sources: [
        {
          title: 'Requirements for Pathways for ECFMG Certification',
          url: 'https://www.ecfmg.org/certification-pathways/',
          type: 'Official Documentation'
        },
        {
          title: 'Certification Pathways - Main Page',
          url: 'https://www.ecfmg.org/certification-pathways/',
          type: 'Official Page'
        },
        {
          title: 'Detailed Information & Online Application Pathways',
          url: 'https://www.ecfmg.org/certification-pathways/',
          type: 'ECFMG News'
        },
        {
          title: 'ECFMG Information Booklet',
          url: 'https://www.ecfmg.org/certification-pathways/',
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
          url: 'https://www.ecfmg.org/certification-pathways/',
          type: 'Official Guide'
        },
        {
          title: 'Pathways | Pathways 3, 4, and 5',
          url: 'https://www.ecfmg.org/certification-pathways/',
          type: 'Official Guide'
        },
        {
          title: 'Pathways | Assessment of Communication Skills',
          url: 'https://www.ecfmg.org/certification-pathways/',
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
          title: 'Important Information on ECFMG Pathways',
          url: 'https://www.ecfmg.org/certification-pathways/',
          type: 'ECFMG News'
        },
        {
          title: 'Information on Expiration of Pathways and ECFMG Certificate',
          url: 'https://www.ecfmg.org/certification-pathways/',
          type: 'Official Policy'
        },
        {
          title: 'Pathways | FAQs',
          url: 'https://www.ecfmg.org/certification-pathways/',
          type: 'Official FAQ'
        }
      ]
    },
    {
      category: 'Study Guides & References',
      icon: BookOpen,
      color: 'purple',
      sources: [
        {
          title: 'ECFMG Certification Pathways Overview',
          url: 'https://www.ecfmg.org/certification-pathways/',
          type: 'Official Guide',
          description: 'Start here for pathway requirements, OET, and how to apply.'
        },
        {
          title: 'Pathways Requirements Details',
          url: 'https://www.ecfmg.org/certification-pathways/',
          type: 'Official Documentation',
          description: 'Clinical/communication skills requirements for Pathways.'
        },
        {
          title: 'Pathways FAQs',
          url: 'https://www.ecfmg.org/certification-pathways/',
          type: 'Official FAQ',
          description: 'Common questions about pathways, OET, expiration, and certification.'
        }
      ]
    },
    {
      category: 'Match Data, Licensing & Community Portals',
      icon: BookOpen,
      color: 'amber',
      sources: [
        {
          title: 'NRMP Charting Outcomes in the Match (International Medical Graduates)',
          url: 'https://www.nrmp.org/match-data-analytics/residency-data-reports/',
          type: 'Official Match Data',
          description: 'Official IMG match probability tables by USMLE Step 2 CK, YOG, USCE, and research output'
        },
        {
          title: 'AMA FREIDA Residency & Fellowship Database',
          url: 'https://freida.ama-assn.org/',
          type: 'Official Directory',
          description: 'Verify ACGME program IDs, J-1/H-1B visa sponsorship, and interview formats'
        },
        {
          title: 'FSMB USMLE & Step 3 Portal',
          url: 'https://www.fsmb.org/usmle/',
          type: 'Official Exam Portal',
          description: 'USMLE exam registration, score transcripts, and state medical board licensing rules'
        },
        {
          title: 'OET Medicine Official Preparation Portal',
          url: 'https://oet.com/learn/preparation-portal',
          type: 'Official Language Exam',
          description: 'Official sample tests and booking for ECFMG communication skills requirement'
        },
        {
          title: 'r/IMGreddit – International Medical Graduate Community',
          url: 'https://www.reddit.com/r/IMGreddit/',
          type: 'Community Discussion',
          description: 'Peer discussions on ECFMG pathways, USCE rotations, and interview waves'
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