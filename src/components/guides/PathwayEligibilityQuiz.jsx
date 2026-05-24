import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, HelpCircle, Sparkles } from 'lucide-react';

export default function PathwayEligibilityQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      id: 'license',
      question: 'Do you hold (or recently held) an unsupervised medical license from any country (active on/after Jan 1, 2021)?',
      options: [
        { value: 'yes', label: 'Yes, I have an unsupervised license' },
        { value: 'supervised', label: 'I have a supervised/training license only' },
        { value: 'no', label: 'No license' }
      ],
      pathways: { 'yes': [1] }
    },
    {
      id: 'clinical_exam',
      question: 'Have you passed a standardized clinical skills exam for medical licensure (e.g., PLAB 2, AMC CAT, MCCQE Part II)?',
      options: [
        { value: 'yes', label: 'Yes, for licensure' },
        { value: 'graduation', label: 'Yes, but only for graduation' },
        { value: 'no', label: 'No' }
      ],
      pathways: { 'yes': [2] }
    },
    {
      id: 'wfme',
      question: 'Is your medical school accredited by a WFME-recognized agency?',
      options: [
        { value: 'yes', label: 'Yes, WFME accredited' },
        { value: 'not_sure', label: 'Not sure' },
        { value: 'no', label: 'No' }
      ],
      pathways: { 'yes': [3], 'not_sure': [3] }
    },
    {
      id: 'joint_program',
      question: 'Did you receive a joint MD/DO degree with a US medical school (LCME/COCA accredited)?',
      options: [
        { value: 'yes', label: 'Yes, joint degree program' },
        { value: 'no', label: 'No' }
      ],
      pathways: { 'yes': [5] }
    },
    {
      id: 'step2cs',
      question: 'Did you previously fail USMLE Step 2 CS (before it was discontinued)?',
      options: [
        { value: 'yes', label: 'Yes, failed Step 2 CS' },
        { value: 'no', label: 'No or never took it' }
      ],
      pathways: { 'yes': [6] }
    }
  ];

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const getEligiblePathways = () => {
    const eligible = new Set();
    
    questions.forEach((q) => {
      const answer = answers[q.id];
      if (q.pathways[answer]) {
        q.pathways[answer].forEach(p => eligible.add(p));
      }
    });

    // Pathway 6 is always available as fallback
    if (eligible.size === 0 || answers.step2cs === 'yes') {
      eligible.add(6);
    }

    return Array.from(eligible).sort();
  };

  const reset = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  if (showResults) {
    const eligiblePathways = getEligiblePathways();

    return (
      <Card className="p-6 rounded-2xl border-2 border-indigo-300 dark:border-indigo-700 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-center mb-6">
            <Sparkles className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Your Eligible Pathways
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Based on your answers, you may qualify for:
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {eligiblePathways.map((pathway) => (
              <div key={pathway} className="bg-white dark:bg-slate-800 rounded-xl p-4 border-2 border-emerald-300 dark:border-emerald-700">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-white">
                      Pathway {pathway}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {pathway === 1 && 'Medical License/Registration'}
                      {pathway === 2 && 'Clinical Skills Exam'}
                      {pathway === 3 && 'WFME-Accredited School'}
                      {pathway === 4 && 'NCFMEA-Comparable Accreditation'}
                      {pathway === 5 && 'Joint MD/DO Program'}
                      {pathway === 6 && 'Mini-CEX Assessments (Fallback)'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-4 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              ⚠️ <strong>Note:</strong> This is a preliminary assessment only. Verify your eligibility with official ECFMG documentation and consult the detailed requirements for each pathway.
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={reset} className="flex-1 rounded-xl" variant="outline">
              Retake Quiz
            </Button>
            <Button asChild className="flex-1 rounded-xl">
              <a href="https://www.ecfmg.org/certification-pathways" target="_blank" rel="noopener noreferrer">
                View Official Requirements
              </a>
            </Button>
          </div>
        </motion.div>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Card className="p-6 rounded-2xl border-2 border-indigo-300 dark:border-indigo-700">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">Question {currentQuestion + 1} of {questions.length}</Badge>
          <HelpCircle className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
        {question.question}
      </h3>

      <div className="space-y-3">
        {question.options.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => handleAnswer(option.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 text-left bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-400 rounded-xl transition-all"
          >
            <span className="font-medium text-slate-800 dark:text-white">
              {option.label}
            </span>
          </motion.button>
        ))}
      </div>

      {currentQuestion > 0 && (
        <Button 
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
          variant="ghost"
          className="mt-4 rounded-xl"
        >
          ← Previous Question
        </Button>
      )}
    </Card>
  );
}