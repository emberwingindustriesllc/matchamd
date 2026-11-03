import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, FileText, Video, Book, ChevronRight, ShieldCheck } from 'lucide-react';
import { openExternalUrlSafely } from '@/components/common/ResourceLink';

export default function ResourceHub() {
  const resources = [
    {
      category: 'Official Portals & Match Data',
      icon: FileText,
      color: 'from-[#10B981] to-teal-600',
      links: [
        { title: 'ECFMG Pathways & MyIntealth', url: 'https://www.ecfmg.org/certification-pathways/', desc: 'Official ECFMG certification pathways & Form 186' },
        { title: 'FSMB USMLE Portal', url: 'https://www.fsmb.org/usmle/', desc: 'Step 1, Step 2 CK & Step 3 exam registration' },
        { title: 'NRMP Charting Outcomes for IMGs', url: 'https://www.nrmp.org/match-data-analytics/residency-data-reports/', desc: 'Official IMG match rates by Step 2 score & specialty' },
        { title: 'AMA FREIDA Residency Database', url: 'https://freida.ama-assn.org/', desc: 'Official AMA program directory & visa policies' },
        { title: 'OET Medicine Official Portal', url: 'https://oet.com/learn/preparation-portal', desc: 'Book OET Medicine & practice ≥350 sub-tests' },
        { title: 'AAMC MyERAS Application', url: 'https://students-residents.aamc.org/applying-residencies-eras', desc: 'Residency & fellowship application portal' }
      ]
    },
    {
      category: 'High-Yield Study & AnKing Mirrors',
      icon: Book,
      color: 'from-amber-500 to-orange-500',
      links: [
        { title: 'Anki & AnKing Decks Hub', url: '/AnkiGuide', isInternal: true, desc: 'AnKing Step 1/2 mirrors, add-on codes & settings' },
        { title: 'Medical Book Catalog', url: '/BookCatalog', isInternal: true, desc: 'USMLE & Board prep book tracker' },
        { title: 'AnkiHub Official (AnKing v12)', url: 'https://www.ankihub.net/', desc: 'Live-synced AnKing Step 1 & Step 2 CK deck' },
        { title: 'r/medicalschoolanki Deck Mirror Wiki', url: 'https://www.reddit.com/r/medicalschoolanki/wiki/decks/', desc: 'Free community AnKing & subspecialty deck mirrors' },
        { title: 'UWorld Step 1 / Step 2 CK', url: 'https://www.uworld.com/', desc: 'Gold-standard clinical vignette question bank' },
        { title: 'AMBOSS Medical Library', url: 'https://www.amboss.com/', desc: 'Clinical knowledge library & Qbank' }
      ]
    },
    {
      category: 'IMG Community & Scam Protection',
      icon: ShieldCheck,
      color: 'from-[#F43F5E] to-rose-600',
      links: [
        { title: 'Scam Shield & USCE Truth Radar', url: '/ScamShield', isInternal: true, desc: 'Verified USCE agency reviews & free hospital coordinators' },
        { title: 'r/IMGreddit Community', url: 'https://www.reddit.com/r/IMGreddit/', desc: 'Active peer subreddit for USCE, interviews & Match waves' },
        { title: 'Match Budget & Cost Calculator', url: '/MatchCostCalculator', isInternal: true, desc: 'Tiered ERAS fee & USMLE cost planner' },
        { title: 'AAMC Fee Assistance (FAP)', url: 'https://students-residents.aamc.org/financial-aid', desc: 'Official ERAS fee assistance info' }
      ]
    },
    {
      category: 'Interview & Video Mastery',
      icon: Video,
      color: 'from-indigo-500 to-purple-600',
      links: [
        { title: '20-Lesson Interview Mastery Course', url: '/InterviewCourse', isInternal: true, desc: 'Curated video lessons, STAR flashcards & PDF handouts' },
        { title: 'ECFMG Official News & Webinars', url: 'https://www.ecfmg.org/news/', desc: 'Official policy updates for 2026–2027 Match' }
      ]
    }
  ];

  return (
    <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
          <FileText className="w-5 h-5 text-[#10B981] dark:text-[#4ADE80]" />
          Essential IMG Resources & Vetted Portals
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Verified links for NRMP Charting Outcomes, FSMB, OET, AMA FREIDA, r/IMGreddit &amp; AnKing mirrors
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {resources.map((category, idx) => {
          const Icon = category.icon;
          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center shadow-xs`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                  {category.category}
                </h4>
              </div>
              <div className="space-y-1.5 ml-10">
                {category.links.map((link, linkIdx) => {
                  if (link.isInternal) {
                    return (
                      <Link
                        key={linkIdx}
                        to={link.url}
                        className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group border border-transparent hover:border-[#10B981]/30"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#10B981] dark:text-[#4ADE80] group-hover:underline">
                              {link.title}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#10B981] dark:text-[#4ADE80]" />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{link.desc}</p>
                        </div>
                      </Link>
                    );
                  }
                  return (
                    <a
                      key={linkIdx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => openExternalUrlSafely(e, link.url, link.title)}
                      className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-[#10B981] dark:group-hover:text-[#4ADE80] group-hover:underline">
                            {link.title}
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#10B981]" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{link.desc}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}