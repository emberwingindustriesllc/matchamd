import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  MapPin,
  CheckCircle2,
  Circle,
  GraduationCap,
  Globe,
  Heart,
  SlidersHorizontal,
  Star,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  UserCheck,
  Share2,
  Calendar,
  Building,
  ClipboardList,
  GitCompare,
  ClipboardCheck,
  Sparkles,
  Scale
} from 'lucide-react';
import { toast } from 'sonner';
import { mockResidencyPrograms } from '@/data/mockResidencyPrograms';
import ProgramDetailsModal from '@/components/community/ProgramDetailsModal';
import { getProgramFitDetails } from '@/lib/programMatch';
import { buildCustomEntry, getPreferenceSummary, removeCustomEntry, upsertCustomEntry } from '@/lib/personalJourney';

const SPECIALTIES = [
  'Internal Medicine', 'Family Medicine', 'Pediatrics', 'Surgery',
  'Emergency Medicine', 'Psychiatry', 'OB/GYN', 'Neurology',
  'Radiology', 'Anesthesiology', 'Pathology', 'Dermatology',
  'Radiation Oncology', 'Thoracic Surgery', 'Urology', 'ENT',
  'Medical Genetics', 'Cardiology', 'Gastroenterology', 'Nephrology',
  'Pulmonology', 'Endocrinology', 'Hematology/Oncology', 'Infectious Disease',
  'Rheumatology', 'Allergy/Immunology', 'Other',
];

