import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import logo from '@/assets/logo.png';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Video,
  CheckCircle2,
  PlayCircle,
  Lightbulb,
  FileText,
  Star,
  X,
  Play,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumGate from '@/components/premium/PremiumGate';

const courseModules = [
  {
    id: 1,
    title: 'Interview Fundamentals',
    lessons: [
      { id: 1, title: 'What Program Directors Look For', duration: '8 min', completed: true, summary: 'Learn the core criteria US program directors evaluate: clinical competence, communication skills, professionalism, and team fit.' },
      { id: 2, title: 'Virtual vs In-Person Interviews', duration: '6 min', completed: false, summary: 'Master lighting, camera setup, eye contact, and platform troubleshooting for virtual residency interviews.' },
      { id: 3, title: 'First Impressions & Body Language', duration: '10 min', completed: false, summary: 'Key posture tips, confident vocal tone, and engaging storytelling techniques.' },
      { id: 4, title: 'Structuring Your Answers (STAR Method)', duration: '12 min', completed: false, summary: 'Situation, Task, Action, Result framework tailored for medical clinical vignettes.' }
    ]
  },
  {
    id: 2,
    title: 'Common Interview Questions',
    lessons: [
      { id: 5, title: '"Tell Me About Yourself" - Perfect Answer', duration: '15 min', completed: false, summary: 'Crafting a 2-minute elevated pitch connecting your medical background to your residency goals.' },
      { id: 6, title: '"Why Our Program?" Research Strategies', duration: '10 min', completed: false, summary: 'How to analyze hospital patient volume, fellowship matches, and faculty research.' },
      { id: 7, title: '"Why This Specialty?" Compelling Narratives', duration: '12 min', completed: false, summary: 'Articulating passion through patient encounters and rotation highlights.' },
      { id: 8, title: 'Handling Weakness Questions', duration: '10 min', completed: false, summary: 'Authentic self-reflection paired with tangible action steps for improvement.' },
      { id: 9, title: 'Discussing Gap Years & Challenges', duration: '14 min', completed: false, summary: 'Framing clinical gaps or visa hurdles into stories of resilience and dedication.' }
    ]
  },
  {
    id: 3,
    title: 'IMG-Specific Challenges',
    lessons: [
      { id: 10, title: 'Addressing Visa Status Confidently', duration: '8 min', completed: false, summary: 'Clear explanations of J-1 vs H-1B requirements and state licensing.' },
      { id: 11, title: 'Explaining Multiple Step Attempts', duration: '10 min', completed: false, summary: 'Addressing exam setbacks proactively with proven growth metrics.' },
      { id: 12, title: 'Showcasing International Experience', duration: '9 min', completed: false, summary: 'Translating global healthcare insights into unique clinical strengths.' },
      { id: 13, title: 'Cultural Differences & Communication', duration: '11 min', completed: false, summary: 'Navigating US medical hierarchy, patient autonomy, and interprofessional teams.' }
    ]
  },
  {
    id: 4,
    title: 'Advanced Techniques',
    lessons: [
      { id: 14, title: 'Asking Smart Questions to Interviewers', duration: '12 min', completed: false, summary: 'High-yield questions that demonstrate deep interest and clinical ambition.' },
      { id: 15, title: 'Reading the Room & Adapting', duration: '10 min', completed: false, summary: 'Adjusting tone based on interviewer style—academic vs clinical focus.' },
      { id: 16, title: 'Ranking Programs After Interviews', duration: '15 min', completed: false, summary: 'Objective scoring matrices for gut feeling, geography, and career trajectory.' },
      { id: 17, title: 'Thank You Notes That Stand Out', duration: '8 min', completed: false, summary: 'Timing, personalized references, and post-interview communication etiquette.' }
    ]
  },
  {
    id: 5,
    title: 'Mock Interviews & Practice',
    lessons: [
      { id: 18, title: 'Full Mock Interview #1 - Internal Medicine', duration: '25 min', completed: false, summary: 'Watch a real IMG participate in a 25-minute mock interview with detailed faculty critique.' },
      { id: 19, title: 'Full Mock Interview #2 - Surgery', duration: '22 min', completed: false, summary: 'Surgical subspecialty mock interview breakdown and scoring.' },
      { id: 20, title: 'Analyzing Your Performance', duration: '10 min', completed: false, summary: 'Self-video analysis checklist for final interview week preparation.' }
    ]
  }
];

