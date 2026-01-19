import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, FileText, Video, Book, Calculator } from 'lucide-react';

export default function ResourceHub() {
  const resources = [
    {
      category: 'Official Resources',
      icon: FileText,
      color: 'from-blue-500 to-indigo-500',
      links: [
        { title: 'ECFMG Pathways', url: 'https://www.ecfmg.org/certification/pathways.html', desc: 'Official pathway guide' },
        { title: 'USMLE.org', url: 'https://www.usmle.org', desc: 'Exam registration & info' },
        { title: 'NRMP Match Calendar', url: 'https://www.nrmp.org/match-calendars/', desc: '2026 Match timeline' },
        { title: 'ERAS Application', url: 'https://students-residents.aamc.org/applying-residencies-eras', desc: 'Apply to residencies' }
      ]
    },
    {
      category: 'Study Resources',
      icon: Book,
      color: 'from-amber-500 to-orange-500',
      links: [
        { title: 'UWorld Step 2 CK', url: 'https://www.uworld.com', desc: 'Question bank - essential' },
        { title: 'AMBOSS', url: 'https://www.amboss.com', desc: 'Study platform & library' },
        { title: 'Anki Decks', url: 'https://www.ankipalace.com', desc: 'Spaced repetition cards' }
      ]
    },
    {
      category: 'Financial Tools',
      icon: Calculator,
      color: 'from-emerald-500 to-teal-500',
      links: [
        { title: 'AAMC Fee Assistance', url: 'https://students-residents.aamc.org/financial-aid', desc: 'FAP program info' },
        { title: 'Match Cost Calculator', url: 'https://www.nrmp.org', desc: 'Budget your application' }
      ]
    },
    {
      category: 'Video Guides',
      icon: Video,
      color: 'from-rose-500 to-pink-500',
      links: [
        { title: 'IMG Interview Tips', url: 'https://www.youtube.com/results?search_query=IMG+residency+interview', desc: 'Preparation videos' },
        { title: 'ECFMG Webinars', url: 'https://www.ecfmg.org/news/', desc: 'Official updates' }
      ]
    }
  ];

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Essential Resources
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Vetted links for FMG success - ECFMG, NRMP, study tools
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {resources.map((category, idx) => {
          const Icon = category.icon;
          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-sm text-slate-800 dark:text-white">
                  {category.category}
                </h4>
              </div>
              <div className="space-y-1.5 ml-10">
                {category.links.map((link, linkIdx) => (
                  <a
                    key={linkIdx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline">
                          {link.title}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{link.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}