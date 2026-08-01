import React, { useState } from 'react';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  ExternalLink, 
  Sparkles, 
  Share2, 
  Puzzle,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AnkiGuide() {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success('Guide link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const ankiLinks = [
    {
      title: 'Download Anki Software',
      url: 'https://apps.ankiweb.net/',
      description: 'Official desktop client (Windows, macOS, Linux) and mobile companion app.',
      badge: 'Software'
    },
    {
      title: 'Browse Official Anki Add-ons',
      url: 'https://ankiweb.net/shared/addons/2.1',
      description: 'Search 2.1 compatible add-ons like Heatmap, Image Occlusion, and Pop-up Dictionary.',
      badge: 'Add-ons'
    },
    {
      title: 'Download AnKing Deck (MEGA mirror)',
      url: 'https://bit.ly/2Z4MBvI',
      description: 'Direct AnKing Overhaul Step 1 & Step 2 CK high-yield medical flashcard deck mirror on MEGA.',
      badge: 'Deck Download'
    },
    {
      title: 'Download AnKing Deck (Google Drive mirror)',
      url: 'http://bit.ly/2Z169RB',
      description: 'Direct AnKing Overhaul Step 1 & Step 2 CK deck mirror hosted on Google Drive.',
      badge: 'Deck Download'
    },
    {
      title: 'Reddit Medical School Anki Community',
      url: 'https://www.reddit.com/r/medicalschoolanki/',
      description: 'Community deck releases, updates, custom deck shares, and Step 1/Step 2 CK review discussions.',
      badge: 'Community'
    }
  ];

  const recommendedAddons = [
    { code: '1374772155', name: 'Image Occlusion Enhanced', desc: 'Hide anatomical or flowchart labels for instant self-quizzing.' },
    { code: '1771074083', name: 'AnkiHeatmap', desc: 'Visual streak tracker to maintain your daily card review discipline.' },
    { code: '153625302', name: 'Pop-up Dictionary', desc: 'Highlight any term on a card to instantly open related cards in your collection.' },
    { code: '2055492159', name: 'AnKing Note Types', desc: 'Enhanced formatting with collapsible fields for UWorld & First Aid references.' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header title="Anki Medical Mastery & Decks" showBack />

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white border-none shadow-xl overflow-hidden relative">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-indigo-500/30 text-indigo-200 border-indigo-400/40">
                  High-Yield Study System
                </Badge>
                <Badge className="bg-purple-500/30 text-purple-200 border-purple-400/40">
                  Step 1 & Step 2 CK
                </Badge>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
                Anki Flashcards & Decks Hub
              </h1>
              <p className="text-indigo-200 text-sm md:text-base leading-relaxed max-w-2xl">
                Master long-term retention for USMLE Step 1, Step 2 CK, and shelf exams using active recall and spaced repetition. Access official downloads, community decks, and optimal settings.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <a
                  href="https://apps.ankiweb.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-950 font-bold rounded-xl text-sm hover:bg-indigo-50 transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  Download Anki Desktop
                </a>
                <Button
                  onClick={handleCopyShare}
                  variant="outline"
                  className="border-indigo-400/40 text-white hover:bg-white/10 rounded-xl text-sm"
                >
                  {copiedLink ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                  {copiedLink ? 'Copied' : 'Share Guide'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Primary Download Links */}
        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Official Anki & AnKing Downloads
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {ankiLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm flex items-center gap-1.5">
                    {link.title}
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800">
                    {link.badge}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {link.description}
                </p>
              </a>
            ))}
          </div>
        </Card>

        {/* Essential Add-ons */}
        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Top Add-ons for Medical Students
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
            In Anki, go to <strong>Tools &gt; Add-ons &gt; Get Add-ons...</strong> and paste the Code below:
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            {recommendedAddons.map((addon, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{addon.name}</span>
                  <code className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-mono px-2 py-0.5 rounded">
                    {addon.code}
                  </code>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{addon.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Anki Best Practices */}
        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-700 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            High-Yield Anki Workflow Strategy
          </h2>

          <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/50">
              <h4 className="font-bold text-amber-900 dark:text-amber-300 mb-1">1. Do Your Reviews Everyday First</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Never skip review days. If review count builds up, suspend non-essential cards and prioritize incorrect UWorld cards.
              </p>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800/50">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1">2. Unsuspend Cards by Tag After Practice Questions</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                In the AnKing deck, use <code>#AK_Step1_v12</code> or <code>#AK_Step2_v12</code> tags to unsuspend cards specifically for incorrect UWorld question IDs.
              </p>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300 mb-1">3. Keep Cards Cloze-Deletion & Atomic</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                When making your own custom cards, keep each card focused on a single concept (1 fact per cloze deletion) for faster retention.
              </p>
            </div>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
