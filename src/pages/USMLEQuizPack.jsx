import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  CheckCircle2,
  XCircle,
  ChevronRight,
  Brain,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import PremiumGate from '@/components/premium/PremiumGate';

const quizCategories = [
  {
    id: 'step1_anatomy',
    title: 'Step 1: Anatomy',
    questions: 75,
    difficulty: 'Medium',
    timeEstimate: '90 min'
  },
  {
    id: 'step1_physiology',
    title: 'Step 1: Physiology',
    questions: 100,
    difficulty: 'Hard',
    timeEstimate: '120 min'
  },
  {
    id: 'step1_pathology',
    title: 'Step 1: Pathology',
    questions: 125,
    difficulty: 'Hard',
    timeEstimate: '150 min'
  },
  {
    id: 'step2_internal_medicine',
    title: 'Step 2 CK: Internal Medicine',
    questions: 150,
    difficulty: 'Hard',
    timeEstimate: '180 min'
  },
  {
    id: 'step2_surgery',
    title: 'Step 2 CK: Surgery',
    questions: 100,
    difficulty: 'Medium',
    timeEstimate: '120 min'
  },
  {
    id: 'step2_pediatrics',
    title: 'Step 2 CK: Pediatrics',
    questions: 80,
    difficulty: 'Medium',
    timeEstimate: '100 min'
  },
  {
    id: 'step2_obgyn',
    title: 'Step 2 CK: OB/GYN',
    questions: 60,
    difficulty: 'Medium',
    timeEstimate: '75 min'
  },
  {
    id: 'step2_psychiatry',
    title: 'Step 2 CK: Psychiatry',
    questions: 50,
    difficulty: 'Easy',
    timeEstimate: '60 min'
  }
];

export default function USMLEQuizPack() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ['purchases', user?.id],
    queryFn: () => base44.entities.PurchasedContent.filter({ user_id: user?.id }),
    enabled: !!user?.id
  });

  const hasPurchased = purchases.some(p => p.content_id === 'quiz_usmle');

  const difficultyColors = {
    Easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };

  if (!hasPurchased) {
    return (
      <PremiumGate
        title="USMLE Quiz Pack"
        description="Access 500+ high-yield USMLE practice questions for Step 1 & 2 CK"
        price={4.99}
        features={[
          'Detailed explanations for every question',
          'Track your performance by category',
          'Timed practice mode',
          'Bookmark difficult questions',
          'Based on real exam patterns'
        ]}
        contentId="quiz_usmle"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header title="USMLE Quiz Pack" showBack />

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    Your Progress
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    500+ practice questions available
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Completed</p>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">0%</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Accuracy</p>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quiz Categories */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Practice by Category</h3>
          
          {quizCategories.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {category.title}
                        </h4>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {category.questions} questions
                        </Badge>
                        <Badge className={difficultyColors[category.difficulty]}>
                          {category.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {category.timeEstimate}
                        </Badge>
                      </div>

                      <Progress value={0} className="h-2" />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        0/{category.questions} completed
                      </p>
                    </div>

                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      Start
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Study Tips */}
        <Card className="mt-8 bg-slate-50 dark:bg-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-amber-500" />
              Study Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>• Take quizzes in timed mode to simulate exam conditions</p>
            <p>• Review explanations even for correct answers</p>
            <p>• Focus on weak areas identified by your performance</p>
            <p>• Aim for 80%+ accuracy before moving to next category</p>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}