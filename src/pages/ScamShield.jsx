import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import UGCSafetyMenu from '@/components/common/UGCSafetyMenu';
import { isItemFlagged, isUserBlocked } from '@/lib/ugcSafety';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Search,
  Plus,
  Building2,
  FileCheck2,
  Stethoscope,
  DollarSign,
  ThumbsUp,
  Sparkles,
  Copy,
  Check,
  Filter,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'matchamd_scam_shield_reviews_v1';

export const VERDICT_OPTIONS = [
  'Verified Legit',
  'Proceed with Caution',
  'High Scam Risk',
];

export const LETTERHEAD_OPTIONS = [
  'Hospital Letterhead',
  'Private Clinic Letterhead',
];

export const ROTATION_TYPE_OPTIONS = [
  'Hands-On Elective',
  'Observership',
  'Tele-rotation',
];

export const RED_FLAG_TAGS = [
  '🚩 Hospital Bait-and-Switch',
  '🚩 Overcrowded Preceptor',
  '🚩 Generic Template LoR',
  '🚩 Hidden Fees',
];

const INITIAL_REVIEWS = [
  {
    id: 'radar-1',
    entityName: 'Cleveland Clinic International Physician Observer Program',
    category: 'Direct Hospital Program',
    specialty: 'Internal Medicine / Cardiology',
    location: 'Cleveland, OH',
    verdict: 'Verified Legit',
    letterheadType: 'Hospital Letterhead',
    rotationType: 'Observership',
    isFreeOrDirect: true,
    costUsd: 0,
    coordinatorInfo: 'Apply directly via Cleveland Clinic Center for International Medical Education (CIME) portal — no third-party agency fees.',
    redFlags: [],
    summary:
      'Applied directly through the hospital GME/International portal. Zero agency middlemen. Structured morning report, grand rounds, and inpatient rounding with academic faculty. Official Cleveland Clinic letterhead provided for standout observers.',
    authorName: 'Dr. A. Patel (Matched IM)',
    createdAt: '2026-08-12T10:00:00Z',
    helpfulCount: 64,
  },
  {
    id: 'radar-2',
    entityName: 'Jackson Park Hospital (Via Third-Party Broker "USMedRotationsPro")',
    category: 'Rotation Agency',
    specialty: 'Internal Medicine',
    location: 'Chicago, IL',
    verdict: 'Proceed with Caution',
    letterheadType: 'Hospital Letterhead',
    rotationType: 'Hands-On Elective',
    isFreeOrDirect: false,
    costUsd: 2600,
    coordinatorInfo: 'Tip: Contact Jackson Park Hospital medical education office directly instead of paying agency markups.',
    redFlags: ['🚩 Overcrowded Preceptor', '🚩 Generic Template LoR'],
    summary:
      'The hospital rotation itself is real and gives hospital letterhead, but booking through this broker cost $1,000 more than booking directly. There were 14 IMGs rounding with a single attending, and the LoR was a generic fill-in-the-blank template unless you drafted your own bullet points.',
    authorName: 'Dr. S. Rahman (Non-US IMG)',
    createdAt: '2026-09-04T15:30:00Z',
    helpfulCount: 49,
  },
  {
    id: 'radar-3',
    entityName: '"Elite Match Guarantee & Academic Hospital USCE" (Instagram / WhatsApp Broker)',
    category: 'Match Consultant / Agency',
    specialty: 'Multiple Specialties',
    location: 'New York / Brooklyn, NY',
    verdict: 'High Scam Risk',
    letterheadType: 'Private Clinic Letterhead',
    rotationType: 'Observership',
    isFreeOrDirect: false,
    costUsd: 3800,
    coordinatorInfo: 'Avoid wire transfers / Zelle payments to unverified WhatsApp brokers.',
    redFlags: [
      '🚩 Hospital Bait-and-Switch',
      '🚩 Overcrowded Preceptor',
      '🚩 Generic Template LoR',
      '🚩 Hidden Fees',
    ],
    summary:
      'Advertised an "Inpatient University Teaching Hospital Hands-On Sub-I in Manhattan" for $3,800. After payment via Zelle, they switched the location 48 hours before start date to a tiny outpatient private clinic in outer Queens with 18 other students. Charged an extra $450 "LoR processing fee" for a private clinic letterhead.',
    authorName: 'Anonymous IMG Whistleblower',
    createdAt: '2026-09-19T19:00:00Z',
    helpfulCount: 112,
  },
  {
    id: 'radar-4',
    entityName: 'SUNY Downstate / Kings County Direct Faculty Observership',
    category: 'Direct Hospital Program',
    specialty: 'Internal Medicine / Pediatrics',
    location: 'Brooklyn, NY',
    verdict: 'Verified Legit',
    letterheadType: 'Hospital Letterhead',
    rotationType: 'Observership',
    isFreeOrDirect: true,
    costUsd: 0,
    coordinatorInfo: 'Cold-email department faculty & academic coordinators directly with CV, Step scores, and ECFMG status.',
    redFlags: [],
    summary:
      'Found my preceptor by emailing 35 academic faculty members directly using a concise cold-email template. Paid $0 in agency fees (only standard hospital badge/EHR clearance). Rounded with residents daily and earned a personalized Department Hospital Letterhead LoR.',
    authorName: 'Dr. M. Al-Mansoor (PGY-1)',
    createdAt: '2026-09-25T12:15:00Z',
    helpfulCount: 83,
  },
  {
    id: 'radar-5',
    entityName: '"Global Tele-Clerkship Express" Virtual Rotation',
    category: 'Rotation Agency',
    specialty: 'Family Medicine / Psychiatry',
    location: 'Remote / Tele-rotation',
    verdict: 'Proceed with Caution',
    letterheadType: 'Private Clinic Letterhead',
    rotationType: 'Tele-rotation',
    isFreeOrDirect: false,
    costUsd: 1450,
    coordinatorInfo: 'Check whether your target residency programs accept tele-rotations before paying.',
    redFlags: ['🚩 Generic Template LoR', '🚩 Hidden Fees'],
    summary:
      'Consisted mostly of pre-recorded Zoom case discussions with 25+ students on mute. Many residency programs explicitly state in FREIDA that tele-rotations do not count toward their 3-month USCE requirement. Only use if you have visa denials and cannot travel to the US.',
    authorName: 'Dr. K. Silva (YOG 2023)',
    createdAt: '2026-10-02T09:40:00Z',
    helpfulCount: 37,
  },
  {
    id: 'radar-6',
    entityName: 'Griffin Hospital / Yale-Affiliated Community Teaching Direct Electives',
    category: 'Direct Hospital Program',
    specialty: 'Internal Medicine / Preventive Medicine',
    location: 'Derby, CT',
    verdict: 'Verified Legit',
    letterheadType: 'Hospital Letterhead',
    rotationType: 'Hands-On Elective',
    isFreeOrDirect: true,
    costUsd: 500,
    coordinatorInfo: 'Apply directly through the hospital Medical Education coordinator 4–6 months in advance.',
    redFlags: [],
    summary:
      'Direct hospital application with transparent administrative processing fee. Genuine inpatient teaching rounds with residents, case presentations, and authentic Hospital Letterhead LoR uploaded directly to ERAS.',
    authorName: 'Dr. R. Nwosu (Matched IM)',
    createdAt: '2026-10-08T14:20:00Z',
    helpfulCount: 58,
  },
];

