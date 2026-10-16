import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import ErrorState from '@/components/common/ErrorState';
import UGCSafetyMenu from '@/components/common/UGCSafetyMenu';
import { isItemFlagged, isUserBlocked } from '@/lib/ugcSafety';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Heart, 
  MessageCircle, 
  Award, 
  TrendingUp,
  Clock,
  Pin,
  ShieldAlert,
  CheckCircle2,
  Circle,
  Plane,
  BarChart3,
  ClipboardCheck,
  Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const categories = [
  { id: 'all', label: 'All Posts' },
  { id: 'usmle_prep', label: 'USMLE Prep' },
  { id: 'visa_questions', label: 'Visa Q&A' },
  { id: 'eras_tips', label: 'ERAS Tips' },
  { id: 'interviews', label: 'Interviews' },
  { id: 'match', label: 'Match' },
  { id: 'success_stories', label: 'Success Stories' },
  { id: 'general', label: 'General' }
];

const categoryColors = {
  usmle_prep: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  visa_questions: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  eras_tips: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  interviews: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  match: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  success_stories: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  general: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  fellowship: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  med_school: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
};

const ERAS_RED_FLAG_AUDIT_ITEMS = [
  {
    id: 'yog_gap_explained',
    title: 'No Unexplained Clinical Gaps > 3 Months Since Graduation',
    tip: 'Every post-YOG gap in ERAS Work/Experiences should be accounted for with active clinical practice, research, or structured observerships.',
  },
  {
    id: 'hospital_letterhead_lors',
    title: 'At Least 3 US Specialty-Specific LoRs on Hospital Letterhead',
    tip: 'Verify via Scam Shield that your USCE preceptors issue letters on official Hospital/Academic letterhead rather than generic outpatient clinic templates.',
  },
  {
    id: 'step_attempts_addressed',
    title: 'USMLE Step Attempts / Low Score Framed Constructively (If Applicable)',
    tip: 'If you have a Step attempt or Step 2 CK < 235, address it briefly with ownership + upward trajectory in your Personal Statement or Impactful Experiences.',
  },
  {
    id: 'ecfmg_verified_by_sept',
    title: 'OET & ECFMG Pathway Approved Before ERAS Program Download Date',
    tip: 'Many IMG-friendly programs filter out applications lacking verified ECFMG Pathway + OET status during initial October screening.',
  },
  {
    id: 'specialty_coherent_cv',
    title: 'CV & Personal Statement Tailored to One Primary Specialty',
    tip: 'Avoid mixing Cardiology, Surgery, and Psychiatry LoRs in the same ERAS assignment. Assign specialty-specific LoRs per program.',
  },
  {
    id: 'program_signaling_strategy',
    title: 'Program Signals Aligned with Visa Reality & YOG Cutoffs',
    tip: 'Never waste Gold/Silver ERAS signals on programs whose YOG cutoff (<3 yrs) or Visa policy (J-1 Only when you require H-1B) excludes your profile.',
  },
];

const INITIAL_PEER_STATS_CARDS = [
  {
    id: 'stats-1',
    authorName: 'Dr. K. Sharma (Non-US IMG)',
    targetSpecialty: 'Internal Medicine',
    step1: 'Pass (1st attempt)',
    step2Ck: '254',
    yog: '2024',
    usceMonths: '3 mo (2 Inpatient Hospital + 1 Clinic)',
    researchCount: '4 PubMed Indexed, 2 Posters',
    visaNeeded: 'J-1 / H-1B',
    question: 'Applying broadly to 130 IM programs in Northeast & Midwest. Should I use my Gold signals on university-affiliated community programs or reach academics?',
    peerFeedbackCount: 8,
  },
  {
    id: 'stats-2',
    authorName: 'Dr. L. Silva (Non-US IMG)',
    targetSpecialty: 'Pediatrics / Family Medicine',
    step1: 'Pass (1st attempt)',
    step2Ck: '239',
    yog: '2021 (YOG 5)',
    usceMonths: '4 mo Hands-on + Home Country Peds Residency',
    researchCount: '2 Case Reports',
    visaNeeded: 'J-1 Only',
    question: 'Completed home-country Pediatrics residency (no clinical gap). Targeting Holistic / YOG < 5 programs. Any advice on highlighting home-country chief resident experience?',
    peerFeedbackCount: 11,
  },
];

