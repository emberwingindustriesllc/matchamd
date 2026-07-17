import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import ResourceLink from '@/components/common/ResourceLink';
import ProgressMountain from '@/components/gamification/ProgressMountain';
import ProgressTree from '@/components/gamification/ProgressTree';
import ProgressRocket from '@/components/gamification/ProgressRocket';
import ShareMilestone from '@/components/gamification/ShareMilestone';
import PathwayBreakdown from '@/components/guides/PathwayBreakdown';
import OETRequirements from '@/components/guides/OETRequirements';
import ApplicationTimeline from '@/components/guides/ApplicationTimeline';
import PathwayEligibilityQuiz from '@/components/guides/PathwayEligibilityQuiz';
import PathwayTimeline from '@/components/guides/PathwayTimeline';
import OfficialReferences from '@/components/guides/OfficialReferences';
import MatchProcessFlowchart from '@/components/guides/MatchProcessFlowchart';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import PathwayEligibilityChat from '@/components/ai/PathwayEligibilityChat';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Check,
  Clock,
  ExternalLink,
  AlertCircle,
  Lightbulb,
  FileText,
  Zap,
  Share2,
  HelpCircle,
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getGuideContent } from '@/data/guideContent';
import { normalizePathwayKey } from '@/data/pathways';

export default function GuideDetail() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const guideId = urlParams.get('id') || 'ecfmg_pathways';
  const pathway = normalizePathwayKey(urlParams.get('pathway') || 'residency');

  const [notes, setNotes] = useState('');
  const [visualMode, setVisualMode] = useState('mountain');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [localChecklist, setLocalChecklist] = useState([]);
  const visualRef = React.useRef(null);

  const guide = getGuideContent(guideId);
  const { user } = useAuth();

  const { data: progressList = [], isLoading: progressLoading } = useQuery({
    queryKey: ['progress', guideId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user?.id)
        .eq('module_id', guideId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!guide,
  });

  const progress = progressList[0];

  useEffect(() => {
    if (!guide) return;
    if (user?.id && progressLoading) return;

    if (progress?.checklist_items?.length) {
      setLocalChecklist(progress.checklist_items);
    } else {
      setLocalChecklist(guide.checklist.map((item) => ({ ...item, completed: false })));
    }
    setNotes(progress?.notes || '');
  }, [guide, progress, progressLoading, user?.id, guideId]);

  const updateProgressMutation = useMutation({
    mutationFn: async (dataToUpdate) => {
      if (!user?.id) throw new Error('Please log in to save progress');
      if (!guide) throw new Error('Guide not found');
      if (progress) {
        const { data, error } = await supabase
          .from('progress')
          .update(dataToUpdate)
          .eq('id', progress.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from('progress')
        .insert({
          user_id: user.id,
          pathway,
          module_id: guideId,
          module_name: guide.title,
          ...dataToUpdate,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['progress'] }),
    onError: (err) => toast.error(err?.message || 'Failed to save progress'),
  });

  const toggleChecklistItem = (itemId) => {
    if (!guide) return;
    if (!user?.id) {
      toast.error('Please log in to track progress');
      return;
    }
    const newChecklist = localChecklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setLocalChecklist(newChecklist);

    const completedCount = newChecklist.filter((i) => i.completed).length;
    const total = newChecklist.length;
    const percentage = total ? Math.round((completedCount / total) * 100) : 0;
    const wasComplete = localChecklist.filter((i) => i.completed).length === total;

    if (percentage === 100 && !wasComplete) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    updateProgressMutation.mutate({
      checklist_items: newChecklist,
      completion_percentage: percentage,
      status: percentage === 100 ? 'completed' : percentage > 0 ? 'in_progress' : 'not_started',
    });
  };

  if (!guide) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
        <Header title="Guide not found" showBack />
        <main className="px-4 py-12 max-w-lg mx-auto text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Guide not found</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            We could not find a guide for <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">{guideId}</code>.
          </p>
          <Button onClick={() => navigate(createPageUrl('Guides'))} className="rounded-xl">
            Back to Guides
          </Button>
        </main>
        <BottomNav />
      </div>
    );
  }

  const completedCount = localChecklist.filter((i) => i.completed).length;
  const progressPercentage = localChecklist.length
    ? Math.round((completedCount / localChecklist.length) * 100)
    : 0;

  const breadcrumbItems = [
    { label: 'Guides', href: createPageUrl('Guides') },
    { label: guide.title },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header title={guide.title} showBack />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        {/* Visual Progress */}
        <motion.div
          ref={visualRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
        >
          {/* Header with Share Button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Your Progress</h2>
            <Button
              onClick={() => setShowShareDialog(true)}
              size="sm"
              variant="outline"
              className="rounded-xl"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>

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

        {/* ECFMG-Specific Content */}
        {guideId === 'oet_medicine' && (
          <OETRequirements />
        )}

        {guideId === 'program_research' && (
          <Card className="p-4 rounded-2xl border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/20">
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Ready to find programs? Use MatchaMD's IMG-friendly directory with fit scoring.
            </p>
            <Button onClick={() => navigate(createPageUrl('IMGPrograms'))} className="rounded-xl w-full">
              Open program search
            </Button>
          </Card>
        )}

        {guideId === 'ecfmg_pathways' && (
          <>
            {/* Disclaimer */}
            <Card className="p-4 rounded-2xl border-2 border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/20">
              <p className="text-sm text-rose-800 dark:text-rose-300">
                ⚠️ <strong>DISCLAIMER:</strong> This information is for guidance only and may not reflect the latest updates. Always consult the official ECFMG website ({' '}
                <a href="https://www.ecfmg.org" target="_blank" rel="noopener noreferrer" className="underline">
                  ecfmg.org
                </a>
                ) for authoritative and current requirements. ECFMG certification requires BOTH passing USMLE exams AND completing a pathway.
              </p>
            </Card>

            {/* OET Requirements */}
            <OETRequirements />

            {/* Application Timeline */}
            <ApplicationTimeline />

            {/* Visual Process Timeline */}
            <PathwayTimeline pathway={pathway} />

            {/* Match Process Flowchart */}
            <MatchProcessFlowchart />

            {/* AI Pathway Assistant */}
            <PathwayEligibilityChat userProfile={user} />

            {/* Eligibility Quiz */}
            <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                Am I Eligible? Quick Assessment
              </h3>
              <PathwayEligibilityQuiz />
            </Card>

            {/* Pathway Breakdown */}
            <PathwayBreakdown />

            {/* Official References & Citations */}
            <OfficialReferences />
          </>
        )}

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

      <ShareMilestone
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        guideTitle={guide.title}
        completionPercentage={progressPercentage}
        visualRef={visualRef}
      />

      <BottomNav />
    </div>
  );
}