const COLD_EMAIL_TEMPLATE = `Subject: Prospective IMG Observer / Visiting Scholar Inquiry – [Your Name], MD (Step 1 Pass / Step 2 CK: [Score])

Dear Dr. [Faculty Last Name],

I hope this email finds you well. My name is Dr. [Your Name], an International Medical Graduate from [Medical School, Country] applying for the upcoming [Specialty] Residency Match. I recently read your work on [briefly mention clinical interest or division at Hospital Name].

I am writing to respectfully inquire if you or your division at [Hospital Name] might have availability to host a self-funded visiting observer for a 4-week rotation during [Month/Year Window].

Quick Summary of Qualifications:
• USMLE Step 1: Passed | USMLE Step 2 CK: [Score]
• ECFMG Status: [Pathway Approved / OET Passed / Form 186 Verified]
• Visa Status: Currently hold a valid B1/B2 visitor visa (no institutional sponsorship required for observership)

I have attached my CV and USMLE score report for your review. If your department processes observerships through a GME or Division Coordinator, I would be deeply grateful if you could point me to the appropriate contact.

Thank you very much for your time, mentorship, and consideration.

Warm regards,
[Your Full Name], MD
AAMC ID: [Your AAMC ID]
Phone / Email`;

function getVerdictBadgeStyle(verdict) {
  switch (verdict) {
    case 'Verified Legit':
      return 'bg-[#10B981]/15 text-[#10B981] dark:text-[#4ADE80] border-[#10B981]/40';
    case 'Proceed with Caution':
      return 'bg-[#F59E0B]/15 text-[#F59E0B] dark:text-amber-300 border-[#F59E0B]/40';
    case 'High Scam Risk':
      return 'bg-[#F43F5E]/15 text-[#F43F5E] dark:text-rose-300 border-[#F43F5E]/40';
    default:
      return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  }
}