export default function InterviewCourse() {
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeResource, setActiveResource] = useState(null);

  const { user } = useAuth();

  const { data: purchases = [] } = useQuery({
    queryKey: ['purchases', user?.id],
    queryFn: async () => {
      let dbPurchases = [];
      if (user?.id) {
        try {
          const { data } = await supabase.from('purchased_content').select('*').eq('user_id', user?.id);
          if (data) dbPurchases = data;
        } catch (e) {
          console.warn('Failed to fetch from DB', e);
        }
      }
      let localPurchases = [];
      try {
        localPurchases = JSON.parse(localStorage.getItem('matchamd_purchased_content') || '[]');
      } catch (e) {}
      return [...dbPurchases, ...localPurchases];
    }
  });

  const hasPurchased = purchases.some(p => p.content_id === 'interview_premium');

  const totalLessons = courseModules.reduce((acc, module) => acc + module.lessons.length, 0);
  const completedLessons = 1;

  if (!hasPurchased) {
    return (
      <PremiumGate
        title="Interview Mastery Course"
        description="20+ comprehensive video lessons to ace your residency interviews"
        price={9.99}
        features={[
          '20+ video lessons (4+ hours)',
          'IMG-specific interview strategies',
          'Full mock interviews with analysis',
          'Practice questions for every scenario',
          'Downloadable cheat sheets & templates'
        ]}
        contentId="interview_premium"
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Interview Mastery" logo={logo} showBack />

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-[rgba(var(--color-primary),0.05)] to-[rgba(var(--color-secondary),0.1)] dark:from-[rgba(var(--color-primary),0.1)] dark:to-[rgba(var(--color-secondary),0.2)] border-[rgba(var(--color-primary),0.2)] dark:border-[rgba(var(--color-primary),0.4)]">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] flex items-center justify-center shadow-lg">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    Your Course Progress
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {completedLessons}/{totalLessons} lessons completed
                  </p>
                </div>
              </div>

              <Progress value={(completedLessons / totalLessons) * 100} className="h-3 mb-4" />

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center border border-white/40 dark:border-slate-700/40">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{courseModules.length}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Modules</p>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center border border-white/40 dark:border-slate-700/40">
                  <p className="text-2xl font-bold text-[rgb(var(--color-primary))]">4h+</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Video Content</p>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center border border-white/40 dark:border-slate-700/40">
                  <p className="text-2xl font-bold text-[rgb(var(--color-secondary))]">12m</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Time Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Modules */}
        <div className="space-y-6">
          {courseModules.map((module, idx) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(var(--color-primary),0.1)] dark:bg-[rgba(var(--color-primary),0.2)] flex items-center justify-center">
                      <span className="text-lg font-bold text-[rgb(var(--color-primary))]">
                        {module.id}
                      </span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {module.lessons.length} lessons
                      </p>
                    </div>
                    <Badge variant="outline">
                      {module.id === 1 ? '1' : '0'}/{module.lessons.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-[rgba(var(--color-primary),0.1)] dark:group-hover:bg-[rgba(var(--color-primary),0.2)] transition-colors">
                        {lesson.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <PlayCircle className="w-5 h-5 text-slate-400 group-hover:text-[rgb(var(--color-primary))] transition-colors" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-[rgb(var(--color-primary))] transition-colors">
                          {lesson.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {lesson.duration}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-xs text-[rgb(var(--color-primary))]">
                        Watch
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bonus Resources */}
        <Card className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Bonus Resources Included
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div 
              onClick={() => setActiveResource({ title: 'Interview Question Bank', desc: '50+ curated questions categorized by Behavioral, Clinical, and IMG-specific themes with full sample response frameworks.' })}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all cursor-pointer border border-transparent hover:border-amber-200"
            >
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  Interview Question Bank
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  50+ common questions with sample answers
                </p>
              </div>
            </div>
            <div 
              onClick={() => setActiveResource({ title: 'Interview Cheat Sheet', desc: 'A 2-page rapid summary guide with last-minute high-yield reminders for interview day morning.' })}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all cursor-pointer border border-transparent hover:border-amber-200"
            >
              <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  Interview Cheat Sheet
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Quick reference guide for interview day
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Lesson Video Player Modal */}
      <AnimatePresence>
        {activeLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <button
                onClick={() => setActiveLesson(null)}
                className="absolute top-5 right-5 z-10 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Simulated Video Screen */}
              <div className="relative aspect-video rounded-2xl bg-slate-950 flex items-center justify-center mb-6 overflow-hidden border border-slate-800 shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(var(--color-primary),0.2)] to-purple-900/30 opacity-70" />
                <div className="relative text-center p-6 z-10 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[rgb(var(--color-primary))] flex items-center justify-center shadow-2xl mb-3 cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-white ml-1 fill-white" />
                  </div>
                  <p className="text-white font-medium text-sm">Streaming HD Lesson ({activeLesson.duration})</p>
                  <p className="text-slate-400 text-xs mt-1">Interactive Video Stream Ready</p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {activeLesson.title}
              </h3>
              
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                {activeLesson.summary}
              </p>

              <div className="flex justify-between items-center">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40">
                  ✓ Unlocked Course Lesson
                </Badge>
                <Button onClick={() => setActiveLesson(null)} className="bg-[rgb(var(--color-primary))] text-white">
                  Close Lesson
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resource Modal */}
      <AnimatePresence>
        {activeResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-slate-200 dark:border-slate-800"
            >
              <button
                onClick={() => setActiveResource(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4 text-amber-600">
                <FileText className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {activeResource.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                {activeResource.desc}
              </p>

              <div className="flex gap-3">
                <Button onClick={() => setActiveResource(null)} variant="outline" className="flex-1">
                  Close
                </Button>
                <Button onClick={() => setActiveResource(null)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}