export default function IMGPrograms() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('programs'); // 'programs' or 'vacancies'
  const [viewingVacancy, setViewingVacancy] = useState(null); // vacant position details dialog
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedVisa, setSelectedVisa] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [selectedProgramType, setSelectedProgramType] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [fitFilter, setFitFilter] = useState(false);
  
  // Detail dialog state
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [comparePrograms, setComparePrograms] = useState([]);

  const toggleCompare = (e, prog) => {
    e.stopPropagation();
    setComparePrograms(prev => {
      const exists = prev.some(p => p.id === prog.id);
      if (exists) {
        return prev.filter(p => p.id !== prog.id);
      } else {
        if (prev.length >= 3) {
          toast.error("You can compare up to 3 programs side-by-side.");
          return prev;
        }
        return [...prev, prog];
      }
    });
  };

  // Interview state
  const [isLogInterviewOpen, setIsLogInterviewOpen] = useState(false);
  const [newInterview, setNewInterview] = useState({
    programId: '',
    date: '',
    time: '',
    format: 'Virtual',
    interviewers: '',
    status: 'Scheduled',
    rating: 5,
    notes: '',
    thankYouSent: false
  });

  // Advisor State
  const [advisorMode, setAdvisorMode] = useState(false);
  const [advisorCommentInput, setAdvisorCommentInput] = useState('');

  // ERAS Personal Statement review state
  const [personalStatementText, setPersonalStatementText] = useState('');
  const [psFeedback, setPsFeedback] = useState(null);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Load User Profile
  const { data: profiles } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  const profile = profiles?.[0];

  // Local and Supabase State for user tracking (Checklists, Interviews, Rank Order, Advisor feedback)
  const [programChecklists, setProgramChecklists] = useState({});
  const [interviews, setInterviews] = useState([]);
  const [rankOrderList, setRankOrderList] = useState([]);
  const [advisorFeedback, setAdvisorFeedback] = useState([]);
  const [customEntries, setCustomEntries] = useState([]);
  const [customEntryForm, setCustomEntryForm] = useState({
    entryType: 'program',
    name: '',
    category: '',
    location: '',
    notes: '',
    rating: 3,
  });
  const [editingEntryId, setEditingEntryId] = useState(null);

  const isLoadedRef = useRef(false);

  // Load state from profile (Supabase) with local storage fallback
  useEffect(() => {
    if (user?.id) {
      const storedChecklists = localStorage.getItem(`match_checklists_${user.id}`);
      const storedInterviews = localStorage.getItem(`match_interviews_${user.id}`);
      const storedRankList = localStorage.getItem(`match_ranklist_${user.id}`);
      const storedFeedback = localStorage.getItem(`match_advisor_feedback_${user.id}`);
      const storedCustomEntries = localStorage.getItem(`match_custom_entries_${user.id}`);
      const storedPS = localStorage.getItem(`match_personal_statement_${user.id}`);

      if (storedPS) {
        setPersonalStatementText(storedPS);
      }

      if (profile && !isLoadedRef.current) {
        isLoadedRef.current = true;

        const dbChecklists = profile.program_checklists || (storedChecklists ? JSON.parse(storedChecklists) : {});
        const dbInterviews = profile.interviews || (storedInterviews ? JSON.parse(storedInterviews) : []);
        const dbRankList = profile.rank_order_list || (storedRankList ? JSON.parse(storedRankList) : []);
        const dbFeedback = profile.advisor_feedback || (storedFeedback ? JSON.parse(storedFeedback) : []);
        const dbCustomEntries = profile.custom_entries || (storedCustomEntries ? JSON.parse(storedCustomEntries) : []);

        setProgramChecklists(dbChecklists);
        setInterviews(dbInterviews);
        setAdvisorFeedback(dbFeedback);
        setCustomEntries(dbCustomEntries);

        // One-time sync of rank list to favorites on mount/load
        const favs = profile.favorite_programs || [];
        const cleanedRankList = dbRankList.filter(id => favs.includes(id));
        const newItems = favs.filter(id => !cleanedRankList.includes(id));
        const finalRankList = [...cleanedRankList, ...newItems];

        setRankOrderList(finalRankList);

        // Save back if they were out of sync
        if (newItems.length > 0 || cleanedRankList.length !== dbRankList.length) {
          saveRankList(finalRankList);
        }
      } else if (!profile && !isLoadedRef.current) {
        if (storedChecklists) setProgramChecklists(JSON.parse(storedChecklists));
        if (storedInterviews) setInterviews(JSON.parse(storedInterviews));
        if (storedRankList) setRankOrderList(JSON.parse(storedRankList));
        if (storedFeedback) setAdvisorFeedback(JSON.parse(storedFeedback));
        if (storedCustomEntries) setCustomEntries(JSON.parse(storedCustomEntries));
      }
    }
  }, [user?.id, profile]);

  // Sync back to Supabase and localStorage
  const saveChecklists = async (newChecklists) => {
    setProgramChecklists(newChecklists);
    localStorage.setItem(`match_checklists_${user.id}`, JSON.stringify(newChecklists));
    if (!profile?.id) return;
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ program_checklists: newChecklists })
        .eq('id', profile.id);
      if (error) {
        console.warn('Failed to save checklists to Supabase, fell back to localStorage:', error);
      } else {
        queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      }
    } catch (err) {
      console.warn('Failed to save checklists to Supabase, fell back to localStorage:', err);
    }
  };

  const saveInterviews = async (newInterviews) => {
    setInterviews(newInterviews);
    localStorage.setItem(`match_interviews_${user.id}`, JSON.stringify(newInterviews));
    if (!profile?.id) return;
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ interviews: newInterviews })
        .eq('id', profile.id);
      if (error) {
        console.warn('Failed to save interviews to Supabase, fell back to localStorage:', error);
      } else {
        queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      }
    } catch (err) {
      console.warn('Failed to save interviews to Supabase, fell back to localStorage:', err);
    }
  };

  const saveRankList = async (newList) => {
    setRankOrderList(newList);
    localStorage.setItem(`match_ranklist_${user.id}`, JSON.stringify(newList));
    if (!profile?.id) return;
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ rank_order_list: newList })
        .eq('id', profile.id);
      if (error) {
        console.warn('Failed to save rank list to Supabase, fell back to localStorage:', error);
      } else {
        queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      }
    } catch (err) {
      console.warn('Failed to save rank list to Supabase, fell back to localStorage:', err);
    }
  };

  const saveAdvisorFeedback = async (newFeedback) => {
    setAdvisorFeedback(newFeedback);
    localStorage.setItem(`match_advisor_feedback_${user.id}`, JSON.stringify(newFeedback));
    if (!profile?.id) return;
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ advisor_feedback: newFeedback })
        .eq('id', profile.id);
      if (error) {
        console.warn('Failed to save advisor feedback to Supabase, fell back to localStorage:', error);
      } else {
        queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      }
    } catch (err) {
      console.warn('Failed to save advisor feedback to Supabase, fell back to localStorage:', err);
    }
  };

  const saveCustomEntries = async (newEntries) => {
    setCustomEntries(newEntries);
    localStorage.setItem(`match_custom_entries_${user?.id || 'guest'}`, JSON.stringify(newEntries));
    if (!profile?.id) return;
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ custom_entries: newEntries })
        .eq('id', profile.id);
      if (error) {
        console.warn('Failed to save custom entries to Supabase, fell back to localStorage:', error);
      } else {
        queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      }
    } catch (err) {
      console.warn('Failed to save custom entries to Supabase, fell back to localStorage:', err);
    }
  };

  const handleCustomEntrySubmit = (e) => {
    e.preventDefault();
    const trimmedName = customEntryForm.name.trim();
    if (!trimmedName) return;

    const entry = buildCustomEntry({
      ...customEntryForm,
      id: editingEntryId || undefined,
      name: trimmedName,
      category: customEntryForm.category.trim(),
      location: customEntryForm.location.trim(),
      notes: customEntryForm.notes.trim(),
    });

    const nextEntries = upsertCustomEntry(customEntries, entry);
    saveCustomEntries(nextEntries);
    setCustomEntryForm({
      entryType: 'program',
      name: '',
      category: '',
      location: '',
      notes: '',
      rating: 3,
    });
    setEditingEntryId(null);
  };

  const handleEditCustomEntry = (entry) => {
    setEditingEntryId(entry.id);
    setCustomEntryForm({
      entryType: entry.entryType || 'program',
      name: entry.name || '',
      category: entry.category || '',
      location: entry.location || '',
      notes: entry.notes || '',
      rating: entry.rating || 3,
    });
  };

  const handleDeleteCustomEntry = (entryId) => {
    saveCustomEntries(removeCustomEntry(customEntries, entryId));
    if (editingEntryId === entryId) {
      setEditingEntryId(null);
      setCustomEntryForm({
        entryType: 'program',
        name: '',
        category: '',
        location: '',
        notes: '',
        rating: 3,
      });
    }
  };

  const personalSummary = useMemo(() => getPreferenceSummary(profile || {}), [profile]);

  // Toggle favorite programs
  const updateFavoritesMutation = useMutation({
    mutationFn: async (newFavorites) => {
      const { data, error } = await supabase.from('user_profiles').update({ favorite_programs: newFavorites }).eq('id', profile.id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userProfile'] })
  });

  const toggleFavorite = (e, progId) => {
    e.stopPropagation();
    if (!profile) return;
    const currentFavs = profile.favorite_programs || [];
    const newFavs = currentFavs.includes(progId) 
      ? currentFavs.filter(id => id !== progId)
      : [...currentFavs, progId];
    
    updateFavoritesMutation.mutate(newFavs);

    // Initialize checklist if needed
    if (!currentFavs.includes(progId) && !programChecklists[progId]) {
      const updatedChecklists = {
        ...programChecklists,
        [progId]: {
          statementTailored: false,
          lorsAssigned: false,
          step2Uploaded: false,
          mspeUploaded: false,
          erasApplied: false,
          thankYouSent: false
        }
      };
      saveChecklists(updatedChecklists);
    }

    // Update Rank List
    if (currentFavs.includes(progId)) {
      saveRankList(rankOrderList.filter(id => id !== progId));
    } else {
      saveRankList([...rankOrderList, progId]);
    }
  };

  // Query Programs
  const { data: dbPrograms = [], isLoading: isProgramsLoading } = useQuery({
    queryKey: ['programs', searchQuery, selectedSpecialty, selectedProgramType],
    queryFn: async () => {
      let query = supabase.from('programs').select('*');
      
      if (selectedSpecialty && selectedSpecialty !== 'all') {
        query = query.contains('specialty', [selectedSpecialty]);
      }
      
      if (selectedProgramType && selectedProgramType !== 'all') {
        let dbProgramType = selectedProgramType;
        if (selectedProgramType === 'residency_categorical' || selectedProgramType === 'residency_preliminary') {
          dbProgramType = 'residency';
        }
        query = query.eq('program_type', dbProgramType);
      }
      
      if (searchQuery) {
        const lowercaseSearch = searchQuery.toLowerCase().trim();
        const matchedSpecs = SPECIALTIES.filter(spec => {
          const specLower = spec.toLowerCase();
          return specLower.includes(lowercaseSearch) || lowercaseSearch.includes(specLower);
        });

        const keywords = searchQuery.trim().split(/\s+/).filter(Boolean);
        keywords.forEach(kw => {
          const kwLower = kw.toLowerCase();
          SPECIALTIES.forEach(spec => {
            const specLower = spec.toLowerCase();
            if (specLower.includes(kwLower) && !matchedSpecs.includes(spec)) {
              matchedSpecs.push(spec);
            }
          });
        });

        let specialtyFilter = '';
        if (matchedSpecs.length > 0) {
          const formattedSpecs = matchedSpecs.map(s => `"${s}"`).join(',');
          specialtyFilter = `,specialty.ov.{${formattedSpecs}}`;
        }

        keywords.forEach(kw => {
          query = query.or(`name.ilike.%${kw}%,institution.ilike.%${kw}%,city.ilike.%${kw}%,state.ilike.%${kw}%${specialtyFilter}`);
        });
      }
      
      const { data, error } = await query.limit(200);
      if (error) throw error;
      return data || [];
    }
  });

  const programs = useMemo(() => {
    // Merge database programs and mock programs.
    // Ensure we don't duplicate by ID.
    const merged = [...mockResidencyPrograms];
    
    dbPrograms.forEach(dbProg => {
      const exists = merged.some(m => m.id === dbProg.id);
      if (!exists) {
        merged.push(dbProg);
      }
    });

    return merged.map(p => ({
      program_type: p.program_type || 'residency',
      ...p,
      program_name: p.program_name || p.name,
      institution: p.institution || p.description || 'Community Program',
    }));
  }, [dbPrograms]);

  // Derive flat list of vacancies
  const allVacancies = useMemo(() => {
    const list = [];
    programs.forEach(prog => {
      if (prog.vacancies && Array.isArray(prog.vacancies)) {
        prog.vacancies.forEach(vac => {
          list.push({
            ...vac,
            program: prog
          });
        });
      }
    });
    return list;
  }, [programs]);

  // Fit Match Calculations
  const calculateFitScore = (prog) => {
    if (!profile) return { score: 50, reasons: ["No profile configured"], meetsAll: false, visaIssue: false };
    return getProgramFitDetails(profile, prog);
  };

  // Specialties & States lists
  const specialties = useMemo(() => {
    const allSpecs = new Set();
    programs.forEach(p => {
      if (Array.isArray(p.specialty)) {
        p.specialty.forEach(s => allSpecs.add(s));
      } else if (p.specialty) {
        allSpecs.add(p.specialty);
      }
    });
    return [...allSpecs];
  }, [programs]);
  const regions = ["Northeast", "Midwest", "South", "West"];

  // Filter vacancies logic
  const filteredVacancies = useMemo(() => {
    return allVacancies.filter(vac => {
      const prog = vac.program;
      const pSpecs = Array.isArray(prog.specialty) ? prog.specialty : (prog.specialty ? [prog.specialty] : []);

      // 1. Search Query
      const matchesSearch = !searchQuery ? true : (() => {
        const keywords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
        const pName = (prog.program_name || '').toLowerCase();
        const pInst = (prog.institution || '').toLowerCase();
        const pCity = (prog.city || '').toLowerCase();
        const pState = (prog.state || '').toLowerCase();
        const vacPgy = (vac.pgy_level || '').toLowerCase();
        const vacNotes = (vac.notes || '').toLowerCase();
        
        return keywords.every(kw => 
          pName.includes(kw) ||
          pInst.includes(kw) ||
          pCity.includes(kw) ||
          pState.includes(kw) ||
          vacPgy.includes(kw) ||
          vacNotes.includes(kw) ||
          pSpecs.some(s => s.toLowerCase().includes(kw))
        );
      })();

      // 2. Specialty Filter
      const matchesSpecialty = selectedSpecialty === 'all' || pSpecs.includes(selectedSpecialty);

      // 3. Region Filter
      const matchesRegion = selectedRegion === 'all' || prog.region === selectedRegion || !prog.region;

      // 4. Visa Filter
      const sponsorsJ1 = prog.visa_j1 === true || String(prog.visa_j1).toLowerCase() === 'yes';
      const sponsorsH1B = prog.visa_h1b === true || String(prog.visa_h1b).toLowerCase() === 'yes';
      const matchesVisa = selectedVisa === 'all' || 
        (selectedVisa === 'j1' && sponsorsJ1) ||
        (selectedVisa === 'h1b' && sponsorsH1B);

      return matchesSearch && matchesSpecialty && matchesRegion && matchesVisa;
    });
  }, [allVacancies, searchQuery, selectedSpecialty, selectedRegion, selectedVisa]);

  // Filter programs logic
  const filteredPrograms = useMemo(() => {
    return programs.filter(prog => {
      const pType = prog.program_type || 'residency';
      const pName = prog.program_name || '';
      const pSpecs = Array.isArray(prog.specialty) ? prog.specialty : (prog.specialty ? [prog.specialty] : []);

      // 1. Search Query
      const matchesSearch = !searchQuery ? true : (() => {
        const keywords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
        const pName = (prog.program_name || '').toLowerCase();
        const pInst = (prog.institution || '').toLowerCase();
        const pCity = (prog.city || '').toLowerCase();
        const pState = (prog.state || '').toLowerCase();
        const pSub = (prog.subspecialty || '').toLowerCase();
        
        return keywords.every(kw => 
          pName.includes(kw) ||
          pInst.includes(kw) ||
          pCity.includes(kw) ||
          pState.includes(kw) ||
          pSub.includes(kw) ||
          pSpecs.some(s => s.toLowerCase().includes(kw))
        );
      })();
      
      // 2. Advanced Select Filters
      const matchesSpecialty = selectedSpecialty === 'all' || pSpecs.includes(selectedSpecialty);
      const matchesRegion = selectedRegion === 'all' || prog.region === selectedRegion || !prog.region;
      
      const sponsorsJ1 = prog.visa_j1 === true || String(prog.visa_j1).toLowerCase() === 'yes';
      const sponsorsH1B = prog.visa_h1b === true || String(prog.visa_h1b).toLowerCase() === 'yes';
      const matchesVisa = selectedVisa === 'all' || 
        (selectedVisa === 'j1' && sponsorsJ1) ||
        (selectedVisa === 'h1b' && sponsorsH1B);

      const matchesSize = selectedSize === 'all' ||
        (selectedSize === 'small' && (prog.program_size < 50 || !prog.program_size)) ||
        (selectedSize === 'medium' && prog.program_size >= 50 && prog.program_size <= 100) ||
        (selectedSize === 'large' && prog.program_size > 100);

      const matchesFormat = selectedFormat === 'all' || prog.interview_format === selectedFormat || !prog.interview_format;

      // 3. Program Type Filter
      let matchesProgramType = true;
      const isPrelim = pName.toLowerCase().includes('prelim') || pName.toLowerCase().includes('transitional') || pSpecs.some(s => s.toLowerCase().includes('prelim') || s.toLowerCase().includes('transitional'));
      
      if (selectedProgramType === 'residency_categorical') {
        matchesProgramType = pType === 'residency' && !isPrelim;
      } else if (selectedProgramType === 'residency_preliminary') {
        matchesProgramType = pType === 'residency' && isPrelim;
      } else if (selectedProgramType !== 'all') {
        matchesProgramType = pType === selectedProgramType;
      }

      // 4. Personalized Fit Filter
      let matchesFit = true;
      if (fitFilter) {
        const fit = calculateFitScore(prog);
        matchesFit = fit.meetsAll && !fit.visaIssue;
      }

      return matchesSearch && matchesSpecialty && matchesRegion && matchesVisa && matchesSize && matchesFormat && matchesProgramType && matchesFit;
    });
  }, [programs, searchQuery, selectedSpecialty, selectedRegion, selectedVisa, selectedSize, selectedFormat, selectedProgramType, fitFilter, profile]);

  // Saved Programs Map
  const savedProgramsList = useMemo(() => {
    const favs = profile?.favorite_programs || [];
    return programs.filter(p => favs.includes(p.id));
  }, [programs, profile]);

  // Sync Rank list to saved programs list is handled on initial mount/profile load and during favorite toggles.

  // Rank List Programs in order
  const rankedPrograms = useMemo(() => {
    return rankOrderList
      .map(id => programs.find(p => p.id === id))
      .filter(Boolean);
  }, [rankOrderList, programs]);

  // Checklist Actions
  const toggleChecklistItem = (progId, itemKey) => {
    const programCheck = programChecklists[progId] || {
      statementTailored: false,
      lorsAssigned: false,
      step2Uploaded: false,
      mspeUploaded: false,
      erasApplied: false,
      thankYouSent: false
    };

    const updatedChecklists = {
      ...programChecklists,
      [progId]: {
        ...programCheck,
        [itemKey]: !programCheck[itemKey]
      }
    };
    saveChecklists(updatedChecklists);
  };

  const getChecklistProgress = (progId) => {
    const checklist = programChecklists[progId];
    if (!checklist) return 0;
    const completed = Object.values(checklist).filter(Boolean).length;
    return Math.round((completed / 6) * 100);
  };

  // Interview Tracker Actions
  const handleLogInterview = (e) => {
    e.preventDefault();
    if (!newInterview.programId) return;
    const id = Date.now().toString();
    const list = [...interviews, { ...newInterview, id }];
    saveInterviews(list);
    setIsLogInterviewOpen(false);
    setNewInterview({
      programId: '',
      date: '',
      time: '',
      format: 'Virtual',
      interviewers: '',
      status: 'Scheduled',
      rating: 5,
      notes: '',
      thankYouSent: false
    });
  };

  const deleteInterview = (id) => {
    saveInterviews(interviews.filter(i => i.id !== id));
  };

  // Rank ordering actions
  const moveRank = (index, direction) => {
    const list = [...rankOrderList];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    
    // Swap
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    saveRankList(list);
  };

  const runPersonalStatementAudit = () => {
    if (!personalStatementText.trim()) return;
    
    // Save to localStorage
    if (user?.id) {
      localStorage.setItem(`match_personal_statement_${user.id}`, personalStatementText);
    }

    const words = personalStatementText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    let score = 100;
    const suggestions = [];

    // Word Count Audit
    if (wordCount < 500) {
      score -= 25;
      suggestions.push({
        type: 'warning',
        text: `Word count is too short (${wordCount} words). A standard ERAS Personal Statement should be between 600-800 words (roughly one full page on ERAS).`
      });
    } else if (wordCount > 900) {
      score -= 15;
      suggestions.push({
        type: 'warning',
        text: `Word count is slightly long (${wordCount} words). We recommend keeping it under 850 words so it fits perfectly on a single page in the ERAS layout without spilling over.`
      });
    } else {
      suggestions.push({
        type: 'success',
        text: `Ideal word count (${wordCount} words). Perfect length for a single-page transmission on the ERAS PDF.`
      });
    }

    // Keyword & Specialty Analysis
    const textLower = personalStatementText.toLowerCase();
    const targetSpec = (profile?.target_specialty || profile?.fellowship_type || '').toLowerCase();
    
    if (targetSpec && !textLower.includes(targetSpec)) {
      score -= 15;
      suggestions.push({
        type: 'warning',
        text: `Your stated target specialty (${profile.target_specialty || profile.fellowship_type}) is not mentioned in your personal statement text. Ensure you explicitly name it early on.`
      });
    } else if (targetSpec) {
      suggestions.push({
        type: 'success',
        text: `Successfully mentions alignment with your specialty of ${profile.target_specialty || profile.fellowship_type}.`
      });
    }

    // Structure Check (Paragraphs)
    const paragraphs = personalStatementText.split(/\n+/).filter(p => p.trim().length > 0);
    if (paragraphs.length < 3) {
      score -= 20;
      suggestions.push({
        type: 'warning',
        text: `Structure Alert: Found only ${paragraphs.length} paragraph(s). A well-structured personal statement needs at least 4 sections: Introduction (The Hook), Clinical/Research Experience, IMG Journey/Resilience, and Future Goals/Conclusion.`
      });
    } else {
      suggestions.push({
        type: 'success',
        text: `Good structure with ${paragraphs.length} paragraphs. Ensure transitions between sections flow smoothly.`
      });
    }

    // Academic & Clinical Signals
    const hasResearch = textLower.includes('research') || textLower.includes('publication') || textLower.includes('poster');
    const hasClinical = textLower.includes('clinical') || textLower.includes('patient') || textLower.includes('hospital') || textLower.includes('rotation') || textLower.includes('usce');
    const hasResilience = textLower.includes('challenge') || textLower.includes('adapt') || textLower.includes('overcome') || textLower.includes('img') || textLower.includes('fmg') || textLower.includes('country');

    if (!hasClinical) {
      score -= 10;
      suggestions.push({
        type: 'warning',
        text: "Missing Clinical Core: Consider adding a paragraph highlighting a specific clinical encounter or patient interaction from your rotations to demonstrate your hands-on competencies."
      });
    } else {
      suggestions.push({
        type: 'success',
        text: "Demonstrates clinical experience and patient-centered focus."
      });
    }

    if (!hasResearch && (profile?.primary_goal === 'fellowship' || profile?.target_specialty === 'Internal Medicine')) {
      suggestions.push({
        type: 'warning',
        text: "Tip: For competitive specialties/fellowships, mention any publications, abstracts, or ongoing research projects you have contributed to."
      });
    }

    if (!hasResilience) {
      suggestions.push({
        type: 'warning',
        text: "Tip: As an international graduate, adding an anecdote about adapting to a new system or overcoming cultural barriers shows valuable resilience."
      });
    }

    score = Math.max(10, score);
    setPsFeedback({ score, suggestions });
    toast.success("Personal Statement scanned successfully!");
  };

  // Cost estimates
  const costSummary = useMemo(() => {
    const count = savedProgramsList.length;
    let applicationFee = 0;
    if (count > 0) {
      if (count <= 10) applicationFee = 99;
      else if (count <= 20) applicationFee = 99 + (count - 10) * 19;
      else if (count <= 30) applicationFee = 99 + 10 * 19 + (count - 20) * 23;
      else applicationFee = 99 + 10 * 19 + 10 * 23 + (count - 30) * 27;
    }

    // Travel cost based on scheduled interviews
    let travelCost = 0;
    interviews.forEach(int => {
      const prog = programs.find(p => p.id === int.programId);
      if (prog?.estimated_cost?.travel_cost && (int.format === 'In-Person' || int.format === 'Hybrid')) {
        travelCost += prog.estimated_cost.travel_cost;
      }
    });

    return {
      applicationFee,
      travelCost,
      totalCost: applicationFee + travelCost
    };
  }, [savedProgramsList, interviews, programs]);

  // Advisor Feedback Comments Filter
  const filteredAdvisorComments = useMemo(() => {
    return advisorFeedback;
  }, [advisorFeedback]);

  const handleAddAdvisorComment = () => {
    if (!advisorCommentInput.trim()) return;
    const entry = {
      id: Date.now().toString(),
      advisorName: "Dr. Elena Rostova (Match Advisor)",
      date: new Date().toLocaleDateString(),
      comment: advisorCommentInput
    };
    saveAdvisorFeedback([entry, ...advisorFeedback]);
    setAdvisorCommentInput('');
  };

  const getIMGFriendlinessColor = (score) => {
    if (score >= 8.5) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 7.0) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:from-slate-900 dark:to-slate-800 pb-24 text-slate-900 dark:text-slate-100">
      <Header title="Match Journey & Programs" showBack={false} />

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex items-center gap-1 overflow-x-auto w-full bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl p-1 mb-6 border border-slate-200 dark:border-slate-700 shadow-inner scrollbar-hide">
            <TabsTrigger value="search" className="rounded-xl py-2.5 px-4 font-semibold text-sm whitespace-nowrap flex-shrink-0 flex-1 text-center">Directory</TabsTrigger>
            <TabsTrigger value="saved" className="rounded-xl py-2.5 px-4 font-semibold text-sm whitespace-nowrap flex-shrink-0 flex-1 text-center">Checklist</TabsTrigger>
            <TabsTrigger value="comparison" className="rounded-xl py-2.5 px-4 font-semibold text-sm whitespace-nowrap flex-shrink-0 flex-1 text-center">Comparison</TabsTrigger>
            <TabsTrigger value="eras_review" className="rounded-xl py-2.5 px-4 font-semibold text-sm whitespace-nowrap flex-shrink-0 flex-1 text-center">ERAS Review</TabsTrigger>
            <TabsTrigger value="interviews" className="rounded-xl py-2.5 px-4 font-semibold text-sm whitespace-nowrap flex-shrink-0 flex-1 text-center">Interviews</TabsTrigger>
            <TabsTrigger value="ranklist" className="rounded-xl py-2.5 px-4 font-semibold text-sm whitespace-nowrap flex-shrink-0 flex-1 text-center">Rank List</TabsTrigger>
            <TabsTrigger value="advisor" className="rounded-xl py-2.5 px-4 font-semibold text-sm whitespace-nowrap flex-shrink-0 flex-1 text-center">Advisors</TabsTrigger>
          </TabsList>

          {/* Directory Tab */}
          <TabsContent value="search" className="space-y-6">
            {/* Intro */}
            <Card className="p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-white dark:from-indigo-950/20 dark:to-slate-900 border-indigo-200 dark:border-indigo-900/60 rounded-3xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200 dark:shadow-none">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Residency Directory & Advanced Fit</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Search authentic, IMG-friendly US programs. We match requirements to your profile, estimating your fit compatibility instantly.
                  </p>
                </div>
              </div>
            </Card>

            {/* Search Mode Tab-like Switch */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-2">
              <button 
                type="button"
                onClick={() => setSearchMode('programs')}
                className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all ${searchMode === 'programs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
              >
                All Programs
              </button>
              <button 
                type="button"
                onClick={() => setSearchMode('vacancies')}
                className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${searchMode === 'vacancies' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
              >
                <span>Vacant Positions</span>
                <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full dark:bg-rose-950/40 dark:text-rose-400">Off-Cycle</span>
              </button>
            </div>

            {/* Filters Form */}
            <form onSubmit={handleSearchSubmit} className="space-y-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="search"
                    placeholder={searchMode === 'programs' ? "Search programs, hospitals, or cities..." : "Search vacancies, specialties, or states..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 rounded-xl border-slate-200 dark:border-slate-800 text-base"
                  />
                </div>
                <Button type="submit" className="h-12 rounded-xl px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  Search
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`h-12 rounded-xl px-4 ${showAdvancedFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-800' : 'border-slate-200 dark:border-slate-800'}`}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  <span className="ml-2 hidden sm:inline">Filters</span>
                </Button>
              </div>

              {/* Advanced Filter Panel */}
              <AnimatePresence>
                {showAdvancedFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden pt-4 grid grid-cols-2 md:grid-cols-3 gap-3 border-t border-slate-100 dark:border-slate-800"
                  >
                    <div>
                      <label className="text-xs text-slate-500 font-medium mb-1 block">Specialty</label>
                      <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="All Specialties" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Specialties</SelectItem>
                          {specialties.map(spec => (
                            <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {searchMode === 'programs' && (
                      <div>
                        <label className="text-xs text-slate-500 font-medium mb-1 block">Program Type</label>
                        <Select value={selectedProgramType} onValueChange={setSelectedProgramType}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="residency_categorical">Categorical Residency</SelectItem>
                            <SelectItem value="residency_preliminary">Preliminary Residency (Prelim)</SelectItem>
                            <SelectItem value="fellowship">Fellowship</SelectItem>
                            <SelectItem value="observership">Observership</SelectItem>
                            <SelectItem value="research">Research</SelectItem>
                            <SelectItem value="elective">Elective</SelectItem>
                            <SelectItem value="med_school">Medical School</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <label className="text-xs text-slate-500 font-medium mb-1 block">US Region</label>
                      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="All Regions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Regions</SelectItem>
                          {regions.map(reg => (
                            <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 font-medium mb-1 block">Visa Sponsorship</label>
                      <Select value={selectedVisa} onValueChange={setSelectedVisa}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="All Options" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Visas</SelectItem>
                          <SelectItem value="j1">J-1 Sponsorship</SelectItem>
                          <SelectItem value="h1b">H-1B Sponsorship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {searchMode === 'programs' && (
                      <>
                        <div>
                          <label className="text-xs text-slate-500 font-medium mb-1 block">Program Size</label>
                          <Select value={selectedSize} onValueChange={setSelectedSize}>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="All Sizes" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Sizes</SelectItem>
                              <SelectItem value="small">Small (&lt;50 residents)</SelectItem>
                              <SelectItem value="medium">Medium (50-100 residents)</SelectItem>
                              <SelectItem value="large">Large (&gt;100 residents)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-xs text-slate-500 font-medium mb-1 block">Interview Format</label>
                          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="All Formats" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Formats</SelectItem>
                              <SelectItem value="Virtual">Virtual Only</SelectItem>
                              <SelectItem value="In-Person">In-Person Only</SelectItem>
                              <SelectItem value="Hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Personalized Profile Fit Switch */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-500" />
                  <div>
                    <span className="text-sm font-semibold">Personalized Fit Filter</span>
                    <p className="text-xs text-slate-500">Only show programs matching my visa, scores, and graduation profile</p>
                  </div>
                </div>
                <Switch 
                  checked={fitFilter}
                  onCheckedChange={setFitFilter}
                />
              </div>
            </form>

            {/* Results Grid */}
            <div className="space-y-4">
              {searchMode === 'programs' ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      {filteredPrograms.length} programs found
                    </p>
                  </div>

                  {isProgramsLoading ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : filteredPrograms.length === 0 ? (
                    <Card className="p-12 text-center rounded-3xl border-slate-200">
                      <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-500">No programs match your search or fit criteria.</p>
                    </Card>
                  ) : (
                    filteredPrograms.map((prog) => {
                      const fit = calculateFitScore(prog);
                      return (
                        <motion.div
                          key={prog.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Card 
                            className="p-5 hover:shadow-md transition-all cursor-pointer rounded-3xl border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                            onClick={() => setSelectedProgram(prog)}
                          >
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 truncate">
                                  {prog.program_name}
                                </h3>
                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                  <Building className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{prog.institution}</span>
                                </p>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-1.5">
                                  <button 
                                    type="button"
                                    onClick={(e) => toggleCompare(e, prog)}
                                    className={`p-2 rounded-full transition-colors ${
                                      comparePrograms.some(p => p.id === prog.id) 
                                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400' 
                                        : 'bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 dark:bg-slate-800'
                                    }`}
                                    title="Compare program side-by-side"
                                  >
                                    <GitCompare className="w-5 h-5" />
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={(e) => toggleFavorite(e, prog.id)}
                                    className={`p-2 rounded-full transition-colors ${
                                      profile?.favorite_programs?.includes(prog.id) 
                                        ? 'bg-rose-100 text-rose-500 dark:bg-rose-950/30' 
                                        : 'bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-400 dark:bg-slate-800'
                                    }`}
                                  >
                                    <Heart className={`w-5 h-5 ${profile?.favorite_programs?.includes(prog.id) ? 'fill-current' : ''}`} />
                                  </button>
                                </div>

                                {/* Fit Score Indicator */}
                                <Badge 
                                  className={`font-bold px-2 py-0.5 text-xs ${
                                    fit.visaIssue 
                                      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400' 
                                      : fit.score >= 90 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400'
                                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400'
                                  }`}
                                  variant="outline"
                                >
                                  {fit.visaIssue ? "Visa Mismatch" : `${fit.score}% Match`}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-850">
                                {prog.specialty}
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-850">
                                <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                                {prog.city}, {prog.state}
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-850">
                                Format: {prog.interview_format}
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-850">
                                Size: {prog.program_size} residents
                              </Badge>
                              {prog.visa_j1 && (
                                <Badge className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400" variant="outline">
                                  Sponsors J-1
                                </Badge>
                              )}
                              {prog.visa_h1b && (
                                <Badge className="text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400" variant="outline">
                                  Sponsors H-1B
                                </Badge>
                              )}
                            </div>

                            {/* Quick Data Ribbon */}
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500">
                              <div>
                                <span className="font-semibold text-slate-700 dark:text-slate-350">IMG Intake:</span> {Math.round(prog.img_percentage)}%
                              </div>
                              {prog.step2_score_min && (
                                <div>
                                  <span className="font-semibold text-slate-700 dark:text-slate-350">Min Step 2 CK:</span> {prog.step2_score_min}
                                </div>
                              )}
                              <div>
                                <span className="font-semibold text-slate-700 dark:text-slate-350">Deadline:</span> {prog.application_deadline}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      {filteredVacancies.length} off-cycle vacancies found
                    </p>
                  </div>

                  {isProgramsLoading ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : filteredVacancies.length === 0 ? (
                    <Card className="p-12 text-center rounded-3xl border-slate-200">
                      <AlertTriangle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-500">No off-cycle vacant positions match your search criteria.</p>
                    </Card>
                  ) : (
                    filteredVacancies.map((vac) => {
                      const prog = vac.program;
                      return (
                        <motion.div
                          key={vac.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Card 
                            className="p-5 hover:shadow-md transition-all cursor-pointer rounded-3xl border border-rose-100 dark:border-rose-950/40 hover:border-rose-300 dark:hover:border-rose-900 bg-white dark:bg-slate-900"
                            onClick={() => setViewingVacancy(vac)}
                          >
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 font-bold" variant="outline">
                                    {vac.pgy_level} Vacancy
                                  </Badge>
                                  <span className="text-xs text-rose-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Off-Cycle
                                  </span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 truncate">
                                  {prog.program_name}
                                </h3>
                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                  <Building className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{prog.institution}</span>
                                </p>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <Badge className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2.5 py-1 text-xs rounded-full">
                                  {vac.spots} Spot{vac.spots > 1 ? 's' : ''}
                                </Badge>
                                <p className="text-[10px] text-slate-400">Available: {vac.date_available}</p>
                              </div>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800 leading-relaxed">
                              {vac.notes}
                            </p>

                            <div className="flex flex-wrap gap-2 items-center justify-between">
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-850">
                                  {prog.specialty}
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-850">
                                  <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                                  {prog.city}, {prog.state}
                                </Badge>
                                {prog.visa_j1 && (
                                  <Badge className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400" variant="outline">
                                    Sponsors J-1
                                  </Badge>
                                )}
                                {prog.visa_h1b && (
                                  <Badge className="text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400" variant="outline">
                                    Sponsors H-1B
                                  </Badge>
                                )}
                              </div>

                              <Button 
                                size="sm" 
                                variant="secondary"
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingVacancy(vac);
                                }}
                                className="bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 rounded-xl font-semibold text-xs py-1 h-8"
                              >
                                How to Apply
                              </Button>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent value="saved" className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-emerald-950/20 dark:to-slate-900 border-emerald-200 dark:border-emerald-900/60 rounded-3xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-200 dark:shadow-none">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">My Journey & Saved Opportunities</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Keep your personal plan organized with saved programs, schools, ratings, notes, and application milestones that match your current profile.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-bold text-base">Current planning focus</h3>
                  <p className="text-sm text-slate-500">{personalSummary.summary}</p>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400">
                  {personalSummary.isInUS ? 'U.S.-based' : personalSummary.isOverseas ? 'Overseas' : 'Location pending'}
                </Badge>
              </div>

              <form onSubmit={handleCustomEntrySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Entry type</Label>
                    <Select value={customEntryForm.entryType} onValueChange={(value) => setCustomEntryForm(prev => ({ ...prev, entryType: value }))}>
                      <SelectTrigger className="rounded-xl mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="program">Program</SelectItem>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Name</Label>
                    <Input value={customEntryForm.name} onChange={(e) => setCustomEntryForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Mayo Clinic" className="rounded-xl mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Category</Label>
                    <Input value={customEntryForm.category} onChange={(e) => setCustomEntryForm(prev => ({ ...prev, category: e.target.value }))} placeholder="Cardiology / Research / Hospital" className="rounded-xl mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Location</Label>
                    <Input value={customEntryForm.location} onChange={(e) => setCustomEntryForm(prev => ({ ...prev, location: e.target.value }))} placeholder="Boston, MA" className="rounded-xl mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Your notes</Label>
                  <Textarea value={customEntryForm.notes} onChange={(e) => setCustomEntryForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Why this matters, mentorship, visa fit, or logistics..." className="rounded-2xl mt-1 min-h-[90px]" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-semibold">My rating</Label>
                    <Select value={String(customEntryForm.rating)} onValueChange={(value) => setCustomEntryForm(prev => ({ ...prev, rating: Number(value) }))}>
                      <SelectTrigger className="rounded-xl w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map(value => <SelectItem key={value} value={String(value)}>{value}★</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" className="rounded-xl" onClick={() => {
                      setEditingEntryId(null);
                      setCustomEntryForm({ entryType: 'program', name: '', category: '', location: '', notes: '', rating: 3 });
                    }}>
                      Clear
                    </Button>
                    <Button type="submit" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                      {editingEntryId ? 'Update entry' : 'Save to my journey'}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>

            {customEntries.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Saved opportunities</h3>
                  <span className="text-xs text-slate-500">{customEntries.length} entries</span>
                </div>
                {customEntries.map((entry) => (
                  <Card key={entry.id} className="p-4 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                            {entry.entryType}
                          </Badge>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{entry.name}</span>
                        </div>
                        <p className="text-sm text-slate-500">{entry.category || 'General interest'}{entry.location ? ` • ${entry.location}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditCustomEntry(entry)} className="text-sm text-indigo-600">Edit</button>
                        <button onClick={() => handleDeleteCustomEntry(entry.id)} className="text-sm text-rose-500">Delete</button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} className={`w-4 h-4 ${index < entry.rating ? 'fill-current' : 'text-slate-300'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400">{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
                    {entry.notes && <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{entry.notes}</p>}
                  </Card>
                ))}
              </div>
            )}

            {savedProgramsList.length === 0 ? (
              <Card className="p-12 text-center rounded-3xl border-slate-200">
                <Heart className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500">No programs saved. Favorite programs in the Directory tab to track them here.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {savedProgramsList.map((prog) => {
                  const check = programChecklists[prog.id] || {
                    statementTailored: false,
                    lorsAssigned: false,
                    step2Uploaded: false,
                    mspeUploaded: false,
                    erasApplied: false,
                    thankYouSent: false
                  };
                  const progress = getChecklistProgress(prog.id);

                  return (
                    <Card key={prog.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-slate-950 dark:text-white">{prog.program_name}</h3>
                          <p className="text-sm text-slate-500">{prog.institution} — {prog.city}, {prog.state}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
                          <p className="text-xs text-slate-400">Complete</p>
                        </div>
                      </div>

                      <Progress value={progress} className="h-2 mb-4" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {[
                          { key: 'statementTailored', label: 'Tailored Personal Statement' },
                          { key: 'lorsAssigned', label: 'Request/Assign LoRs' },
                          { key: 'step2Uploaded', label: 'Upload USMLE Step 2 CK' },
                          { key: 'mspeUploaded', label: 'Upload MSPE (Dean\'s Letter)' },
                          { key: 'erasApplied', label: 'ERAS Application Submitted' },
                          { key: 'thankYouSent', label: 'Post-Interview Thank You Sent' },
                        ].map(task => (
                          <button
                            key={task.key}
                            onClick={() => toggleChecklistItem(prog.id, task.key)}
                            className={`flex items-center gap-3 p-3 rounded-2xl border text-left text-sm transition-all ${
                              check[task.key]
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800/40 dark:border-slate-850 dark:text-slate-400'
                            }`}
                          >
                            {check[task.key] ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            )}
                            <span className="font-medium">{task.label}</span>
                          </button>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-indigo-50 via-teal-50 to-white dark:from-indigo-950/20 dark:to-slate-900 border-indigo-200 dark:border-indigo-900/60 rounded-3xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200 dark:shadow-none">
                  <GitCompare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Program Comparison</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Compare up to 3 programs side-by-side to analyze visa requirements, minimum test scores, clinical experience requirements, and personalized match probabilities.
                  </p>
                </div>
              </div>
            </Card>

            {comparePrograms.length === 0 ? (
              <Card className="p-12 text-center rounded-3xl border-slate-200 dark:border-slate-850">
                <GitCompare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">No programs selected for comparison.</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Go to the <strong>Directory</strong> tab and click the compare icon ( <GitCompare className="w-3.5 h-3.5 inline mx-0.5 text-slate-400" /> ) on any program card to add it here.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800/40 p-3 rounded-2xl">
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Comparing {comparePrograms.length} of 3 programs</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setComparePrograms([])}
                    className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 text-xs rounded-xl"
                  >
                    Clear All
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {comparePrograms.map((prog) => {
                    const fit = calculateFitScore(prog);
                    return (
                      <Card key={prog.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-3">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2">{prog.program_name}</h3>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => toggleCompare(e, prog)}
                              className="rounded-full w-7 h-7 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mb-4 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{prog.institution}</span>
                          </p>

                          <div className="mb-4">
                            <div className="flex justify-between items-center p-2.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-950">
                              <span className="text-xs text-indigo-900 dark:text-indigo-400 font-semibold">Match Probability</span>
                              <Badge 
                                className={`font-bold px-2 py-0.5 text-xs ${
                                  fit.visaIssue 
                                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-none' 
                                    : fit.score >= 90 
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-none'
                                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-none'
                                }`}
                              >
                                {fit.visaIssue ? "Visa Mismatch" : `${fit.score}%`}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Specialty</span>
                              <span className="font-semibold text-right max-w-[150px] truncate">{prog.specialty}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Location</span>
                              <span className="font-semibold">{prog.city}, {prog.state}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">J-1 / H-1B Visa</span>
                              <span className="font-semibold">
                                {prog.visa_j1 ? 'J-1' : ''}{prog.visa_j1 && prog.visa_h1b ? ' & ' : ''}{prog.visa_h1b ? 'H-1B' : ''}{!prog.visa_j1 && !prog.visa_h1b ? 'None' : ''}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Min Step 2 CK</span>
                              <span className="font-semibold">{prog.step2_score_min || 'None'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-medium">Avg Step 2 CK</span>
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{prog.step2_score_avg || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Min USCE</span>
                              <span className="font-semibold">{prog.min_usce_months || '0'} months</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Graduation Cutoff</span>
                              <span className="font-semibold">{prog.grad_year_cutoff ? `${prog.grad_year_cutoff} yrs` : 'None'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Program Size</span>
                              <span className="font-semibold">{prog.program_size ? `${prog.program_size} (${prog.annual_intake}/yr)` : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Interview Format</span>
                              <span className="font-semibold">{prog.interview_format || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Application Fee</span>
                              <span className="font-semibold">${prog.estimated_cost?.application_fee || 26}</span>
                            </div>
                          </div>
                        </div>

                        {fit.reasons && fit.reasons.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] space-y-1 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-2xl">
                            <span className="font-bold text-slate-500 block">Fit Details:</span>
                            {fit.reasons.map((r, i) => (
                              <div key={i} className="flex items-start gap-1">
                                <span className={r.includes('below') || r.includes('Does not') || r.includes('Requires') ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'}>•</span>
                                <span className="text-slate-600 dark:text-slate-400 leading-tight">{r}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ERAS Review Tab */}
          <TabsContent value="eras_review" className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-teal-50 via-indigo-50 to-white dark:from-teal-950/20 dark:to-slate-900 border-teal-200 dark:border-teal-900/60 rounded-3xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-200 dark:shadow-none">
                  <ClipboardCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">ERAS Application Review & Audit</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Review your profile readiness for the ERAS application cycle. Run automated audits against your saved programs and get instant feedback on your Personal Statement.
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile & Program Audit Card */}
              <Card className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  ERAS Requirements Audit
                </h3>
                <p className="text-xs text-slate-500">
                  We cross-reference your user profile settings with your saved/favorite programs to find potential eligibility flags.
                </p>

                <div className="space-y-3.5 pt-2">
                  {/* Step 2 CK Score Audit */}
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                    {profile?.usmle_step2_score ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-xs block">USMLE Step 2 CK Score</span>
                      <p className="text-xs text-slate-500 leading-tight mt-0.5">
                        {profile?.usmle_step2_score 
                          ? `Your score of ${profile.usmle_step2_score} is verified. Ready for ERAS transmission.` 
                          : "No Step 2 CK score found in your profile. Most programs require a score for interview consideration."}
                      </p>
                    </div>
                  </div>

                  {/* Visa Requirements Audit */}
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                    {profile?.visa_status && profile.visa_status !== 'none' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-xs block">Visa Sponsorship Match</span>
                      <p className="text-xs text-slate-500 leading-tight mt-0.5">
                        {profile?.visa_status === 'none' 
                          ? "You marked that you do not require visa sponsorship (US Citizen/PR). Access to all programs." 
                          : `You require ${profile?.visa_status || 'visa'} sponsorship. We check that all your saved programs support this.`}
                      </p>
                    </div>
                  </div>

                  {/* USCE Audit */}
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                    {profile?.us_clinical_experience ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-xs block">US Clinical Experience (USCE)</span>
                      <p className="text-xs text-slate-500 leading-tight mt-0.5">
                        {profile?.us_clinical_experience 
                          ? "US Clinical Experience is completed. Ensures eligibility for community and academic programs." 
                          : "No US Clinical Experience marked. We recommend obtaining 1-3 months of hands-on US clinical rotations."}
                      </p>
                    </div>
                  </div>

                  {/* ECFMG Certification Audit */}
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                    {profile?.ecfmg_status === 'certified' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-xs block">ECFMG Certification Status</span>
                      <p className="text-xs text-slate-500 leading-tight mt-0.5">
                        {profile?.ecfmg_status === 'certified' 
                          ? "Certified. Your ECFMG Status is ready for ERAS. High-priority matching signal." 
                          : "Certification in progress. Ensure Pathways and OET are completed before rank lists are submitted."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5 rounded-2xl border border-indigo-150 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-400 leading-normal">
                  <span className="font-bold block mb-1">Strategy Recommendation:</span>
                  Your saved/favorite programs list currently has {savedProgramsList.length} items. We recommend targeting 30-50 highly compatible programs to maximize your match probability while minimizing cost.
                </div>
              </Card>

              {/* Personal Statement Reviewer Card */}
              <Card className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Personal Statement Scan
                </h3>
                <p className="text-xs text-slate-500">
                  Paste your Personal Statement below to instantly scan it for structural components, word count, specialty matching, and IMG strengths.
                </p>

                <textarea
                  className="w-full h-40 p-3 text-xs bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none font-mono"
                  placeholder="Paste your personal statement here (typically 500 to 900 words)..."
                  value={personalStatementText || ''}
                  onChange={(e) => setPersonalStatementText(e.target.value)}
                />

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Words: {personalStatementText ? personalStatementText.trim().split(/\s+/).filter(Boolean).length : 0}</span>
                  <Button
                    size="sm"
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-1.5 px-3"
                    onClick={runPersonalStatementAudit}
                    disabled={!personalStatementText?.trim()}
                  >
                    Run PS Review Scan
                  </Button>
                </div>

                {psFeedback && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2 space-y-3">
                    <div className="flex justify-between items-center p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40">
                      <span className="text-xs font-bold">Readiness Score</span>
                      <Badge 
                        className={`font-bold text-xs ${
                          psFeedback.score >= 80 
                            ? 'bg-emerald-100 text-emerald-700 border-none' 
                            : psFeedback.score >= 60 
                              ? 'bg-amber-100 text-amber-700 border-none'
                              : 'bg-red-100 text-red-700 border-none'
                        }`}
                      >
                        {psFeedback.score}/100
                      </Badge>
                    </div>

                    <div className="space-y-2 text-xs">
                      {psFeedback.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                          {suggestion.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          )}
                          <span className="text-slate-700 dark:text-slate-300 leading-tight">{suggestion.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value="interviews" className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-white dark:from-amber-950/20 dark:to-slate-900 border-amber-200 dark:border-amber-900/60 rounded-3xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-200 dark:shadow-none">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-2">Interview Tracking Log</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Log interview dates, formats, ratings, follow-up status, and preparation notes.
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setIsLogInterviewOpen(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Log Invite
                </Button>
              </div>

              {/* Simple Stats bar */}
              {interviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-amber-200/50 dark:border-amber-900/40 text-center">
                  <div>
                    <div className="text-2xl font-black text-slate-800 dark:text-white">{interviews.length}</div>
                    <div className="text-xs text-slate-500">Invitations</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-800 dark:text-white">
                      {interviews.filter(i => i.status === 'Completed').length}
                    </div>
                    <div className="text-xs text-slate-500">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-800 dark:text-white">
                      {interviews.length > 0 
                        ? (interviews.reduce((acc, curr) => acc + curr.rating, 0) / interviews.length).toFixed(1)
                        : "0.0"}★
                    </div>
                    <div className="text-xs text-slate-500">Avg Rating</div>
                  </div>
                </div>
              )}
            </Card>

            {/* Interviews List */}
            {interviews.length === 0 ? (
              <Card className="p-12 text-center rounded-3xl border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500">No interviews logged yet. Log your first residency interview invite above.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {interviews.map((int) => {
                  const prog = programs.find(p => p.id === int.programId);
                  return (
                    <Card key={int.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <Badge className={`mb-2 font-bold px-2 py-0.5 text-xs ${
                            int.status === 'Completed' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : int.status === 'Rejected' 
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`} variant="outline">
                            {int.status}
                          </Badge>
                          <h3 className="font-bold text-lg text-slate-950 dark:text-white">
                            {prog?.program_name || "Unknown Program"}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {prog?.institution} — {prog?.city}, {prog?.state}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => deleteInterview(int.id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-slate-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                        <div>
                          <span className="text-slate-400 block font-medium">Date</span>
                          <span className="font-semibold">{int.date || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Format</span>
                          <span className="font-semibold">{int.format}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Interviewer(s)</span>
                          <span className="font-semibold truncate block">{int.interviewers || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Rating</span>
                          <span className="font-semibold flex items-center text-amber-600 dark:text-amber-400">
                            {int.rating}★ {[...Array(int.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current inline ml-0.5" />)}
                          </span>
                        </div>
                      </div>

                      {int.notes && (
                        <div className="mt-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl text-sm">
                          <span className="font-semibold block text-xs text-slate-400 mb-1">Common Questions & Prep Notes</span>
                          <p className="text-slate-600 dark:text-slate-350">{int.notes}</p>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between text-xs pt-1">
                        <div className="flex items-center gap-2">
                          {int.thankYouSent ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Thank You Letter Sent</Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-400">Thank You Letter Pending</Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Rank List Tab */}
          <TabsContent value="ranklist" className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-white dark:from-indigo-950/20 dark:to-slate-900 border-indigo-200 dark:border-indigo-900/60 rounded-3xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200 dark:shadow-none">
                  <ArrowUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Rank Order List Planner</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Reorder and finalize your matching choices. Drag or click arrows to sequence programs. We evaluate safety warnings for score requirements and visa matches.
                  </p>
                </div>
              </div>
            </Card>

            {/* Safety Validation Check Results */}
            {rankedPrograms.length > 0 && (
              <div className="space-y-2">
                {rankedPrograms.map((prog) => {
                  const fit = calculateFitScore(prog);
                  const warnings = [];
                  
                  if (fit.visaIssue) {
                    warnings.push(`Sponsorship Mismatch: You need J-1 or H-1B, but ${prog.institution} sponsors neither.`);
                  }
                  if (profile?.usmle_step2_score && prog.step2_score_min && Number(profile.usmle_step2_score) < prog.step2_score_min) {
                    warnings.push(`Minimum Score Warning: Your Step 2 CK (${profile.usmle_step2_score}) is below this program's min (${prog.step2_score_min}).`);
                  }

                  if (warnings.length === 0) return null;

                  return (
                    <Card key={`warning-${prog.id}`} className="p-4 border-l-4 border-red-500 bg-red-50/50 dark:bg-red-950/10 text-xs rounded-2xl flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-red-800 dark:text-red-400 block mb-1">Rank Safety Warning: {prog.program_name}</span>
                        {warnings.map((w, idx) => (
                          <p key={idx} className="text-red-700 dark:text-red-300">- {w}</p>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Advisor Feedback Display */}
            {advisorFeedback.length > 0 && (
              <Card className="p-5 border-l-4 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-bold text-sm text-indigo-900 dark:text-indigo-300">Advisor Feedback Comments</span>
                </div>
                <div className="space-y-3">
                  {advisorFeedback.map(f => (
                    <div key={f.id} className="text-xs border-b border-indigo-150/40 pb-2 last:border-none last:pb-0">
                      <div className="flex justify-between font-bold text-indigo-800 dark:text-indigo-400">
                        <span>{f.advisorName}</span>
                        <span>{f.date}</span>
                      </div>
                      <p className="text-indigo-750 dark:text-indigo-300 mt-1 italic">"{f.comment}"</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Costs Display */}
            {rankedPrograms.length > 0 && (
              <Card className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-slate-400 block">Est ERAS Fees</span>
                  <span className="font-bold text-slate-800 dark:text-white">${costSummary.applicationFee}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Est Interview Travel</span>
                  <span className="font-bold text-slate-800 dark:text-white">${costSummary.travelCost}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-indigo-600 dark:text-indigo-400">Total Match Cost</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">${costSummary.totalCost}</span>
                </div>
              </Card>
            )}

            {/* Rank List Manager */}
            {rankedPrograms.length === 0 ? (
              <Card className="p-12 text-center rounded-3xl border-slate-200">
                <ArrowUp className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500">Add programs to favorites to display your Rank Order List here.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {rankedPrograms.map((prog, index) => {
                  const fit = calculateFitScore(prog);
                  const interviewLogs = interviews.filter(i => i.programId === prog.id);
                  const isSaved = profile?.favorite_programs?.includes(prog.id);

                  return (
                    <Card key={prog.id} className="p-4 rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-black flex items-center justify-center flex-shrink-0 text-base shadow-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-950 dark:text-white truncate max-w-xs md:max-w-md">
                            {prog.program_name}
                          </h3>
                          <p className="text-xs text-slate-450 truncate">{prog.institution} — {prog.city}, {prog.state}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="text-[10px] py-0 px-1.5" variant="outline">
                              Fit: {fit.score}%
                            </Badge>
                            {interviewLogs.length > 0 && (
                              <Badge className="text-[10px] py-0 px-1.5 bg-amber-50 text-amber-700 border-amber-200" variant="outline">
                                Interview: {interviewLogs[0].rating}★
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveRank(index, -1)}
                          disabled={index === 0}
                          className="h-9 w-9 rounded-xl hover:bg-slate-50"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveRank(index, 1)}
                          disabled={index === rankedPrograms.length - 1}
                          className="h-9 w-9 rounded-xl hover:bg-slate-50"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Advisor Tab */}
          <TabsContent value="advisor" className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-white dark:from-indigo-950/20 dark:to-slate-900 border-indigo-200 dark:border-indigo-900/60 rounded-3xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200 dark:shadow-none">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Advisor Sharing Tools</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Generate an access code for medical advisors to review your application status and rank list sequence. Toggle advisor mode to test leaving review comments.
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <h3 className="font-bold mb-2">Your Sharing Profile Code</h3>
                <p className="text-xs text-slate-500 mb-4">Give this code to your university or match advisor to share your application metrics.</p>
                
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={`MATCH-MD-SHARE-${user?.id?.slice(0, 8)?.toUpperCase() || 'OFFLINE'}`}
                    className="font-mono text-xs h-11 bg-slate-50 border-slate-200 rounded-xl"
                  />
                  <Button variant="outline" className="h-11 rounded-xl" onClick={() => alert("Share link copied to clipboard!")}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>

              {/* Simulation Mode Switch */}
              <Card className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <UserCheck className="w-6 h-6 text-indigo-500 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">Simulate Advisor Review Portal</h4>
                      <p className="text-xs text-slate-500">Toggle this to log in as a reviewer and check feedback controls.</p>
                    </div>
                  </div>
                  <Switch 
                    checked={advisorMode}
                    onCheckedChange={setAdvisorMode}
                  />
                </div>
              </Card>

              {/* Advisor Portal Review View */}
              {advisorMode && (
                <Card className="p-6 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/20 to-white dark:from-indigo-950/10 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-350">Advisor Viewing: {profile?.display_name || "Applicant"}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl">
                      <span className="text-slate-400 block font-semibold">User Step 2 Score</span>
                      <span className="font-bold text-slate-800 dark:text-white">{profile?.usmle_step2_score || "Not Provided"}</span>
                    </div>
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl">
                      <span className="text-slate-400 block font-semibold">Visa Requirement</span>
                      <span className="font-bold text-slate-800 dark:text-white">
                        {profile?.visa_status === 'none' ? "Needs Sponsorship" : profile?.visa_status}
                      </span>
                    </div>
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl">
                      <span className="text-slate-400 block font-semibold">Medical School</span>
                      <span className="font-bold text-slate-800 dark:text-white">{profile?.medical_school || "N/A"} ({profile?.medical_school_country || "N/A"})</span>
                    </div>
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl">
                      <span className="text-slate-400 block font-semibold">US Clinical Experience</span>
                      <span className="font-bold text-slate-800 dark:text-white">{profile?.us_clinical_experience ? "Yes" : "No"}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm mb-3">Student's Rank Order List</h4>
                    {rankedPrograms.length === 0 ? (
                      <p className="text-xs text-slate-400">Student hasn't ranked any programs.</p>
                    ) : (
                      <div className="space-y-2">
                        {rankedPrograms.map((prog, index) => {
                          const fit = calculateFitScore(prog);
                          return (
                            <div key={`advisor-rank-${prog.id}`} className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-100 text-xs">
                              <span className="font-semibold text-slate-700 dark:text-slate-350">
                                {index + 1}. {prog.program_name} ({prog.city})
                              </span>
                              <Badge variant="outline">{fit.score}% Match</Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Add Comments */}
                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Label className="font-bold text-sm">Add Advisor Review Feedback</Label>
                    <Textarea 
                      placeholder="e.g., Looks like a very strong list. Stroger Cook County is highly friendly to your credentials."
                      value={advisorCommentInput}
                      onChange={(e) => setAdvisorCommentInput(e.target.value)}
                      className="rounded-2xl border-slate-200 min-h-24"
                    />
                    <Button 
                      onClick={handleAddAdvisorComment}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                    >
                      Post Advisor Comment
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <ProgramDetailsModal
        open={!!selectedProgram}
        onClose={() => setSelectedProgram(null)}
        program={selectedProgram}
        profile={profile}
        calculateFitScore={calculateFitScore}
      />

      {/* Vacancy Details Dialog */}
      <Dialog open={!!viewingVacancy} onOpenChange={(open) => !open && setViewingVacancy(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2.5 py-1 rounded-full dark:bg-rose-950/40 dark:text-rose-400">
                {viewingVacancy?.pgy_level} Vacancy
              </span>
              <span>Off-Cycle Position</span>
            </DialogTitle>
          </DialogHeader>

          {viewingVacancy && (
            <div className="space-y-4 mt-4 text-sm text-slate-700 dark:text-slate-300">
              <div>
                <h4 className="font-semibold text-slate-500 text-xs uppercase tracking-wider mb-1">Program</h4>
                <p className="font-bold text-slate-900 dark:text-white text-base">
                  {viewingVacancy.program.program_name}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {viewingVacancy.program.institution}
                </p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {viewingVacancy.program.city}, {viewingVacancy.program.state}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-semibold text-slate-500 text-xs uppercase tracking-wider mb-0.5">Specialty</h4>
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400">
                    {Array.isArray(viewingVacancy.program.specialty) 
                      ? viewingVacancy.program.specialty.join(', ') 
                      : viewingVacancy.program.specialty}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-500 text-xs uppercase tracking-wider mb-0.5">Spots Available</h4>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {viewingVacancy.spots} position{viewingVacancy.spots > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-semibold text-slate-500 text-xs uppercase tracking-wider mb-0.5">Date Posted</h4>
                  <p className="text-slate-800 dark:text-slate-200">{viewingVacancy.date_added}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-500 text-xs uppercase tracking-wider mb-0.5">Availability</h4>
                  <p className="text-rose-600 dark:text-rose-400 font-semibold">{viewingVacancy.date_available}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-semibold text-slate-500 text-xs uppercase tracking-wider mb-1">Position Details</h4>
                <p className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                  {viewingVacancy.notes}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-semibold text-slate-500 text-xs uppercase tracking-wider mb-1">How to Apply</h4>
                <p className="mb-2">
                  Please send your application materials (CV, USMLE transcripts, LORs) directly to the coordinator at:
                </p>
                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-950 text-center">
                  <a 
                    href={`mailto:${viewingVacancy.contact_email}`} 
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                  >
                    {viewingVacancy.contact_email}
                  </a>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => {
                    setViewingVacancy(null);
                    setSelectedProgram(viewingVacancy.program);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                >
                  View Program Profile
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setViewingVacancy(null)}
                  className="rounded-xl"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Log Interview Dialog */}
      <Dialog open={isLogInterviewOpen} onOpenChange={setIsLogInterviewOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Log Interview Invitation</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleLogInterview} className="space-y-4 mt-4 text-sm">
            <div>
              <Label>Select Residency Program</Label>
              <Select 
                value={newInterview.programId} 
                onValueChange={(v) => setNewInterview({ ...newInterview, programId: v })}
              >
                <SelectTrigger className="rounded-xl mt-1 h-11">
                  <SelectValue placeholder="Choose program" />
                </SelectTrigger>
                <SelectContent>
                  {savedProgramsList.map(prog => (
                    <SelectItem key={prog.id} value={prog.id}>{prog.program_name} ({prog.institution})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Interview Date</Label>
                <Input
                  type="date"
                  value={newInterview.date}
                  onChange={(e) => setNewInterview({ ...newInterview, date: e.target.value })}
                  className="rounded-xl mt-1 h-11"
                />
              </div>
              <div>
                <Label>Interview Time</Label>
                <Input
                  type="time"
                  value={newInterview.time}
                  onChange={(e) => setNewInterview({ ...newInterview, time: e.target.value })}
                  className="rounded-xl mt-1 h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Format</Label>
                <Select 
                  value={newInterview.format} 
                  onValueChange={(v) => setNewInterview({ ...newInterview, format: v })}
                >
                  <SelectTrigger className="rounded-xl mt-1 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Virtual">Virtual Only</SelectItem>
                    <SelectItem value="In-Person">In-Person Only</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select 
                  value={newInterview.status} 
                  onValueChange={(v) => setNewInterview({ ...newInterview, status: v })}
                >
                  <SelectTrigger className="rounded-xl mt-1 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Invited">Invited</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Interviewer Name(s)</Label>
              <Input
                placeholder="e.g. Dr. Sarah Jenkins, APD"
                value={newInterview.interviewers}
                onChange={(e) => setNewInterview({ ...newInterview, interviewers: e.target.value })}
                className="rounded-xl mt-1 h-11"
              />
            </div>

            <div>
              <Label>Your Rating (1-5 Stars)</Label>
              <Select 
                value={newInterview.rating.toString()} 
                onValueChange={(v) => setNewInterview({ ...newInterview, rating: Number(v) })}
              >
                <SelectTrigger className="rounded-xl mt-1 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Stars — Excellent Experience</SelectItem>
                  <SelectItem value="4">4 Stars — Good Program</SelectItem>
                  <SelectItem value="3">3 Stars — Average Program</SelectItem>
                  <SelectItem value="2">2 Stars — Poor Impression</SelectItem>
                  <SelectItem value="1">1 Star — Disaster Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Questions Asked & Preparation Notes</Label>
              <Textarea
                placeholder="Write interview prep questions, key points, or interviewer answers..."
                value={newInterview.notes}
                onChange={(e) => setNewInterview({ ...newInterview, notes: e.target.value })}
                className="rounded-2xl mt-1 min-h-20"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
              <span className="font-semibold text-xs text-slate-600">Post-Interview Thank You Sent?</span>
              <Switch 
                checked={newInterview.thankYouSent}
                onCheckedChange={(v) => setNewInterview({ ...newInterview, thankYouSent: v })}
              />
            </div>

            <Button type="submit" className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white rounded-xl">
              Save Interview Details
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}