function getVerdictIcon(verdict) {
  switch (verdict) {
    case 'Verified Legit':
      return <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] dark:text-[#4ADE80]" />;
    case 'Proceed with Caution':
      return <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />;
    case 'High Scam Risk':
      return <ShieldAlert className="w-3.5 h-3.5 text-[#F43F5E]" />;
    default:
      return null;
  }
}

export default function ScamShield() {
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_REVIEWS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState('all');
  const [selectedLetterhead, setSelectedLetterhead] = useState('all');
  const [selectedRotationType, setSelectedRotationType] = useState('all');
  const [selectedRedFlag, setSelectedRedFlag] = useState('all');
  const [freeDirectOnly, setFreeDirectOnly] = useState(false);
  const [ugcVersion, setUgcVersion] = useState(0);

  // Add Review Modal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const [newReview, setNewReview] = useState({
    entityName: '',
    location: '',
    specialty: 'Internal Medicine',
    verdict: 'Verified Legit',
    letterheadType: 'Hospital Letterhead',
    rotationType: 'Observership',
    isFreeOrDirect: false,
    costUsd: '',
    coordinatorInfo: '',
    redFlags: [],
    summary: '',
    authorName: '',
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch {
      // ignore
    }
  }, [reviews]);

  useEffect(() => {
    const handler = () => setUgcVersion((v) => v + 1);
    window.addEventListener('matchamd-ugc-updated', handler);
    return () => window.removeEventListener('matchamd-ugc-updated', handler);
  }, []);

  const toggleNewReviewRedFlag = (flag) => {
    setNewReview((prev) => ({
      ...prev,
      redFlags: prev.redFlags.includes(flag)
        ? prev.redFlags.filter((f) => f !== flag)
        : [...prev.redFlags, flag],
    }));
  };

  const handleCreateReview = (e) => {
    e.preventDefault();
    if (!newReview.entityName.trim() || !newReview.summary.trim()) {
      toast.error('Please enter the agency/hospital name and your experience summary.');
      return;
    }

    const entry = {
      id: `radar_${Date.now()}`,
      entityName: newReview.entityName.trim(),
      category: newReview.isFreeOrDirect ? 'Direct Hospital Program' : 'Rotation Agency / Consultant',
      specialty: newReview.specialty.trim() || 'General',
      location: newReview.location.trim() || 'United States',
      verdict: newReview.verdict,
      letterheadType: newReview.letterheadType,
      rotationType: newReview.rotationType,
      isFreeOrDirect: Boolean(newReview.isFreeOrDirect),
      costUsd: newReview.costUsd ? Number(newReview.costUsd) : 0,
      coordinatorInfo: newReview.coordinatorInfo.trim(),
      redFlags: newReview.redFlags,
      summary: newReview.summary.trim(),
      authorName: newReview.authorName.trim() || 'Anonymous Verified IMG',
      createdAt: new Date().toISOString(),
      helpfulCount: 1,
    };

    setReviews((prev) => [entry, ...prev]);
    setSubmitModalOpen(false);
    setNewReview({
      entityName: '',
      location: '',
      specialty: 'Internal Medicine',
      verdict: 'Verified Legit',
      letterheadType: 'Hospital Letterhead',
      rotationType: 'Observership',
      isFreeOrDirect: false,
      costUsd: '',
      coordinatorInfo: '',
      redFlags: [],
      summary: '',
      authorName: '',
    });
    toast.success('Thank you! Your USCE Truth Radar review has been published to protect fellow IMGs.');
  };

  const handleHelpfulVote = (id) => {
    setReviews((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, helpfulCount: (item.helpfulCount || 0) + 1 } : item
      )
    );
    toast.success('Marked as helpful!');
  };

  const handleCopyEmailTemplate = () => {
    navigator.clipboard?.writeText(COLD_EMAIL_TEMPLATE);
    setCopiedTemplate(true);
    toast.success('Direct Coordinator Cold-Email Template copied to clipboard!');
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (isItemFlagged(r.id) || isUserBlocked(r.authorName)) return false;

      if (freeDirectOnly && !r.isFreeOrDirect) return false;
      if (selectedVerdict !== 'all' && r.verdict !== selectedVerdict) return false;
      if (selectedLetterhead !== 'all' && r.letterheadType !== selectedLetterhead) return false;
      if (selectedRotationType !== 'all' && r.rotationType !== selectedRotationType) return false;
      if (selectedRedFlag !== 'all' && !(r.redFlags || []).includes(selectedRedFlag)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchEntity = r.entityName?.toLowerCase().includes(q);
        const matchLoc = r.location?.toLowerCase().includes(q);
        const matchSpec = r.specialty?.toLowerCase().includes(q);
        const matchSummary = r.summary?.toLowerCase().includes(q);
        if (!matchEntity && !matchLoc && !matchSpec && !matchSummary) return false;
      }

      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    reviews,
    freeDirectOnly,
    selectedVerdict,
    selectedLetterhead,
    selectedRotationType,
    selectedRedFlag,
    searchQuery,
    ugcVersion,
  ]);

  const stats = useMemo(() => {
    const legit = reviews.filter((r) => r.verdict === 'Verified Legit').length;
    const scam = reviews.filter((r) => r.verdict === 'High Scam Risk').length;
    const direct = reviews.filter((r) => r.isFreeOrDirect).length;
    return { legit, scam, direct };
  }, [reviews]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] pb-nav-safe transition-colors">
      <Header
        title="Scam Shield & USCE Radar"
        rightContent={
          <Button
            size="sm"
            onClick={() => setSubmitModalOpen(true)}
            className="bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold rounded-xl gap-1 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Review
          </Button>
        }
      />

      <main className="px-4 py-6 max-w-2xl mx-auto space-y-5">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-emerald-500/30 p-6 text-white shadow-xl"
        >
          <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#F43F5E]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-[#10B981]/20 blur-3xl" />

          <div className="relative space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F43F5E]/20 border border-[#F43F5E]/40 text-rose-300 text-xs font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-[#F43F5E]" />
                <span>Scam Shield & USCE Truth Radar</span>
              </div>
              <button
                type="button"
                onClick={() => setTemplateOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/20 hover:bg-[#10B981]/30 border border-[#4ADE80]/40 text-[#4ADE80] text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Free Cold-Email Template</span>
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Crowdsourced USCE & Agency Verification for IMGs
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Don’t lose thousands of dollars to hospital bait-and-switches or generic clinic letterhead templates. Filter verified peer reviews by <strong className="text-[#4ADE80]">Hospital Letterhead</strong>, <strong className="text-rose-300">Red Flags</strong>, and <strong className="text-[#4ADE80]">Free / Direct Hospital Coordinators</strong>.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <div className="text-lg font-black text-[#4ADE80]">{stats.legit}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-200/80">
                  Verified Legit
                </div>
              </div>
              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center">
                <div className="text-lg font-black text-[#F43F5E]">{stats.scam}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-200/80">
                  High Scam Risk
                </div>
              </div>
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center">
                <div className="text-lg font-black text-cyan-300">{stats.direct}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-cyan-200/80">
                  Free / Direct GME
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Budget IMG Spotlight: Free / Direct Hospital Coordinators Toggle */}
        <div
          onClick={() => setFreeDirectOnly((prev) => !prev)}
          role="switch"
          aria-checked={freeDirectOnly}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setFreeDirectOnly((prev) => !prev);
            }
          }}
          className={`flex items-center justify-between gap-3 p-4 rounded-2xl border cursor-pointer transition-all select-none ${
            freeDirectOnly
              ? 'bg-[#10B981]/15 border-[#10B981] shadow-md shadow-emerald-500/10'
              : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700/80 hover:border-[#10B981]/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-[#10B981] dark:text-[#4ADE80]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Free / Direct Hospital Coordinators Only
                </span>
                <Badge className="bg-[#10B981] text-slate-950 font-bold text-[10px] px-1.5 py-0">
                  Budget Friendly
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hide paid agencies and show only direct hospital GME portals & cold-email rotations
              </p>
            </div>
          </div>
          <div
            className={`w-12 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
              freeDirectOnly ? 'bg-[#10B981]' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                freeDirectOnly ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {/* Search & Objective Filters Card */}
        <Card className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700/80 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agency name, hospital, city, or specialty..."
              className="pl-9 bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-sm rounded-xl"
            />
          </div>

          {/* Verdict Filter Pills */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              <Filter className="w-3 h-3" />
              <span>Verdict Filter</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedVerdict('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  selectedVerdict === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                All Verdicts
              </button>
              {VERDICT_OPTIONS.map((verdict) => (
                <button
                  key={verdict}
                  type="button"
                  onClick={() =>
                    setSelectedVerdict(selectedVerdict === verdict ? 'all' : verdict)
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selectedVerdict === verdict
                      ? getVerdictBadgeStyle(verdict) + ' ring-2 ring-offset-1 ring-emerald-500/40'
                      : 'bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {getVerdictIcon(verdict)}
                  <span>{verdict}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Letterhead & Rotation Type Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Letterhead Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedLetterhead('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                    selectedLetterhead === 'all'
                      ? 'bg-[#10B981]/20 text-[#10B981] dark:text-[#4ADE80] border-[#10B981]/40 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  All
                </button>
                {LETTERHEAD_OPTIONS.map((lh) => (
                  <button
                    key={lh}
                    type="button"
                    onClick={() =>
                      setSelectedLetterhead(selectedLetterhead === lh ? 'all' : lh)
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      selectedLetterhead === lh
                        ? 'bg-[#10B981]/20 text-[#10B981] dark:text-[#4ADE80] border-[#10B981]/40 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {lh}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Rotation Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedRotationType('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                    selectedRotationType === 'all'
                      ? 'bg-[#10B981]/20 text-[#10B981] dark:text-[#4ADE80] border-[#10B981]/40 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  All
                </button>
                {ROTATION_TYPE_OPTIONS.map((rt) => (
                  <button
                    key={rt}
                    type="button"
                    onClick={() =>
                      setSelectedRotationType(selectedRotationType === rt ? 'all' : rt)
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      selectedRotationType === rt
                        ? 'bg-[#10B981]/20 text-[#10B981] dark:text-[#4ADE80] border-[#10B981]/40 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {rt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Red Flag Tag Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-400 mb-1.5">
              Filter by Specific Red Flag
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedRedFlag('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  selectedRedFlag === 'all'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                Any / None
              </button>
              {RED_FLAG_TAGS.map((flag) => (
                <button
                  key={flag}
                  type="button"
                  onClick={() =>
                    setSelectedRedFlag(selectedRedFlag === flag ? 'all' : flag)
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    selectedRedFlag === flag
                      ? 'bg-[#F43F5E]/20 text-[#F43F5E] dark:text-rose-300 border-[#F43F5E]/50 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-rose-500/40'
                  }`}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Showing <span className="text-slate-900 dark:text-white font-bold">{filteredReviews.length}</span> verified IMG rotation & agency reports
          </p>
          {(selectedVerdict !== 'all' ||
            selectedLetterhead !== 'all' ||
            selectedRotationType !== 'all' ||
            selectedRedFlag !== 'all' ||
            freeDirectOnly ||
            searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedVerdict('all');
                setSelectedLetterhead('all');
                setSelectedRotationType('all');
                setSelectedRedFlag('all');
                setFreeDirectOnly(false);
                setSearchQuery('');
              }}
              className="text-xs text-[#10B981] dark:text-[#4ADE80] font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Review Cards Feed */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl bg-white dark:bg-[#1E293B] border p-5 shadow-sm space-y-3.5 ${
                review.verdict === 'High Scam Risk'
                  ? 'border-[#F43F5E]/50'
                  : review.verdict === 'Proceed with Caution'
                  ? 'border-[#F59E0B]/40'
                  : 'border-[#10B981]/35'
              }`}
            >
              {/* Top Row: Verdict + Free/Direct Badge + Cost */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getVerdictBadgeStyle(
                      review.verdict
                    )}`}
                  >
                    {getVerdictIcon(review.verdict)}
                    <span>{review.verdict}</span>
                  </span>

                  {review.isFreeOrDirect && (
                    <Badge className="bg-[#10B981]/15 text-[#10B981] dark:text-[#4ADE80] border border-[#10B981]/35 text-xs">
                      ✓ Free / Direct Hospital Coordinator
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  <DollarSign className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>
                    {review.costUsd === 0
                      ? 'Free / $0 Agency Fee'
                      : `$${Number(review.costUsd).toLocaleString()} USD`}
                  </span>
                </div>
              </div>

              {/* Title & Meta */}
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {review.entityName}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {review.location}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                    {review.specialty}
                  </span>
                </div>
              </div>

              {/* Objective Badges: Letterhead Type & Rotation Type */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold gap-1 ${
                    review.letterheadType === 'Hospital Letterhead'
                      ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-300 bg-emerald-500/10'
                      : 'border-amber-500/40 text-amber-600 dark:text-amber-300 bg-amber-500/10'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  {review.letterheadType}
                </Badge>

                <Badge
                  variant="outline"
                  className="text-xs font-semibold border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                >
                  {review.rotationType}
                </Badge>
              </div>

              {/* Red Flag Tags */}
              {review.redFlags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {review.redFlags.map((flag) => (
                    <span
                      key={flag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#F43F5E]/15 text-[#F43F5E] dark:text-rose-300 border border-[#F43F5E]/30"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              )}

              {/* Experience Review Body */}
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {review.summary}
              </p>

              {/* Direct Coordinator Info Box */}
              {review.coordinatorInfo && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <strong className="text-[#10B981] dark:text-[#4ADE80]">
                    💡 How to Apply / Avoid Markup:{' '}
                  </strong>
                  {review.coordinatorInfo}
                </div>
              )}

              {/* Footer: Author + Helpful + Google Play UGC Report/Block Menu */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    By <strong className="text-slate-700 dark:text-slate-300">{review.authorName}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleHelpfulVote(review.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#10B981] dark:text-[#4ADE80] hover:underline"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful ({review.helpfulCount || 0})</span>
                  </button>
                </div>

                {/* Mandatory Google Play Store UGC Compliance Controls */}
                <UGCSafetyMenu
                  itemId={review.id}
                  itemType="usce_agency_review"
                  title={review.entityName}
                  authorName={review.authorName}
                  authorId={review.authorName}
                  compact
                />
              </div>
            </motion.div>
          ))}

          {filteredReviews.length === 0 && (
            <Card className="p-8 text-center rounded-2xl bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700">
              <ShieldCheck className="w-10 h-10 text-[#10B981] mx-auto mb-2" />
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                No matching rotation or agency reports found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Try clearing a filter or share your own USCE rotation experience to help fellow IMGs.
              </p>
              <Button
                onClick={() => setSubmitModalOpen(true)}
                className="bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold"
              >
                + Share USCE / Agency Review
              </Button>
            </Card>
          )}
        </div>
      </main>

      {/* Submit Review Modal */}
      <Dialog open={submitModalOpen} onOpenChange={setSubmitModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#10B981] dark:text-[#4ADE80]">
              <ShieldAlert className="w-5 h-5" />
              Submit USCE / Agency Truth Report
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Help fellow IMGs avoid predatory rotations and discover genuine Hospital Letterhead opportunities.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateReview} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Hospital, Agency, or Consultant Name *
              </label>
              <Input
                value={newReview.entityName}
                onChange={(e) => setNewReview({ ...newReview, entityName: e.target.value })}
                placeholder="e.g., Jackson Park Hospital or Agency Name"
                required
                className="bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  City & State
                </label>
                <Input
                  value={newReview.location}
                  onChange={(e) => setNewReview({ ...newReview, location: e.target.value })}
                  placeholder="e.g., Chicago, IL"
                  className="bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Cost Paid (USD)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={newReview.costUsd}
                  onChange={(e) => setNewReview({ ...newReview, costUsd: e.target.value })}
                  placeholder="0 if Free/Direct"
                  className="bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Verdict Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Verdict *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {VERDICT_OPTIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, verdict: v })}
                    className={`p-2 rounded-xl text-xs font-bold border text-center transition-all ${
                      newReview.verdict === v
                        ? getVerdictBadgeStyle(v)
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Letterhead & Rotation Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  LoR Letterhead Type
                </label>
                <div className="space-y-1.5">
                  {LETTERHEAD_OPTIONS.map((lh) => (
                    <button
                      key={lh}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, letterheadType: lh })}
                      className={`w-full p-2 rounded-xl text-xs font-semibold border text-left ${
                        newReview.letterheadType === lh
                          ? 'bg-[#10B981]/15 border-[#10B981] text-[#10B981] dark:text-[#4ADE80]'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      {lh}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Rotation Type
                </label>
                <div className="space-y-1.5">
                  {ROTATION_TYPE_OPTIONS.map((rt) => (
                    <button
                      key={rt}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rotationType: rt })}
                      className={`w-full p-2 rounded-xl text-xs font-semibold border text-left ${
                        newReview.rotationType === rt
                          ? 'bg-[#10B981]/15 border-[#10B981] text-[#10B981] dark:text-[#4ADE80]'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      {rt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Free / Direct Hospital Coordinator Checkbox */}
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 cursor-pointer text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <input
                type="checkbox"
                checked={newReview.isFreeOrDirect}
                onChange={(e) =>
                  setNewReview({ ...newReview, isFreeOrDirect: e.target.checked })
                }
                className="accent-[#10B981]"
              />
              <span>
                This is a Free or Direct Hospital Coordinator rotation (No third-party agency)
              </span>
            </label>

            {/* Red Flags */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-rose-400 mb-1.5">
                Red Flag Warnings Observed (Select any that apply)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {RED_FLAG_TAGS.map((flag) => {
                  const active = newReview.redFlags.includes(flag);
                  return (
                    <button
                      key={flag}
                      type="button"
                      onClick={() => toggleNewReviewRedFlag(flag)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        active
                          ? 'bg-[#F43F5E]/20 border-[#F43F5E] text-[#F43F5E] dark:text-rose-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      {flag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Detailed Experience & LoR Reality *
              </label>
              <Textarea
                rows={4}
                required
                value={newReview.summary}
                onChange={(e) => setNewReview({ ...newReview, summary: e.target.value })}
                placeholder="How many students per attending? Was the LoR genuinely hospital letterhead? Any hidden fees?"
                className="bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Direct Coordinator Tip (Optional)
              </label>
              <Input
                value={newReview.coordinatorInfo}
                onChange={(e) => setNewReview({ ...newReview, coordinatorInfo: e.target.value })}
                placeholder="How can other IMGs apply directly without paying a broker?"
                className="bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-700"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubmitModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold"
              >
                Publish Verified Report
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cold Email Template Modal for Free Direct Hospital Rotations */}
      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#10B981] dark:text-[#4ADE80]">
              <Sparkles className="w-5 h-5" />
              Direct Hospital Coordinator Cold-Email Template
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Send this concise, high-response template to Academic Attending Physicians and GME Program Coordinators to secure $0-agency-fee hospital observerships.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-700 max-h-80 overflow-y-auto">
            {COLD_EMAIL_TEMPLATE}
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={handleCopyEmailTemplate}
              className="w-full bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold gap-2"
            >
              {copiedTemplate ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedTemplate ? 'Copied to Clipboard!' : 'Copy Cold-Email Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