const INITIAL_TRAVEL_SWAP_CARDS = [
  {
    id: 'swap-1',
    authorName: 'Dr. R. Hassan',
    type: 'Mock Interview Partner',
    programOrCity: 'EST Timezone (Zoom / Virtual)',
    dates: 'Weeknights 7–9 PM EST',
    details: 'Looking for a dedicated daily 45-min STAR behavioral + clinical scenario mock interview partner for Internal Medicine interviews.',
  },
  {
    id: 'swap-2',
    authorName: 'Dr. M. Okafor',
    type: 'In-Person Social / Hotel Split',
    programOrCity: 'Chicago / Bronx Second-Look Week',
    dates: 'January 14–18',
    details: 'Attending two in-person program open houses in NY/NJ and Chicago. Happy to coordinate airport transit or split safe hotel accommodations near the hospital.',
  },
  {
    id: 'swap-3',
    authorName: 'Dr. T. Nguyen',
    type: 'Interview Date Swap Info',
    programOrCity: 'Midwest Community IM (Thalamus)',
    dates: 'Nov 18 ↔ Dec 4',
    details: 'Reminder: Use Thalamus waitlist & coordinator polite email 14+ days ahead if two virtual interviews overlap on the same morning.',
  },
];

export default function Community() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
  const [activePeerHubTab, setActivePeerHubTab] = useState('audit'); // 'audit' | 'stats' | 'swap'
  const [ugcVersion, setUgcVersion] = useState(0);

  // ERAS Red-Flag Self-Audit state
  const [checkedAuditIds, setCheckedAuditIds] = useState(() => {
    try {
      const saved = localStorage.getItem('matchamd_eras_audit_v1');
      return saved ? JSON.parse(saved) : ['yog_gap_explained', 'hospital_letterhead_lors'];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handler = () => setUgcVersion((v) => v + 1);
    window.addEventListener('matchamd-ugc-updated', handler);
    return () => window.removeEventListener('matchamd-ugc-updated', handler);
  }, []);

  const toggleAuditItem = (id) => {
    setCheckedAuditIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem('matchamd_eras_audit_v1', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const { user } = useAuth();

  const { data: profiles } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const { data: posts = [], isLoading, error: postsError, refetch } = useQuery({
    queryKey: ['posts', activeCategory, sortBy],
    queryFn: async () => {
      let remotePosts = [];
      try {
        let query = supabase.from('forum_posts').select('*');
        if (activeCategory !== 'all') {
          query = query.eq('category', activeCategory);
        }
        if (sortBy === 'recent') {
          query = query.order('created_date', { ascending: false });
        } else {
          query = query.order('likes_count', { ascending: false });
        }
        const { data, error } = await query;
        if (!error && data) remotePosts = data;
      } catch (e) {}

      let localPosts = [];
      try {
        localPosts = JSON.parse(localStorage.getItem('matchamd_local_posts') || '[]');
        if (activeCategory !== 'all') {
          localPosts = localPosts.filter(p => p.category === activeCategory);
        }
      } catch (e) {}

      return [...localPosts, ...remotePosts];
    },
    retry: 2,
    staleTime: 2 * 60 * 1000
  });

  const profile = profiles?.[0];

  const createPostMutation = useMutation({
    /** @param {any} postData */
    mutationFn: async (postData) => {
      const authorId = user?.id || 'guest_user';
      const authorName = profile?.display_name || user?.email || 'MatchaMD Member';

      const newRecord = {
        id: 'local_' + Date.now(),
        title: postData.title,
        content: postData.content,
        category: postData.category || 'general',
        author_id: authorId,
        author_name: authorName,
        author_avatar: profile?.avatar_url || '',
        is_mentor: profile?.mentor_verified || false,
        likes_count: 0,
        liked_by: [],
        comments_count: 0,
        created_date: new Date().toISOString()
      };

      if (user?.id) {
        try {
          const { error } = await supabase.from('forum_posts').insert({
            title: postData.title,
            content: postData.content,
            category: postData.category || 'general',
            author_id: user.id,
            author_name: authorName,
            author_avatar: profile?.avatar_url || '',
            is_mentor: profile?.mentor_verified || false,
            likes_count: 0,
            liked_by: [],
            comments_count: 0
          });
          if (error) console.warn('Database insert notice:', error.message);
        } catch (e) {}
      }

      // Local fallback
      try {
        const existing = JSON.parse(localStorage.getItem('matchamd_local_posts') || '[]');
        localStorage.setItem('matchamd_local_posts', JSON.stringify([newRecord, ...existing]));
      } catch (e) {}

      return newRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setIsCreateOpen(false);
      setNewPost({ title: '', content: '', category: 'general' });
      toast.success('Post created successfully!');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to post message');
    }
  });

  const likePostMutation = useMutation({
    /** @param {any} post */
    mutationFn: async (post) => {
      const currentUserId = user?.id || 'guest_user';
      const isLiked = post.liked_by?.includes(currentUserId);
      const newLikedBy = isLiked 
        ? post.liked_by.filter(id => id !== currentUserId)
        : [...(post.liked_by || []), currentUserId];
      
      if (user?.id && !post.id?.toString().startsWith('local_')) {
        try {
          await supabase.from('forum_posts').update({
            liked_by: newLikedBy,
            likes_count: newLikedBy.length
          }).eq('id', post.id);
        } catch (e) {}
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
  });

  // Filter out flagged content or blocked users (Google Play UGC compliance)
  const filteredPosts = posts.filter((post) => {
    if (isItemFlagged(post.id) || isUserBlocked(post.author_name) || isUserBlocked(post.author_id)) {
      return false;
    }
    return (
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const visibleStatsCards = INITIAL_PEER_STATS_CARDS.filter(
    (c) => !isItemFlagged(c.id) && !isUserBlocked(c.authorName)
  );
  const visibleSwapCards = INITIAL_TRAVEL_SWAP_CARDS.filter(
    (c) => !isItemFlagged(c.id) && !isUserBlocked(c.authorName)
  );

  // Void reference to ugcVersion so lint knows it triggers re-render
  void ugcVersion;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] pb-nav-safe transition-colors">
      <Header title="IMG Peer Hub & Community" />

      <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Structured Peer-Sharing Hub: ERAS Red-Flag Self-Audit, Peer Application Stats Review, Interview Travel/Swap Board */}
        <Card className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-emerald-500/30 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] dark:text-[#4ADE80] text-[11px] font-bold mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Structured IMG Peer Toolkit</span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Peer Audit, Stats Review & Interview Swap Board
              </h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(createPageUrl('ScamShield'))}
              className="border-[#F43F5E]/40 bg-[#F43F5E]/10 text-[#F43F5E] dark:text-rose-300 hover:bg-[#F43F5E]/20 rounded-xl text-xs font-bold gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Scam Shield
            </Button>
          </div>

          {/* 3 Structured Card Switcher Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-[#0F172A] p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setActivePeerHubTab('audit')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activePeerHubTab === 'audit'
                  ? 'bg-[#10B981] text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">ERAS Red-Flag Audit</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePeerHubTab('stats')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activePeerHubTab === 'stats'
                  ? 'bg-[#10B981] text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Peer Stats Review</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePeerHubTab('swap')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activePeerHubTab === 'swap'
                  ? 'bg-[#10B981] text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Plane className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Travel / Swap Board</span>
            </button>
          </div>

          {/* 1. ERAS Red-Flag Self-Audit Checklist */}
          {activePeerHubTab === 'audit' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  ERAS Red-Flag Self-Audit Checklist ({checkedAuditIds.length}/{ERAS_RED_FLAG_AUDIT_ITEMS.length} Verified Safe)
                </span>
                <span className="font-bold text-[#10B981] dark:text-[#4ADE80]">
                  {Math.round((checkedAuditIds.length / ERAS_RED_FLAG_AUDIT_ITEMS.length) * 100)}% Audited
                </span>
              </div>
              <div className="space-y-2">
                {ERAS_RED_FLAG_AUDIT_ITEMS.map((item) => {
                  const checked = checkedAuditIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleAuditItem(item.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        checked
                          ? 'bg-[#10B981]/10 border-[#10B981]/40'
                          : 'bg-slate-50 dark:bg-[#0F172A]/60 border-slate-200 dark:border-slate-800 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {checked ? (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981] dark:text-[#4ADE80]" />
                        ) : (
                          <Circle className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {item.tip}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Peer Application Stats Review */}
          {activePeerHubTab === 'stats' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Compare anonymous IMG stats & get constructive school-list feedback
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setNewPost({
                      title: '[Peer Stats Review] My IMG Profile & School List Strategy',
                      content: 'Target Specialty: \nStep 1: Pass | Step 2 CK: \nYOG: \nUSCE Months: \nVisa Needed: \nQuestions for Peers: ',
                      category: 'eras_tips',
                    });
                    setIsCreateOpen(true);
                  }}
                  className="bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold text-xs rounded-xl h-8"
                >
                  + Share My Stats
                </Button>
              </div>
              {visibleStatsCards.map((card) => (
                <div
                  key={card.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-800 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {card.authorName}
                    </span>
                    <Badge className="bg-[#10B981]/15 text-[#10B981] dark:text-[#4ADE80] border border-[#10B981]/30 text-xs">
                      {card.targetSpecialty}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200/70 dark:border-slate-700">
                      <span className="text-slate-400 block">Step 2 CK</span>
                      <strong className="text-slate-900 dark:text-white">{card.step2Ck}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200/70 dark:border-slate-700">
                      <span className="text-slate-400 block">YOG</span>
                      <strong className="text-amber-500">{card.yog}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200/70 dark:border-slate-700">
                      <span className="text-slate-400 block">Visa</span>
                      <strong className="text-[#10B981] dark:text-[#4ADE80]">{card.visaNeeded}</strong>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>USCE:</strong> {card.usceMonths} • <strong>Research:</strong> {card.researchCount}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-200 italic">
                    “{card.question}”
                  </p>
                  <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-[#10B981] dark:text-[#4ADE80] font-semibold">
                      💬 {card.peerFeedbackCount} Peer Reviews
                    </span>
                    <UGCSafetyMenu
                      itemId={card.id}
                      itemType="peer_stats_card"
                      title={card.authorName}
                      authorName={card.authorName}
                      authorId={card.authorName}
                      compact
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. Interview Travel/Swap Board */}
          {activePeerHubTab === 'swap' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Coordinate mock interviews, second-look travel splits & date swaps
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setNewPost({
                      title: '[Interview Travel / Swap Board] Looking to Coordinate',
                      content: 'Type (Mock Partner / Travel Split / Date Swap): \nSpecialty / City: \nDates: \nDetails: ',
                      category: 'interviews',
                    });
                    setIsCreateOpen(true);
                  }}
                  className="bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold text-xs rounded-xl h-8"
                >
                  + Post Request
                </Button>
              </div>
              {visibleSwapCards.map((card) => (
                <div
                  key={card.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-xs">
                      {card.type}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      🗓️ {card.dates}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {card.programOrCity} — <span className="text-[#10B981] dark:text-[#4ADE80]">{card.authorName}</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {card.details}
                  </p>
                  <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Verified IMG Peer Board</span>
                    <UGCSafetyMenu
                      itemId={card.id}
                      itemType="travel_swap_card"
                      title={card.programOrCity}
                      authorName={card.authorName}
                      authorId={card.authorName}
                      compact
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search discussions, visa tips, interview experiences..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-2xl bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin w-full">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#10B981] text-slate-950 shadow-md'
                  : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#10B981]/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <Tabs value={sortBy} onValueChange={setSortBy}>
            <TabsList className="bg-slate-200/70 dark:bg-[#1E293B] rounded-xl">
              <TabsTrigger value="recent" className="rounded-lg gap-1 text-xs">
                <Clock className="w-3.5 h-3.5" /> Recent
              </TabsTrigger>
              <TabsTrigger value="popular" className="rounded-lg gap-1 text-xs">
                <TrendingUp className="w-3.5 h-3.5" /> Popular
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold">
                <Plus className="w-4 h-4 mr-1.5" /> New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700">
              <DialogHeader>
                <DialogTitle>Create Community Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="rounded-xl"
                />
                <Select 
                  value={newPost.category} 
                  onValueChange={(v) => setNewPost({ ...newPost, category: v })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Share your question, tip, or experience..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="min-h-[150px] rounded-xl"
                />
                <Button 
                  onClick={() => createPostMutation.mutate(newPost)}
                  disabled={!newPost.title || !newPost.content}
                  className="w-full rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold"
                >
                  Publish Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Error State */}
        {postsError && (
          <ErrorState 
            title="Unable to Load Posts"
            message="We couldn't load community posts. Please try again."
            onRetry={refetch}
          />
        )}

        {/* Posts List */}
        {!postsError && (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.author_avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-[#10B981] to-[#059669] text-slate-950 font-bold">
                      {post.author_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-white truncate">
                        {post.author_name}
                      </span>
                      {post.is_mentor && (
                        <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                      {post.is_pinned && (
                        <Pin className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge className={categoryColors[post.category] || categoryColors.general}>
                    {categories.find(c => c.id === post.category)?.label || post.category}
                  </Badge>
                </div>

                {/* Content */}
                <button
                  onClick={() => navigate(createPageUrl(`PostDetail?id=${post.id}`))}
                  className="text-left w-full"
                >
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3">
                    {post.content}
                  </p>
                </button>

                {/* Actions + Google Play UGC Report/Block Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => likePostMutation.mutate(post)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${
                        post.liked_by?.includes(user?.id)
                          ? 'text-rose-500'
                          : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.liked_by?.includes(user?.id) ? 'fill-current' : ''}`} />
                      <span>{post.likes_count || 0}</span>
                    </button>
                    <button
                      onClick={() => navigate(createPageUrl(`PostDetail?id=${post.id}`))}
                      className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-[#10B981] transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments_count || 0}</span>
                    </button>
                  </div>

                  <UGCSafetyMenu
                    itemId={post.id}
                    itemType="forum_post"
                    title={post.title}
                    authorName={post.author_name || 'Anonymous IMG'}
                    authorId={post.author_id || post.author_name}
                    compact
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}

          {!isLoading && filteredPosts.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">No posts yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">Be the first to start a discussion!</p>
              <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl bg-[#10B981] text-slate-950 font-bold">
                Create Post
              </Button>
            </div>
          )}
        </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}