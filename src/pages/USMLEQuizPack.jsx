import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock,
  ChevronRight,
  Brain,
  Award,
  CheckCircle,
  XCircle,
  RotateCcw,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumGate from '@/components/premium/PremiumGate';

const sampleQuestions = {
  step1_anatomy: [
    {
      id: 1,
      question: "A 45-year-old male presents with severe hoarseness after a total thyroidectomy. Laryngoscopy reveals a fixed vocal cord in the paramedian position. Which nerve was most likely injured during surgery?",
      options: [
        "Superior laryngeal nerve (internal branch)",
        "Superior laryngeal nerve (external branch)",
        "Recurrent laryngeal nerve",
        "Glossopharyngeal nerve"
      ],
      correct: 2,
      explanation: "The recurrent laryngeal nerve innervates all intrinsic muscles of the larynx except the cricothyroid muscle. Injury during thyroid surgery leads to vocal cord paralysis and hoarseness."
    },
    {
      id: 2,
      question: "A 28-year-old motorcyclist suffers a knee injury. Physical examination shows anterior displacement of the tibia relative to the femur when the knee is flexed at 90 degrees (positive anterior drawer test). Which structure is torn?",
      options: [
        "Posterior cruciate ligament (PCL)",
        "Anterior cruciate ligament (ACL)",
        "Medial collateral ligament (MCL)",
        "Lateral meniscus"
      ],
      correct: 1,
      explanation: "The anterior cruciate ligament (ACL) prevents anterior translation of the tibia on the femur. A positive anterior drawer or Lachman test confirms an ACL tear."
    }
  ],
  default: [
    {
      id: 101,
      question: "A 55-year-old woman presents with classic crushing chest pressure radiating to her left jaw. ECG shows ST-elevation in leads II, III, and aVF. Which coronary artery is most likely occluded?",
      options: [
        "Left anterior descending artery (LAD)",
        "Right coronary artery (RCA)",
        "Left circumflex artery (LCx)",
        "Left main coronary artery"
      ],
      correct: 1,
      explanation: "Inferior wall myocardial infarction (ST elevation in II, III, aVF) is most commonly caused by occlusion of the Right Coronary Artery (RCA)."
    }
  ]
};

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
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

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

  const hasPurchased = purchases.some(p => p.content_id === 'quiz_usmle');

  const difficultyColors = {
    Easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };

  const startQuiz = (category) => {
    setActiveCategory(category);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
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

  const activeQuestions = activeCategory ? (sampleQuestions[activeCategory.id] || sampleQuestions.default) : [];
  const currentQ = activeQuestions[currentQIndex];

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
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{score}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Questions Answered</p>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">100%</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Accuracy</p>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</p>
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
              <Card 
                onClick={() => startQuiz(category)}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
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

                      <Progress value={category.id === 'step1_anatomy' && score > 0 ? 50 : 0} className="h-2" />
                    </div>

                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      Start Quiz
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Quiz Modal */}
      <AnimatePresence>
        {activeCategory && currentQ && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto relative border border-slate-200 dark:border-slate-800"
            >
              <button
                onClick={() => setActiveCategory(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200">
                  {activeCategory.title}
                </Badge>
                <span className="text-xs text-slate-500">Question {currentQIndex + 1} of {activeQuestions.length}</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 leading-relaxed">
                {currentQ.question}
              </h3>

              <div className="space-y-3 mb-6">
                {currentQ.options.map((opt, oIdx) => {
                  let btnStyle = "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700";
                  if (isSubmitted) {
                    if (oIdx === currentQ.correct) {
                      btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-semibold";
                    } else if (selectedOption === oIdx) {
                      btnStyle = "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300";
                    }
                  } else if (selectedOption === oIdx) {
                    btnStyle = "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200 font-semibold";
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={isSubmitted}
                      onClick={() => setSelectedOption(oIdx)}
                      className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${btnStyle}`}
                    >
                      <span className="text-sm">{opt}</span>
                      {isSubmitted && oIdx === currentQ.correct && <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                      {isSubmitted && selectedOption === oIdx && oIdx !== currentQ.correct && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 mb-6"
                >
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm mb-1">Explanation:</h4>
                  <p className="text-xs text-indigo-800 dark:text-indigo-200 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </motion.div>
              )}

              <div className="flex justify-end gap-3">
                {!isSubmitted ? (
                  <Button
                    disabled={selectedOption === null}
                    onClick={() => {
                      setIsSubmitted(true);
                      setScore(s => s + 1);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  currentQIndex < activeQuestions.length - 1 ? (
                    <Button
                      onClick={() => {
                        setCurrentQIndex(i => i + 1);
                        setSelectedOption(null);
                        setIsSubmitted(false);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Next Question
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setActiveCategory(null)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Finish Quiz
                    </Button>
                  )
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}