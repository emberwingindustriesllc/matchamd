import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Badge } from '@/components/ui/badge';
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
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Circle,
  Compass,
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
  const [highlightedSectionIndex, setHighlightedSectionIndex] = useState(null);
  const [expandedHowToId, setExpandedHowToId] = useState(null);
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

    // Merge saved progress status with latest rich guide checklist items
    const mergeChecklist = (savedItems = []) => {
      return (guide.checklist || []).map((baseItem) => {
        const saved = savedItems.find((s) => s.id === baseItem.id);
        return {
          ...baseItem,
          completed: !!saved?.completed,
        };
      });
    };

    if (progress?.checklist_items?.length) {
      setLocalChecklist(mergeChecklist(progress.checklist_items));
    } else {
      try {
        const savedChecklist = localStorage.getItem(`matchamd_checklist_${guideId}`);
        if (savedChecklist) {
          setLocalChecklist(mergeChecklist(JSON.parse(savedChecklist)));
        } else {
          setLocalChecklist(guide.checklist.map((item) => ({ ...item, completed: false })));
        }
      } catch (e) {
        setLocalChecklist(guide.checklist.map((item) => ({ ...item, completed: false })));
      }
    }

    try {
      const savedLocalNote = localStorage.getItem(`matchamd_notes_${guideId}`);
      if (progress?.notes) {
        setNotes(progress.notes);
      } else if (savedLocalNote) {
        setNotes(savedLocalNote);
      }
    } catch (e) {}
  }, [guide, progress, progressLoading, user?.id, guideId]);

  const updateProgressMutation = useMutation({
    mutationFn: async (dataToUpdate) => {
      if (!guide) throw new Error('Guide not found');
      if (!user?.id) return null;
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
    onError: (err) => console.warn('Supabase progress save note notice:', err?.message),
  });

  const handleSaveNotes = async () => {
    try {
      localStorage.setItem(`matchamd_notes_${guideId}`, notes);
      if (user?.id) {
        await updateProgressMutation.mutateAsync({ notes });
      }
      toast.success('Notes saved successfully!');
    } catch (err) {
      toast.success('Notes saved locally!');
    }
  };

  const toggleChecklistItem = (itemId, e) => {
    if (e) e.stopPropagation();
    if (!guide) return;
    if (!user?.id) {
      toast.error('Please log in to track progress across devices (saved locally)');
    }
    const newChecklist = localChecklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setLocalChecklist(newChecklist);

    try {
      localStorage.setItem(`matchamd_checklist_${guideId}`, JSON.stringify(newChecklist));
    } catch (err) {}

    const completedCount = newChecklist.filter((i) => i.completed).length;
    const total = newChecklist.length;
    const percentage = total ? Math.round((completedCount / total) * 100) : 0;
    const wasComplete = localChecklist.filter((i) => i.completed).length === total;

    if (percentage === 100 && !wasComplete) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    if (user?.id) {
      updateProgressMutation.mutate({
        checklist_items: newChecklist,
        completion_percentage: percentage,
        status: percentage === 100 ? 'completed' : percentage > 0 ? 'in_progress' : 'not_started',
      });
    }
  };

  const handleJumpToSection = (sectionIndex) => {
    if (sectionIndex === undefined || sectionIndex === null) {
      const overviewEl = document.getElementById('guide-overview');
      if (overviewEl) overviewEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const targetEl = document.getElementById(`guide-section-${sectionIndex}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedSectionIndex(sectionIndex);
      setTimeout(() => {
        setHighlightedSectionIndex(null);
      }, 3000);
    } else {
      const overviewEl = document.getElementById('guide-overview');
      if (overviewEl) overviewEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          {/* Header with Share Button */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Your Progress</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {completedCount} of {localChecklist.length} tasks completed ({progressPercentage}%)
              </p>
            </div>
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
            <div className="flex items-center justify-center gap-2 mt-4 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/40">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Due: {guide.deadline}</span>
            </div>
          )}
        </motion.div>

        {/* Interactive Actionable Checklist */}
        <Card className="p-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 dark:from-slate-900 dark:to-indigo-950/20 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Actionable Checklist & Guidance
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Click any task to jump to its detailed guide section or view step-by-step instructions.
              </p>
            </div>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-semibold">
              {completedCount}/{localChecklist.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {localChecklist.map((item, idx) => {
              const isExpanded = expandedHowToId === item.id;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`rounded-2xl border-2 transition-all overflow-hidden ${
                    item.completed
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  <div className="p-4 flex items-start gap-3">
                    {/* Checkbox Complete Toggle */}
                    <button
                      type="button"
                      onClick={(e) => toggleChecklistItem(item.id, e)}
                      aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                      className="mt-0.5 flex-shrink-0 transition-transform active:scale-90"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-400 hover:text-indigo-500" />
                      )}
                    </button>

                    {/* Task Title & Direct Jump */}
                    <div className="flex-1 min-w-0">
                      <div 
                        onClick={() => handleJumpToSection(item.sectionIndex)}
                        className="cursor-pointer group"
                      >
                        <span className={`font-semibold text-sm leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
                          item.completed 
                            ? 'text-emerald-800 dark:text-emerald-300 line-through opacity-85' 
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          {item.text}
                        </span>

                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {item.sectionIndex !== undefined && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium group-hover:underline">
                              <Compass className="w-3 h-3" />
                              Jump to Section {item.sectionIndex + 1}
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expandable Instructions / Actions Toggle */}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                        {item.howTo && (
                          <button
                            type="button"
                            onClick={() => setExpandedHowToId(isExpanded ? null : item.id)}
                            className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center gap-1 py-0.5"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                            {isExpanded ? 'Hide how-to' : 'How to do this?'}
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}

                        {/* Direct Action Trigger */}
                        {item.actionRoute && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(createPageUrl(item.actionRoute))}
                            className="h-6 px-2 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg ml-auto"
                          >
                            <Sparkles className="w-3 h-3 mr-1 text-indigo-500" />
                            {item.actionLabel || 'Go to Tool'}
                          </Button>
                        )}

                        {item.actionUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(item.actionUrl, '_blank')}
                            className="h-6 px-2 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg ml-auto"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {item.actionLabel || 'Open Portal'}
                          </Button>
                        )}
                      </div>

                      {/* How-To Accordion */}
                      <AnimatePresence>
                        {isExpanded && item.howTo && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2.5 p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed"
                          >
                            <p className="font-semibold text-[11px] text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-1">
                              Step-by-step guidance:
                            </p>
                            <p>{item.howTo}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Overview */}
        <Card id="guide-overview" className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            Overview
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{guide.overview}</p>
        </Card>

        {/* Detailed Sections with Jump Anchors & Glowing Highlight */}
        {guide.sections && guide.sections.length > 0 && (
          <div className="space-y-4">
            {guide.sections.map((sec, idx) => {
              const isHighlighted = highlightedSectionIndex === idx;

              return (
                <Card
                  key={idx}
                  id={`guide-section-${idx}`}
                  className={`p-5 rounded-2xl border transition-all duration-500 shadow-sm ${
                    isHighlighted
                      ? 'ring-4 ring-indigo-500/80 bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 shadow-xl scale-[1.01]'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                      <Zap className={`w-5 h-5 ${isHighlighted ? 'text-indigo-600 animate-bounce' : 'text-indigo-500'}`} />
                      {sec.title}
                    </h3>
                    {isHighlighted && (
                      <Badge className="bg-indigo-600 text-white text-[10px]">
                        Target Section
                      </Badge>
                    )}
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-line leading-relaxed space-y-2">
                    {sec.content}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* ECFMG-Specific Content */}
        {guideId === 'oet_medicine' && (
          <OETRequirements />
        )}

        {guideId === 'program_research' && (
          <Card className="p-4 rounded-2xl border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/20">
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Ready to find programs? Use MatchaMD's IMG-friendly directory with fit scoring.
            </p>
            <Button onClick={() => navigate(createPageUrl('IMGPrograms'))} className="rounded-xl w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Open Program Search & Fit Calculator
            </Button>
          </Card>
        )}

        {guideId === 'ecfmg_pathways' && (
          <>
            {/* Disclaimer */}
            <Card className="p-4 rounded-2xl border-2 border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/20">
              <p className="text-sm text-rose-800 dark:text-rose-300">
                ⚠️ <strong>DISCLAIMER:</strong> This information is for guidance only and may not reflect the latest updates. Always consult the official ECFMG website ({' '}
                <a href="https://www.ecfmg.org" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
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

        {/* FAQ Section */}
        {guide.faq && guide.faq.length > 0 && (
          <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-500" />
              Frequently Asked Questions (FAQ)
            </h3>
            <div className="space-y-3">
              {guide.faq.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-800 dark:text-white text-sm mb-1.5 flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">Q:</span>
                    <span>{item.question}</span>
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 pl-5 leading-relaxed whitespace-pre-line">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

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
            onClick={handleSaveNotes}
            className="mt-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
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