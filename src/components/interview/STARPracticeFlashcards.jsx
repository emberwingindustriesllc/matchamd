import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  CheckCircle2, 
  BookOpen, 
  Save, 
  Download, 
  Eye, 
  HelpCircle,
  Lightbulb,
  FileText,
  Copy
} from 'lucide-react';

export const STAR_QUESTIONS = [
  {
    id: 'q1',
    category: 'Clinical Conflict & Teamwork',
    question: 'Tell me about a time you had a disagreement with a senior resident, attending, or nurse. How did you resolve it?',
    whyTheyAsk: 'Program directors want to see professional maturity, patient-first priorities, and non-defensive communication skills.',
    starFramework: {
      situation: 'Describe a specific clinical scenario (e.g. dosing question, discharge plan timing, or differing clinical impressions).',
      task: 'Your goal was to advocate for patient safety while maintaining team trust and respect.',
      action: 'You addressed the concern privately, cited evidence/hospital guidelines calmly, and asked clarifying questions.',
      result: 'The patient received optimal care, communication improved, and professional relationship was strengthened.'
    },
    sampleAnswerSnippet: '"During my inpatient cardiology rotation, an order for a beta-blocker was written for a patient with acute decompensated heart failure and bradycardia. Rather than confront the resident publicly, I pulled them aside with the telemetry strip, asked if they wanted to review the vitals together, and we safely held the dose until the attending arrived."'
  },
  {
    id: 'q2',
    category: 'Medical Error & Accountability',
    question: 'Tell me about a time you made a mistake or experienced a clinical failure. What did you learn?',
    whyTheyAsk: 'Evaluates honesty, vulnerability, self-reflection, and whether you take proactive steps to prevent recurring errors.',
    starFramework: {
      situation: 'A genuine clinical or academic oversight (avoid cliché humble-brags; pick a real learning moment).',
      task: 'Your immediate duty to notify the team, correct the issue, and protect the patient.',
      action: 'Took full ownership immediately without blaming others, notified attending, implemented safeguards.',
      result: 'No harm reached the patient; created a checklist/system that improved your personal practice permanently.'
    },
    sampleAnswerSnippet: '"As a sub-intern, I miscalculated a pediatric maintenance fluid rate by forgetting to account for boluses given in the ED. The nurse caught it before administration. I immediately apologized, re-checked with the senior, and instituted a mandatory double-check rule with pediatric dosing apps for all subsequent calculations."'
  },
  {
    id: 'q3',
    category: 'Resilience & Stress Management',
    question: 'Residency is physically and emotionally demanding. Tell me about a time you were overwhelmed and how you coped.',
    whyTheyAsk: 'Tests personal insight, coping mechanisms, and ability to avoid burnout while caring for critically ill patients.',
    starFramework: {
      situation: 'High-volume ward or ICU call night with multiple crashing patients simultaneously.',
      task: 'Triage clinical priorities without sacrificing patient safety or personal composure.',
      action: 'Utilized structured triage (ABCs), delegated tasks to junior learners, communicated with nursing, and took micro-breaks.',
      result: 'All patients were stabilized; debriefed with the team the next morning.'
    },
    sampleAnswerSnippet: '"During a chaotic ICU night with two simultaneous codes, I took a 5-second breath, focused on ABC triage, assigned specific roles to the team, and called for attending backup early. Knowing when to ask for help is essential for patient survival."'
  },
  {
    id: 'q4',
    category: 'Handling Critical Feedback',
    question: 'Tell me about a time you received constructive criticism from a supervisor. How did you react?',
    whyTheyAsk: 'Teachable residents thrive; defensive residents struggle. Shows coachability and commitment to lifelong improvement.',
    starFramework: {
      situation: 'Feedback received during mid-rotation evaluation regarding presentations or documentation speed.',
      task: 'Process the critique objectively rather than taking it personally.',
      action: 'Asked for concrete examples, practiced daily, and asked the evaluator for reassessment two weeks later.',
      result: 'Presentations became concise, note completion time dropped by 40%, and received honors on final evaluation.'
    },
    sampleAnswerSnippet: '"My attending noted my morning case presentations were too lengthy and buried the primary problem. I thanked him, adopted the SOAP format strictly with a 3-minute timer during pre-rounds, and by week 3 he praised the marked improvement in clarity."'
  },
  {
    id: 'q5',
    category: 'IMG Journey & Adaptability',
    question: 'As an International Medical Graduate, what has been your biggest challenge adapting to the US healthcare system?',
    whyTheyAsk: 'Assesses cultural competency, familiarity with US hospital systems, EMR navigation, and communication with diverse patients.',
    starFramework: {
      situation: 'Initial transition to US clinical environment during observership or externship.',
      task: 'Mastering interprofessional collaboration (nurses, social workers, case managers) and shared decision making.',
      action: 'Actively shadowed multidisciplinary teams, learned EMR templates, and practiced patient-centered counseling.',
      result: 'Earned strong clinical evaluations and gained complete confidence in US ward workflows.'
    },
    sampleAnswerSnippet: '"The biggest adjustment was navigating the interprofessional discharge planning ecosystem. In my home country, families handle much of post-discharge care. In the US, collaborating closely with physical therapists and social workers taught me the true power of holistic multidisciplinary care."'
  },
  {
    id: 'q6',
    category: 'Difficult Patient / Empathy',
    question: 'Describe a situation where you had to care for an angry, uncooperative, or anxious patient or family member.',
    whyTheyAsk: 'Tests de-escalation skills, empathy, active listening, and patient advocacy under emotional pressure.',
    starFramework: {
      situation: 'Anxious parent in pediatric ED or frustrated patient waiting hours for imaging.',
      task: 'De-escalate the tension, validate their emotions, and establish a therapeutic alliance.',
      action: 'Sat at eye level, listened without interrupting for 2 minutes, validated frustration, and explained the timeline transparently.',
      result: 'The patient relaxed, cooperated with diagnostic tests, and thanked the team at discharge.'
    },
    sampleAnswerSnippet: '"A mother was furious about a 3-hour delay for her child\'s ultrasound. Instead of citing hospital backlog, I sat down at eye level, acknowledged how scary the wait must feel, and provided regular updates every 20 minutes until the scan was complete."'
  },
  {
    id: 'q7',
    category: 'Ethical Dilemma',
    question: 'Tell me about an ethical dilemma you encountered in clinical practice and how you handled it.',
    whyTheyAsk: 'Examines ethical grounding, patient autonomy, confidentiality (HIPAA), and moral courage.',
    starFramework: {
      situation: 'End-of-life conflict, surrogate decision making, or refusal of life-saving treatment on religious grounds.',
      task: 'Respect patient autonomy while exploring underlying fears and ensuring informed consent.',
      action: 'Convened an ethics consult / palliative conference, explored values, and ensured clear documentation.',
      result: 'The team reached a compassionate consensus aligned with the patient\'s documented goals of care.'
    },
    sampleAnswerSnippet: '"When a terminal cancer patient refused intubation against their family\'s wishes, I helped facilitate a multidisciplinary goals-of-care conference where the patient\'s values were heard with dignity, transitioning focus smoothly to comfort care."'
  },
  {
    id: 'q8',
    category: 'Leadership & Initiative',
    question: 'Give an example of a time you demonstrated clinical leadership or took initiative to improve patient care.',
    whyTheyAsk: 'Identifies future chief residents, self-starters, and candidates with quality improvement mindset.',
    starFramework: {
      situation: 'Identified a systemic bottleneck (e.g. delayed discharge medication delivery or missing vaccination records).',
      task: 'Propose a feasible, low-friction solution without overburdening nursing staff.',
      action: 'Created a standardized discharge medication visual handout and piloted it with the pharmacy team.',
      result: 'Discharge delays decreased by 25 minutes per patient across the service.'
    },
    sampleAnswerSnippet: '"I noticed pediatric asthma patients frequently returned with poor inhaler technique. I created a 1-page illustrated spacer guide in English and Spanish, which the clinic adopted as standard discharge teaching for all asthma admissions."'
  }
];

