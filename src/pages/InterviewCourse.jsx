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
import { 
  Video,
  CheckCircle2,
  PlayCircle,
  Lightbulb,
  FileText,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import PremiumGate from '@/components/premium/PremiumGate';

const courseModules = [
  {
    id: 1,
    title: 'Interview Fundamentals',
    lessons: [
      { id: 1, title: 'What Program Directors Look For', duration: '8 min', completed: false },
      { id: 2, title: 'Virtual vs In-Person Interviews', duration: '6 min', completed: false },
      { id: 3, title: 'First Impressions & Body Language', duration: '10 min', completed: false },
      { id: 4, title: 'Structuring Your Answers (STAR Method)', duration: '12 min', completed: false }
    ]
  },
  {
    id: 2,
    title: 'Common Interview Questions',
    lessons: [
      { id: 5, title: '"Tell Me About Yourself" - Perfect Answer', duration: '15 min', completed: false },
      { id: 6, title: '"Why Our Program?" Research Strategies', duration: '10 min', completed: false },
      { id: 7, title: '"Why This Specialty?" Compelling Narratives', duration: '12 min', completed: false },
      { id: 8, title: 'Handling Weakness Questions', duration: '10 min', completed: false },
      { id: 9, title: 'Discussing Gap Years & Challenges', duration: '14 min', completed: false }
    ]
  },
  {
    id: 3,
    title: 'IMG-Specific Challenges',
    lessons: [
      { id: 10, title: 'Addressing Visa Status Confidently', duration: '8 min', completed: false },
      { id: 11, title: 'Explaining Multiple Step Attempts', duration: '10 min', completed: false },
      { id: 12, title: 'Showcasing International Experience', duration: '9 min', completed: false },
      { id: 13, title: 'Cultural Differences & Communication', duration: '11 min', completed: false }
    ]
  },
  {
    id: 4,
    title: 'Advanced Techniques',
    lessons: [
      { id: 14, title: 'Asking Smart Questions to Interviewers', duration: '12 min', completed: false },
      { id: 15, title: 'Reading the Room & Adapting', duration: '10 min', completed: false },
      { id: 16, title: 'Ranking Programs After Interviews', duration: '15 min', completed: false },
      { id: 17, title: 'Thank You Notes That Stand Out', duration: '8 min', completed: false }
    ]
  },
  {
    id: 5,
    title: 'Mock Interviews & Practice',
    lessons: [
      { id: 18, title: 'Full Mock Interview #1 - Internal Medicine', duration: '25 min', completed: false },
      { id: 19, title: 'Full Mock Interview #2 - Surgery', duration: '22 min', completed: false },
      { id: 20, title: 'Analyzing Your Performance', duration: '10 min', completed: false }
    ]
  }
];

/**
 * Interview Mastery Course Component
 */
export default function InterviewCourse() {
  const [selectedLesson, setSelectedLesson] = useState(null);

  const { user } = useAuth();

  const { data: purchases = [] } = useQuery({
    queryKey: ['purchases', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('purchased_content').select('*').eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const hasPurchased = purchases.some(p => p.content_id === 'interview_premium');

  const totalLessons = courseModules.reduce((acc, module) => acc + module.lessons.length, 0);
  const completedLessons = 0; // Will track progress later

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
                  <p className="text-2xl font-bold text-[rgb(var(--color-secondary))]">0h</p>
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
                      0/{module.lessons.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
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
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {lesson.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {lesson.duration}
                        </p>
                      </div>
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
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-1" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">
                  Interview Question Bank
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  50+ common questions with sample answers
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-1" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">
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

      <BottomNav />
    </div>
  );
}