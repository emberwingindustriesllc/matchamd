import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import ResourceLink from '@/components/common/ResourceLink';
import ProgressMountain from '@/components/gamification/ProgressMountain';
import ProgressTree from '@/components/gamification/ProgressTree';
import ProgressRocket from '@/components/gamification/ProgressRocket';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  Check, 
  Clock, 
  ExternalLink, 
  BookOpen, 
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  FileText,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

const guideContent = {
  ecfmg_pathways: {
    title: 'ECFMG Certification Pathways',
    overview: 'The Educational Commission for Foreign Medical Graduates (ECFMG) certification is required for IMGs to enter US residency programs. In 2024, ECFMG introduced new pathways replacing ECFMG certification.',
    deadline: 'January 31, 2026',
    checklist: [
      { id: 1, text: 'Pass USMLE Step 1' },
      { id: 2, text: 'Pass USMLE Step 2 CK' },
      { id: 3, text: 'Pass OET Medicine (by Dec 2025)' },
      { id: 4, text: 'Complete one of the 6 Pathways' },
      { id: 5, text: 'Submit Pathways Application' },
      { id: 6, text: 'Receive ECFMG certification' }
    ],
    tips: [
      'Start preparing documents early - verification takes time',
      'Check if your medical school is in the World Directory',
      'Pathway 1 is most common for practicing physicians',
      'Keep all documents in both physical and digital copies'
    ],
    resources: [
      { title: 'ECFMG Official Website', url: 'https://www.ecfmg.org', type: 'website' },
      { title: 'Pathways Requirements', url: 'https://www.ecfmg.org/certification-pathways', type: 'document' },
      { title: 'OET Medicine', url: 'https://www.occupationalenglishtest.org', type: 'website' }
    ]
  },
  usmle_step1: {
    title: 'USMLE Step 1',
    overview: 'Step 1 assesses whether you understand and can apply important concepts of the basic sciences to the practice of medicine. Now reported as Pass/Fail.',
    checklist: [
      { id: 1, text: 'Create USMLE account' },
      { id: 2, text: 'Get ECFMG ID' },
      { id: 3, text: 'Complete study resources (First Aid, UWorld, Pathoma)' },
      { id: 4, text: 'Take practice exams (NBME, UWorld Self-Assessments)' },
      { id: 5, text: 'Schedule exam date' },
      { id: 6, text: 'Pass Step 1' }
    ],
    tips: [
      'Dedicated study period of 2-3 months recommended',
      'First Aid + UWorld is the gold standard combo',
      'Practice with timed blocks to build stamina',
      'Join study groups for accountability'
    ],
    resources: [
      { title: 'USMLE Official', url: 'https://www.usmle.org', type: 'website' },
      { title: 'First Aid Book', url: 'https://www.firstaidteam.com', type: 'document' },
      { title: 'UWorld Qbank', url: 'https://www.uworld.com', type: 'website' }
    ]
  },
  clinical_experience: {
    title: 'US Clinical Experience',
    overview: 'US Clinical Experience (USCE) is crucial for competitive specialties like Surgery. It demonstrates your ability to work in the US healthcare system and provides valuable letters of recommendation.',
    checklist: [
      { id: 1, text: 'Research observership vs externship programs' },
      { id: 2, text: 'Apply to multiple programs (start 6-12 months early)' },
      { id: 3, text: 'Secure at least 2-3 rotations in your specialty' },
      { id: 4, text: 'Focus on programs that write strong LORs' },
      { id: 5, text: 'Network with attending physicians' },
      { id: 6, text: 'Document all experiences for ERAS' }
    ],
    tips: [
      'FOR SURGERY: Aim for at least one rotation at a university program',
      'Hands-on externships are valued more than observerships',
      'Target programs in your desired geographic location',
      'Be proactive - volunteer for cases and research opportunities',
      'Ask for letters from program directors or division chiefs'
    ],
    resources: [
      { title: 'AMOpportunities', url: 'https://www.amopportunities.org', type: 'website' },
      { title: 'VSLO (AAMC)', url: 'https://students-residents.aamc.org/vslo', type: 'website' },
      { title: 'IMG Clinical Experience Guide', url: 'https://www.ama-assn.org/education/international-medical-education', type: 'document' }
    ]
  },
  research: {
    title: 'Research Experience',
    overview: 'Research experience is especially important for competitive specialties like Surgery. Publications and presentations strengthen your application significantly.',
    checklist: [
      { id: 1, text: 'Identify research opportunities in your target specialty' },
      { id: 2, text: 'Join research projects remotely if needed' },
      { id: 3, text: 'Aim for at least 1-2 publications' },
      { id: 4, text: 'Present at conferences if possible' },
      { id: 5, text: 'List all research on ERAS with proper citations' }
    ],
    tips: [
      'FOR SURGERY: Research is highly valued - aim for surgical outcomes or education research',
      'Quality over quantity - one first-author paper is better than multiple abstracts',
      'Network with researchers at programs you want to match at',
      'Case reports and systematic reviews are good starting points',
      'Join surgical societies (e.g., SAGES, ACS) for networking'
    ],
    resources: [
      { title: 'Research Match', url: 'https://www.researchmatch.org', type: 'website' },
      { title: 'ACS Research Resources', url: 'https://www.facs.org', type: 'website' },
      { title: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov', type: 'website' }
    ]
  },
  usmle_step2: {
    title: 'USMLE Step 2 CK',
    overview: 'Step 2 CK assesses clinical knowledge through multiple-choice questions. A high score is crucial for competitive specialties.',
    checklist: [
      { id: 1, text: 'Complete Step 2 CK study resources' },
      { id: 2, text: 'Master clinical algorithms' },
      { id: 3, text: 'Complete UWorld Step 2' },
      { id: 4, text: 'Take self-assessments' },
      { id: 5, text: 'Schedule and pass exam' }
    ],
    tips: [
      'Many find Step 2 easier than Step 1',
      'Clinical rotations help significantly',
      'Focus on IM, Surgery, OB, Peds, Psych',
      'Aim for the highest score possible - it matters!'
    ],
    resources: [
      { title: 'USMLE Step 2 CK', url: 'https://www.usmle.org/step-2-ck', type: 'website' },
      { title: 'UWorld Step 2', url: 'https://www.uworld.com', type: 'website' },
      { title: 'Amboss', url: 'https://www.amboss.com', type: 'website' }
    ]
  },
  eras_registration: {
    title: 'ERAS Application',
    overview: 'The Electronic Residency Application Service (ERAS) is the centralized application system for residency programs. Your application opens to programs in September.',
    deadline: 'September 2025',
    checklist: [
      { id: 1, text: 'Create ERAS account through ECFMG' },
      { id: 2, text: 'Complete MyERAS application' },
      { id: 3, text: 'Upload personal statement' },
      { id: 4, text: 'Request letters of recommendation' },
      { id: 5, text: 'Upload USMLE transcript' },
      { id: 6, text: 'Certify and submit application' },
      { id: 7, text: 'Assign programs to documents' }
    ],
    tips: [
      'Apply broadly - 100+ programs for competitive specialties',
      'Apply early on September 3rd when applications open',
      'Have 3-4 strong letters of recommendation',
      'Research IMG-friendly programs'
    ],
    resources: [
      { title: 'ERAS for IMGs', url: 'https://students-residents.aamc.org/eras', type: 'website' },
      { title: 'Residency Explorer', url: 'https://www.residencyexplorer.org', type: 'website' },
      { title: 'FREIDA', url: 'https://freida.ama-assn.org', type: 'website' }
    ]
  },
  nrmp_match: {
    title: 'NRMP Match',
    overview: 'The National Resident Matching Program pairs applicants with residency programs through a computerized algorithm based on ranked lists.',
    deadline: 'March 2026',
    checklist: [
      { id: 1, text: 'Register for NRMP Main Match' },
      { id: 2, text: 'Complete interview season' },
      { id: 3, text: 'Create rank order list' },
      { id: 4, text: 'Certify rank list by deadline' },
      { id: 5, text: 'Match Day!' }
    ],
    tips: [
      'Rank programs by your TRUE preference order',
      'The algorithm favors applicants - be honest',
      'Have a SOAP backup plan',
      'Join Match support groups for the wait'
    ],
    resources: [
      { title: 'NRMP Official', url: 'https://www.nrmp.org', type: 'website' },
      { title: 'Match Timeline', url: 'https://www.nrmp.org/match-process', type: 'document' },
      { title: 'Charting Outcomes', url: 'https://www.nrmp.org/main-residency-match-data', type: 'document' }
    ]
  }
};

export default function GuideDetail() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const guideId = urlParams.get('id') || 'ecfmg_pathways';
  const pathway = urlParams.get('pathway') || 'residency';
  
  const [notes, setNotes] = useState('');
  const [visualMode, setVisualMode] = useState('mountain'); // 'mountain', 'tree', 'rocket'
  
  const guide = guideContent[guideId] || guideContent.ecfmg_pathways;

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: progressList = [] } = useQuery({
    queryKey: ['progress', guideId],
    queryFn: () => base44.entities.Progress.filter({ user_id: user?.id, module_id: guideId }),
    enabled: !!user?.id
  });

  const progress = progressList[0];
  const [localChecklist, setLocalChecklist] = useState(
    progress?.checklist_items || guide.checklist.map(item => ({ ...item, completed: false }))
  );

  const updateProgressMutation = useMutation({
    mutationFn: async (data) => {
      if (progress) {
        return base44.entities.Progress.update(progress.id, data);
      } else {
        return base44.entities.Progress.create({
          user_id: user.id,
          pathway,
          module_id: guideId,
          module_name: guide.title,
          ...data
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['progress'] })
  });

  const toggleChecklistItem = (itemId) => {
    const newChecklist = localChecklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setLocalChecklist(newChecklist);
    
    const completedCount = newChecklist.filter(i => i.completed).length;
    const total = newChecklist.length;
    const percentage = Math.round((completedCount / total) * 100);
    const wasComplete = localChecklist.filter(i => i.completed).length === total;
    
    // Celebration for completion
    if (percentage === 100 && !wasComplete) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    
    updateProgressMutation.mutate({
      checklist_items: newChecklist,
      completion_percentage: percentage,
      status: percentage === 100 ? 'completed' : percentage > 0 ? 'in_progress' : 'not_started'
    });
  };

  const completedCount = localChecklist.filter(i => i.completed).length;
  const progressPercentage = Math.round((completedCount / localChecklist.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header title={guide.title} showBack />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Visual Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
        >
          {/* Mode Selector */}
          <div className="flex gap-2 mb-4 justify-center">
            <Button
              variant={visualMode === 'mountain' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisualMode('mountain')}
              className="rounded-xl"
            >
              🏔️ Mountain
            </Button>
            <Button
              variant={visualMode === 'tree' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisualMode('tree')}
              className="rounded-xl"
            >
              🌳 Tree
            </Button>
            <Button
              variant={visualMode === 'rocket' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisualMode('rocket')}
              className="rounded-xl"
            >
              🚀 Rocket
            </Button>
          </div>

          {/* Visual Display */}
          {visualMode === 'mountain' && (
            <ProgressMountain completedCount={completedCount} totalCount={localChecklist.length} />
          )}
          {visualMode === 'tree' && (
            <ProgressTree completedCount={completedCount} totalCount={localChecklist.length} />
          )}
          {visualMode === 'rocket' && (
            <ProgressRocket completedCount={completedCount} totalCount={localChecklist.length} />
          )}

          {/* Deadline */}
          {guide.deadline && (
            <div className="flex items-center justify-center gap-2 mt-4 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Due: {guide.deadline}</span>
            </div>
          )}
        </motion.div>

        {/* Overview */}
        <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            Overview
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{guide.overview}</p>
        </Card>

        {/* Checklist */}
        <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-500" />
            Checklist
          </h3>
          <div className="space-y-3">
            {localChecklist.map((item, idx) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => toggleChecklistItem(item.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all relative overflow-hidden ${
                  item.completed
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-300 dark:border-emerald-700'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                } border-2`}
              >
                {item.completed && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute top-2 right-2"
                  >
                    <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </motion.div>
                )}
                <Checkbox checked={item.completed} className="pointer-events-none" />
                <span className={`flex-1 text-left font-medium ${
                  item.completed 
                    ? 'text-emerald-700 dark:text-emerald-400' 
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {item.text}
                </span>
                {item.completed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-2xl"
                  >
                    ✨
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </Card>

        {/* Tips */}
        <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Pro Tips
          </h3>
          <div className="space-y-3">
            {guide.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 dark:text-slate-300">{tip}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Resources */}
        <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-blue-500" />
            Official Resources
          </h3>
          <div className="space-y-3">
            {guide.resources.map((resource, idx) => (
              <ResourceLink key={idx} {...resource} />
            ))}
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Your Notes</h3>
          <Textarea
            placeholder="Add your personal notes for this step..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px] rounded-xl"
          />
          <Button 
            onClick={() => updateProgressMutation.mutate({ notes })}
            className="mt-3 rounded-xl"
          >
            Save Notes
          </Button>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}