export default function STARPracticeFlashcards() {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [drafts, setDrafts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('matchamd_star_drafts') || '{}');
    } catch {
      return {};
    }
  });

  const currentQ = STAR_QUESTIONS[currentIndex];
  const currentDraft = drafts[currentQ.id] || {
    situation: '',
    task: '',
    action: '',
    result: '',
    notes: '',
    completed: false
  };

  const handleDraftChange = (field, value) => {
    const updated = {
      ...drafts,
      [currentQ.id]: {
        ...currentDraft,
        [field]: value
      }
    };
    setDrafts(updated);
    localStorage.setItem('matchamd_star_drafts', JSON.stringify(updated));
  };

  const toggleCompleted = () => {
    const nextStatus = !currentDraft.completed;
    handleDraftChange('completed', nextStatus);
    toast({
      title: nextStatus ? 'Marked as Mastered! 🎉' : 'Marked as In Progress',
      description: `Question ${currentIndex + 1} updated.`
    });
  };

  const handleSave = () => {
    localStorage.setItem('matchamd_star_drafts', JSON.stringify(drafts));
    toast({
      title: 'STAR Practice Saved! 💾',
      description: 'Your responses have been saved to your local preparation dossier.'
    });
  };

  const handleExportCheatSheet = () => {
    const lines = [
      '=====================================================',
      'MATAMD RESIDENCY INTERVIEW STAR PREPARATION DOSSIER',
      `Generated: ${new Date().toLocaleDateString()}`,
      '=====================================================\n'
    ];

    STAR_QUESTIONS.forEach((q, idx) => {
      const d = drafts[q.id] || {};
      lines.push(`QUESTION ${idx + 1} [${q.category.toUpperCase()}]:`);
      lines.push(`"${q.question}"\n`);
      lines.push(`Situation: ${d.situation || 'Not drafted yet'}`);
      lines.push(`Task: ${d.task || 'Not drafted yet'}`);
      lines.push(`Action: ${d.action || 'Not drafted yet'}`);
      lines.push(`Result: ${d.result || 'Not drafted yet'}`);
      if (d.notes) lines.push(`Key Notes: ${d.notes}`);
      lines.push('\n-----------------------------------------------------\n');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MatchaMD_STAR_Interview_Dossier_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast({
      title: 'Interview Dossier Exported! 📄',
      description: 'Downloaded your complete STAR interview notes for quick review.'
    });
  };

  const completedCount = Object.values(drafts).filter(d => d.completed).length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-white dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-900/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Interactive Behavioral Interview Studio
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Residency STAR Practice Flashcards
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Master the <strong>STAR Method</strong> (Situation, Task, Action, Result) for the most common residency behavioral questions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-right mr-2">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {completedCount} of {STAR_QUESTIONS.length} Mastered
            </p>
            <div className="w-28 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${(completedCount / STAR_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>
          <Button
            onClick={handleExportCheatSheet}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs gap-1.5 border-slate-300 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            Export Notes
          </Button>
        </div>
      </div>

      {/* Flashcard Area */}
      <Card className="rounded-3xl border-2 border-indigo-200/80 dark:border-indigo-900/80 overflow-hidden shadow-md bg-white dark:bg-slate-900">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200">
              Question {currentIndex + 1} of {STAR_QUESTIONS.length}
            </Badge>
            <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" variant="secondary">
              {currentQ.category}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={toggleCompleted}
              variant={currentDraft.completed ? "default" : "outline"}
              size="sm"
              className={`rounded-xl text-xs gap-1.5 ${currentDraft.completed ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {currentDraft.completed ? 'Mastered ✓' : 'Mark as Mastered'}
            </Button>
            <Button
              onClick={() => setIsFlipped(!isFlipped)}
              variant="ghost"
              size="sm"
              className="rounded-xl text-xs gap-1 text-indigo-600 dark:text-indigo-400"
            >
              <RotateCw className="w-3.5 h-3.5" />
              {isFlipped ? 'View Framework' : 'View Sample Answer'}
            </Button>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
              "{currentQ.question}"
            </h3>
            <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50/70 dark:bg-amber-950/20 rounded-2xl border border-amber-200/70 text-xs text-amber-900 dark:text-amber-300">
              <Lightbulb className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>Why Program Directors Ask This:</strong> {currentQ.whyTheyAsk}
              </div>
            </div>
          </div>

          {/* Flipped View: Sample Answer vs STAR Framework Guidance */}
          <AnimatePresence mode="wait">
            {isFlipped ? (
              <motion.div
                key="sample"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 mb-6"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-2">
                  <BookOpen className="w-4 h-4" />
                  Clinical Sample Response (STAR Model)
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  {currentQ.sampleAnswerSnippet}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="framework"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid sm:grid-cols-2 gap-3 mb-6"
              >
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 text-xs">
                  <span className="font-bold text-indigo-950 dark:text-indigo-200 block mb-1">S - Situation:</span>
                  <span className="text-slate-600 dark:text-slate-400">{currentQ.starFramework.situation}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 text-xs">
                  <span className="font-bold text-indigo-950 dark:text-indigo-200 block mb-1">T - Task:</span>
                  <span className="text-slate-600 dark:text-slate-400">{currentQ.starFramework.task}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 text-xs">
                  <span className="font-bold text-indigo-950 dark:text-indigo-200 block mb-1">A - Action:</span>
                  <span className="text-slate-600 dark:text-slate-400">{currentQ.starFramework.action}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 text-xs">
                  <span className="font-bold text-indigo-950 dark:text-indigo-200 block mb-1">R - Result:</span>
                  <span className="text-slate-600 dark:text-slate-400">{currentQ.starFramework.result}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Draft Studio for this Question */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Draft Your Personal Response
              </span>
              <span className="text-[11px] text-slate-400">Auto-saved to your browser</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  1. Situation (Clinical Setting & Patient)
                </label>
                <Textarea
                  rows={2}
                  placeholder="During my internal medicine sub-internship on the cardiology ward..."
                  value={currentDraft.situation}
                  onChange={(e) => handleDraftChange('situation', e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  2. Task (What was your responsibility?)
                </label>
                <Textarea
                  rows={2}
                  placeholder="My role was to clarify the order and ensure patient safety without causing conflict..."
                  value={currentDraft.task}
                  onChange={(e) => handleDraftChange('task', e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  3. Action (What specific steps did you take?)
                </label>
                <Textarea
                  rows={2}
                  placeholder="I pulled the resident aside privately, showed the telemetry strip, and asked..."
                  value={currentDraft.action}
                  onChange={(e) => handleDraftChange('action', e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  4. Result & Learning (What was the outcome?)
                </label>
                <Textarea
                  rows={2}
                  placeholder="The medication was adjusted, patient remained stable, and the attending commended our teamwork..."
                  value={currentDraft.result}
                  onChange={(e) => handleDraftChange('result', e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Question
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSave}
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs gap-1.5 border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Draft
                </Button>
                <Button
                  onClick={() => setCurrentIndex((prev) => Math.min(STAR_QUESTIONS.length - 1, prev + 1))}
                  disabled={currentIndex === STAR_QUESTIONS.length - 1}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs gap-1"
                  size="sm"
                >
                  Next Question
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
