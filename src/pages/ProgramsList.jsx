import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
<<<<<<< HEAD
import { Loader2, Search, Filter, MapPin, BookOpen, Shield, Plus, AlertTriangle, Verified, Stethoscope, Download } from 'lucide-react';
import { fetchPrograms } from '@/api/programs';
=======
import {
  Loader2, Search, Filter, MapPin, BookOpen, Shield, Plus,
  AlertTriangle, Verified, Sparkles, Bookmark, BookmarkCheck,
  ChevronLeft, ChevronRight, X, Compass, Check
} from 'lucide-react';
import { fetchPrograms, fetchSavedSearches, saveSearch, deleteSavedSearch } from '@/api/programs';
>>>>>>> f0b0ebb (feat: Multi-location program search, saved search presets, and OB/GYN import workbench)
import AddProgramModal from '@/components/community/AddProgramModal';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import { exportProgramsToCSV } from '@/utils/csvExporter';
import { toast } from 'sonner';

const SPECIALTIES = [
  'Internal Medicine', 'Family Medicine', 'Pediatrics', 'Surgery',
  'Emergency Medicine', 'Psychiatry', 'OB/GYN', 'Neurology',
  'Radiology', 'Anesthesiology', 'Pathology', 'Dermatology',
  'Cardiology', 'Gastroenterology', 'Nephrology', 'Pulmonology',
  'Endocrinology', 'Hematology/Oncology', 'Infectious Disease',
  'Rheumatology', 'Allergy/Immunology', 'Other',
];

const SPECIALTY_PRESETS = [
  { label: 'Primary Care Net', values: ['Internal Medicine', 'Family Medicine', 'Pediatrics'] },
  { label: 'Hospital / Acute', values: ['Internal Medicine', 'Emergency Medicine', 'Psychiatry'] },
];

const PROGRAM_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'residency', label: 'Residency' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'observership', label: 'Observership' },
  { value: 'research', label: 'Research' },
  { value: 'elective', label: 'Elective' },
];

<<<<<<< HEAD
const US_STATES = [
=======
const REGIONS = [
  { name: 'Northeast', states: ['NY', 'NJ', 'PA', 'CT', 'MA', 'RI', 'VT', 'NH', 'ME'] },
  { name: 'Mid-Atlantic', states: ['DC', 'MD', 'VA', 'WV', 'DE'] },
  { name: 'Midwest', states: ['IL', 'OH', 'MI', 'IN', 'WI', 'MN', 'IA', 'MO', 'KS', 'NE', 'ND', 'SD'] },
  { name: 'South', states: ['TX', 'FL', 'GA', 'NC', 'SC', 'TN', 'AL', 'LA', 'MS', 'AR', 'OK', 'KY'] },
  { name: 'West & Pacific', states: ['CA', 'WA', 'OR', 'AZ', 'CO', 'UT', 'NV', 'ID', 'MT', 'WY', 'AK', 'HI'] },
];

const ALL_STATES = [
>>>>>>> f0b0ebb (feat: Multi-location program search, saved search presets, and OB/GYN import workbench)
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
<<<<<<< HEAD
];

const STATE_PRESETS = [
  { label: 'Tri-State Area', values: ['NY', 'NJ', 'PA', 'CT'] },
  { label: 'West Coast', values: ['CA', 'OR', 'WA'] },
=======
>>>>>>> f0b0ebb (feat: Multi-location program search, saved search presets, and OB/GYN import workbench)
];

export default function ProgramsList() {
  const navigate = useNavigate();
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
=======
  const [programs, setPrograms] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const [filters, setFilters] = useState({
    search: '',
    specialty: '',
    program_type: '',
    states: [],
    visa_j1: false,
    visa_h1b: false,
    accepts_img: false,
    is_acgme_accredited: false,
    verifiedOnly: false,
  });

  const [savedSearches, setSavedSearches] = useState([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchNameInput, setSearchNameInput] = useState('');
>>>>>>> f0b0ebb (feat: Multi-location program search, saved search presets, and OB/GYN import workbench)
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const [filters, setFilters] = useState({
    search: '',
    specialty: '',
    specialties: [],
    programType: '',
    state: '',
    states: [],
    verifiedOnly: false,
    hasScamReports: false,
  });

  useEffect(() => {
    loadSavedSearches();
  }, []);

  useEffect(() => {
    loadPrograms();
<<<<<<< HEAD
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, programs, activeTab]);
=======
  }, [filters, activeTab, page]);

  const loadSavedSearches = async () => {
    try {
      const data = await fetchSavedSearches();
      setSavedSearches(data || []);
    } catch (err) {
      console.warn('Error loading saved searches:', err);
    }
  };
>>>>>>> f0b0ebb (feat: Multi-location program search, saved search presets, and OB/GYN import workbench)

  const loadPrograms = async () => {
    setLoading(true);
    try {
<<<<<<< HEAD
      const data = await fetchPrograms();
      setPrograms(data);
      setFilteredPrograms(data);
=======
      let dbProgramType = filters.program_type;
      if (filters.program_type === 'residency_categorical' || filters.program_type === 'residency_preliminary') {
        dbProgramType = 'residency';
      }

      const { data, totalCount: total } = await fetchPrograms({
        ...filters,
        program_type: dbProgramType,
        verified: filters.verifiedOnly ? true : undefined,
        page,
        pageSize,
      });

      let processedData = data || [];
      if (filters.program_type === 'residency_categorical') {
        processedData = processedData.filter(p => {
          const name = p.name || '';
          const specialty = Array.isArray(p.specialty) ? p.specialty.join(' ') : (p.specialty || '');
          const isPrelim = name.toLowerCase().includes('prelim') || name.toLowerCase().includes('transitional') || specialty.toLowerCase().includes('prelim') || specialty.toLowerCase().includes('transitional');
          return !isPrelim;
        });
      } else if (filters.program_type === 'residency_preliminary') {
        processedData = processedData.filter(p => {
          const name = p.name || '';
          const specialty = Array.isArray(p.specialty) ? p.specialty.join(' ') : (p.specialty || '');
          const isPrelim = name.toLowerCase().includes('prelim') || name.toLowerCase().includes('transitional') || specialty.toLowerCase().includes('prelim') || specialty.toLowerCase().includes('transitional');
          return isPrelim;
        });
      }

      setPrograms(processedData);
      setTotalCount(total);
>>>>>>> f0b0ebb (feat: Multi-location program search, saved search presets, and OB/GYN import workbench)
    } catch (error) {
      console.error('Failed to load programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...programs];

    if (activeTab === 'verified') result = result.filter(p => p.verified);
    if (activeTab === 'unverified') result = result.filter(p => !p.verified);
    if (activeTab === 'scams') result = result.filter(p => p.scam_reports_count > 0);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.institution?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.state?.toLowerCase().includes(q)
      );
    }

    if (filters.specialties && filters.specialties.length > 0) {
      result = result.filter(p => {
        if (!p.specialty) return false;
        if (Array.isArray(p.specialty)) {
          return filters.specialties.some(s => p.specialty.includes(s));
        }
        return filters.specialties.includes(p.specialty);
      });
    } else if (filters.specialty) {
      result = result.filter(p => p.specialty === filters.specialty);
    }

    if (filters.programType) result = result.filter(p => p.program_type === filters.programType);

    if (filters.states && filters.states.length > 0) {
      result = result.filter(p => filters.states.includes(p.state));
    } else if (filters.state) {
      result = result.filter(p => p.state === filters.state);
    }

    if (filters.verifiedOnly) result = result.filter(p => p.verified);
    if (filters.hasScamReports) result = result.filter(p => p.scam_reports_count > 0);

    setFilteredPrograms(result);
  };

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

<<<<<<< HEAD
  const resetFilters = () => {
    setFilters({
      search: '',
      specialty: '',
      specialties: [],
      programType: '',
      state: '',
      states: [],
      verifiedOnly: false,
      hasScamReports: false,
    });
    setActiveTab('all');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Program Directory</h1>
          <p className="text-muted-foreground">Community-sourced programs, notes, and scam reports for IMGs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => exportProgramsToCSV(filteredPrograms, 'MatchaMD_Programs_Export.csv')}
            className="rounded-xl border-slate-200 dark:border-slate-700"
          >
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <AddProgramModal open={showAddModal} onOpenChange={setShowAddModal} onSuccess={loadPrograms} />
          <Button onClick={() => setShowAddModal(true)} className="rounded-xl"><Plus className="h-4 w-4 mr-2" /> Add Program</Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            <div className="relative min-w-[200px]">
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search programs..."
=======
  const toggleState = (st) => {
    setPage(1);
    setFilters(prev => {
      const exists = prev.states.includes(st);
      return {
        ...prev,
        states: exists ? prev.states.filter(s => s !== st) : [...prev.states, st]
      };
    });
  };

  const toggleRegion = (regionStates) => {
    setPage(1);
    setFilters(prev => {
      const allSelected = regionStates.every(st => prev.states.includes(st));
      if (allSelected) {
        return { ...prev, states: prev.states.filter(st => !regionStates.includes(st)) };
      } else {
        const combined = Array.from(new Set([...prev.states, ...regionStates]));
        return { ...prev, states: combined };
      }
    });
  };

  const clearFilters = () => {
    setPage(1);
    setFilters({
      search: '',
      specialty: '',
      program_type: '',
      states: [],
      visa_j1: false,
      visa_h1b: false,
      accepts_img: false,
      is_acgme_accredited: false,
      verifiedOnly: false,
    });
  };

  const handleSaveSearchSubmit = async () => {
    if (!searchNameInput.trim()) {
      toast.error('Please enter a name for your saved search');
      return;
    }
    try {
      const created = await saveSearch(searchNameInput.trim(), filters);
      setSavedSearches(prev => [created, ...prev]);
      setSearchNameInput('');
      setSaveDialogOpen(false);
      toast.success('Search preset saved!');
    } catch (err) {
      toast.error('Failed to save search');
    }
  };

  const applySavedSearch = (saved) => {
    setPage(1);
    setFilters(saved.filters || {});
    toast.info(`Loaded search preset: "${saved.name}"`);
  };

  const handleDeleteSearch = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteSavedSearch(id);
      setSavedSearches(prev => prev.filter(s => s.id !== id));
      toast.success('Saved search removed');
    } catch (err) {
      toast.error('Could not remove saved search');
    }
  };

  const filteredPrograms = programs.filter(p => {
    if (activeTab === 'verified' && !p.verified) return false;
    if (activeTab === 'unverified' && p.verified) return false;
    if (activeTab === 'scams' && p.scam_reports_count === 0) return false;
    return true;
  });

  const verifiedCount = programs.filter(p => p.verified).length;
  const reportedCount = programs.filter(p => p.scam_reports_count > 0).length;
  const totalPages = Math.ceil(totalCount / pageSize);

  const renderProgramCards = (list) => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {list.map(program => {
        const specialtyLabel = Array.isArray(program.specialty) ? program.specialty[0] : program.specialty;
        const typeLabel = (program.program_type || '').replace(/_/g, ' ');
        const isHighSignal = program.verified || program.scam_reports_count > 0;

        return (
          <Link key={program.id} to={`/programs/${program.id}`} className="text-inherit no-underline">
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            >
              <Card className={`group h-full overflow-hidden border border-slate-200/80 bg-white/95 shadow-sm transition-all duration-200 hover:border-[rgb(var(--color-primary))]/40 hover:shadow-xl ${isHighSignal ? 'ring-1 ring-inset ring-slate-100' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <CardTitle className="text-lg font-semibold leading-tight">{program.name}</CardTitle>
                        {program.verified && (
                          <Badge variant="default" className="shrink-0 bg-emerald-600/90 text-white">
                            <Verified className="mr-1 h-3 w-3" /> Verified
                          </Badge>
                        )}
                        {program.scam_reports_count > 0 && (
                          <Badge variant="destructive" className="shrink-0">
                            <AlertTriangle className="mr-1 h-3 w-3" /> {program.scam_reports_count} Reports
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-sm text-slate-600">{program.institution}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="capitalize text-slate-700">{typeLabel}</Badge>
                    {(program.is_acgme_accredited || program.acgme_program_number) && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Shield className="mr-1 h-3 w-3" /> ACGME {program.acgme_program_number ? `#${program.acgme_program_number}` : ''}
                      </Badge>
                    )}
                    {program.visa_j1 && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">J-1 Visa</Badge>
                    )}
                    {program.visa_h1b && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">H-1B Visa</Badge>
                    )}
                    {program.accepts_img && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">IMG Friendly</Badge>
                    )}
                  </div>

                  <div className="space-y-1.5 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                      <span>{program.city}, {program.state}</span>
                    </div>
                    {specialtyLabel && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>{specialtyLabel}</span>
                      </div>
                    )}
                    {program.program_director && (
                      <div className="text-xs text-slate-500 truncate">
                        PD: <span className="font-medium text-slate-700">{program.program_director}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <span>{program.program_notes_count || 0} notes</span>
                    <span>{program.scam_reports_count || 0} reports</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-[rgb(var(--color-primary))] p-6 text-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.7)]"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-slate-100 backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>MatchAMD Residency Search</span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Cast a Wide Net</h1>
            <p className="mt-3 max-w-xl text-sm text-slate-200/90 sm:text-base">
              Search across multiple states, visa sponsorship rules, and IMG friendliness criteria to find your ideal residency programs.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-2xl font-semibold">{totalCount}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-200/80">Matching Programs</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-2xl font-semibold">{filters.states.length}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-200/80">Selected States</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Saved Searches Bar */}
      {savedSearches.length > 0 && (
        <Card className="border-indigo-100 bg-indigo-50/40 p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-900">
              <Bookmark className="h-4 w-4 text-indigo-600" /> Saved Presets:
            </span>
            {savedSearches.map(s => (
              <Badge
                key={s.id}
                variant="secondary"
                onClick={() => applySavedSearch(s)}
                className="cursor-pointer bg-white text-indigo-900 border border-indigo-200 px-3 py-1 text-xs hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>{s.name}</span>
                <X className="h-3 w-3 hover:text-red-300" onClick={(e) => handleDeleteSearch(e, s.id)} />
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Header Controls */}
      <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Multi-Location & Criteria Filters</h2>
          <p className="text-sm text-slate-600">Select regions, states, visa policies, and save your search presets.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setSaveDialogOpen(true)} variant="outline" className="rounded-full border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            <BookmarkCheck className="mr-1.5 h-4 w-4 text-indigo-600" /> Save Search
          </Button>
          <AddProgramModal open={showAddModal} onOpenChange={setShowAddModal} onSuccess={loadPrograms} />
          <Button onClick={() => setShowAddModal(true)} className="rounded-full">
            <Plus className="mr-2 h-4 w-4" /> Add Program
          </Button>
        </div>
      </div>

      {/* Save Search Modal */}
      {saveDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-white p-6 shadow-2xl rounded-2xl">
            <h3 className="text-lg font-semibold text-slate-900">Save Search Preset</h3>
            <p className="mt-1 text-sm text-slate-600">Give your current multi-location search filters a quick name.</p>
            <div className="mt-4 space-y-4">
              <Input
                placeholder="e.g. Northeast OB/GYN J-1 Programs"
                value={searchNameInput}
                onChange={e => setSearchNameInput(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveSearchSubmit} className="bg-indigo-600 text-white">Save Preset</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filter Panel */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardContent className="space-y-4 pt-6">
          {/* Top Search bar & primary selects */}
          <div className="flex flex-wrap items-end gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
              }}
              className="flex flex-1 min-w-[260px] gap-2 items-center"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search programs, ACGME ID, directors..."
>>>>>>> f0b0ebb (feat: Multi-location program search, saved search presets, and OB/GYN import workbench)
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
<<<<<<< HEAD
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Specialties</label>
              <MultiSelectDropdown
                title="Specialties"
                placeholder="All Specialties"
                options={SPECIALTIES}
                selectedValues={filters.specialties}
                onChange={vals => handleFilterChange('specialties', vals)}
                presets={SPECIALTY_PRESETS}
                icon={Stethoscope}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">US States</label>
              <MultiSelectDropdown
                title="US States"
                placeholder="All States"
                options={US_STATES}
                selectedValues={filters.states}
                onChange={vals => handleFilterChange('states', vals)}
                presets={STATE_PRESETS}
                icon={MapPin}
              />
            </div>

            <div className="flex flex-col justify-between h-full space-y-2">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Program Type</label>
                <Select value={filters.program_type} onValueChange={v => handleFilterChange('program_type', v)}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="All Types" /></SelectTrigger>
                  <SelectContent>{PROGRAM_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={filters.verifiedOnly} onChange={e => handleFilterChange('verifiedOnly', e.target.checked)} className="rounded border" />
              <span className="text-sm font-medium">Verified only</span>
            </label>
            {hasAnyFilter && (
              <Button variant="ghost" size="sm" onClick={clearFilters}><Filter className="h-4 w-4 mr-1" /> Clear All Filters</Button>
=======
            </form>

            <Select value={filters.specialty} onValueChange={v => handleFilterChange('specialty', v)}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Specialty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Specialties</SelectItem>
                {SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.program_type} onValueChange={v => handleFilterChange('program_type', v)}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>{PROGRAM_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {/* Region Quick Select Presets */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Compass className="h-3.5 w-3.5 text-indigo-500" /> Region Presets ("Cast a Wide Net"):
            </div>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map(reg => {
                const isAllSelected = reg.states.every(st => filters.states.includes(st));
                const isSomeSelected = reg.states.some(st => filters.states.includes(st));

                return (
                  <Button
                    key={reg.name}
                    type="button"
                    size="sm"
                    variant={isAllSelected ? "default" : "outline"}
                    onClick={() => toggleRegion(reg.states)}
                    className={`rounded-full text-xs transition-all ${
                      isAllSelected
                        ? "bg-indigo-600 text-white"
                        : isSomeSelected
                        ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                        : "text-slate-700"
                    }`}
                  >
                    {reg.name} {isAllSelected && <Check className="ml-1 h-3 w-3" />}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Multi-State Selection Badges */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Selected States ({filters.states.length}):
              </span>
              {filters.states.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => handleFilterChange('states', [])} className="h-6 px-2 text-xs text-slate-500">
                  Clear States
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 border rounded-lg bg-slate-50/50">
              {ALL_STATES.map(st => {
                const selected = filters.states.includes(st);
                return (
                  <Badge
                    key={st}
                    variant={selected ? "default" : "outline"}
                    onClick={() => toggleState(st)}
                    className={`cursor-pointer text-xs px-2 py-0.5 transition-all ${
                      selected ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {st}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Visa & Criteria Badges */}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
            <label className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${filters.visa_j1 ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm' : 'border-slate-200 bg-white text-slate-700'}`}>
              <input type="checkbox" checked={filters.visa_j1} onChange={e => handleFilterChange('visa_j1', e.target.checked)} className="hidden" />
              <span>J-1 Visa Sponsored</span>
            </label>

            <label className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${filters.visa_h1b ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-sm' : 'border-slate-200 bg-white text-slate-700'}`}>
              <input type="checkbox" checked={filters.visa_h1b} onChange={e => handleFilterChange('visa_h1b', e.target.checked)} className="hidden" />
              <span>H-1B Visa Sponsored</span>
            </label>

            <label className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${filters.accepts_img ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm' : 'border-slate-200 bg-white text-slate-700'}`}>
              <input type="checkbox" checked={filters.accepts_img} onChange={e => handleFilterChange('accepts_img', e.target.checked)} className="hidden" />
              <span>IMG Friendly</span>
            </label>

            <label className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${filters.is_acgme_accredited ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm' : 'border-slate-200 bg-white text-slate-700'}`}>
              <input type="checkbox" checked={filters.is_acgme_accredited} onChange={e => handleFilterChange('is_acgme_accredited', e.target.checked)} className="hidden" />
              <span>ACGME Accredited</span>
            </label>

            <label className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${filters.verifiedOnly ? 'border-slate-800 bg-slate-900 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700'}`}>
              <input type="checkbox" checked={filters.verifiedOnly} onChange={e => handleFilterChange('verifiedOnly', e.target.checked)} className="hidden" />
              <span>Verified Only</span>
            </label>

            {(filters.search || filters.specialty || filters.program_type || filters.states.length > 0 || filters.visa_j1 || filters.visa_h1b || filters.accepts_img || filters.verifiedOnly) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-full text-xs">
                <Filter className="mr-1 h-3.5 w-3.5" /> Clear All Filters
              </Button>
>>>>>>> f0b0ebb (feat: Multi-location program search, saved search presets, and OB/GYN import workbench)
            )}
          </div>
        </CardContent>
      </Card>

<<<<<<< HEAD
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({programs.length})</TabsTrigger>
          <TabsTrigger value="verified">Verified ({programs.filter(p => p.verified).length})</TabsTrigger>
          <TabsTrigger value="unverified">Unverified ({programs.filter(p => !p.verified).length})</TabsTrigger>
          <TabsTrigger value="scams">⚠️ Reports ({programs.filter(p => p.scam_reports_count > 0).length})</TabsTrigger>
=======
      {/* Tabs & Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 rounded-full bg-slate-100 p-1">
          <TabsTrigger value="all" className="rounded-full">All ({totalCount})</TabsTrigger>
          <TabsTrigger value="verified" className="rounded-full">Verified ({verifiedCount})</TabsTrigger>
          <TabsTrigger value="unverified" className="rounded-full">Unverified ({programs.filter(p => !p.verified).length})</TabsTrigger>
          <TabsTrigger value="scams" className="rounded-full">⚠️ Reports ({reportedCount})</TabsTrigger>
>>>>>>> f0b0ebb (feat: Multi-location program search, saved search presets, and OB/GYN import workbench)
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filteredPrograms.length === 0 ? (
<<<<<<< HEAD
            <Card><CardContent className="py-12 text-center text-muted-foreground">No programs found. Try adjusting filters or add one!</CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPrograms.map(program => (
                <Link key={program.id} to={`/programs/${program.id}`} className="text-inherit no-underline">
                  <Card className={`hover:shadow-lg transition-shadow ${program.verified ? 'border-l-4 border-green-500' : ''} ${program.scam_reports_count > 0 ? 'border-l-4 border-destructive' : ''}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg truncate">{program.name}</CardTitle>
                            {program.verified && <Badge variant="default" className="bg-green-100 text-green-800 shrink-0"><Verified className="h-3 w-3 mr-1" /> Verified</Badge>}
                            {program.scam_reports_count > 0 && <Badge variant="destructive" className="shrink-0"><AlertTriangle className="h-3 w-3 mr-1" /> {program.scam_reports_count} Reports</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{program.institution}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-capitalize">{program.program_type}</Badge>
                        {program.is_acgme_accredited && <Badge variant="outline" className="bg-blue-100 text-blue-800"><Shield className="h-3 w-3 mr-1" /> ACGME</Badge>}
                        {program.ecfmg_pathway_eligible && <Badge variant="outline" className="bg-purple-100 text-purple-800"><BookOpen className="h-3 w-3 mr-1" /> ECFMG</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {program.city}, {program.state}</span>
                        {program.specialty?.[0] && <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {program.specialty[0]}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                        <span>{program.program_notes_count || 0} notes</span>
                        <span>·</span>
                        <span>{program.scam_reports_count || 0} reports</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Other tabs reuse same list with different filters */}
        <TabsContent value="verified">
          {!loading && filteredPrograms.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">No verified programs yet.</CardContent></Card>}
          {!loading && filteredPrograms.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPrograms.map(program => (
                <Link key={program.id} to={`/programs/${program.id}`} className="text-inherit no-underline">
                  <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg truncate">{program.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{program.institution}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span><MapPin className="h-4 w-4 mr-1" /> {program.city}, {program.state}</span>
                        <span>·</span>
                        <Badge variant="outline" className="text-capitalize">{program.program_type}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unverified">
          {!loading && filteredPrograms.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">All programs are verified!</CardContent></Card>}
          {!loading && filteredPrograms.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPrograms.map(program => (
                <Link key={program.id} to={`/programs/${program.id}`} className="text-inherit no-underline">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg truncate">{program.name}</CardTitle>
                        <Badge variant="outline" className="bg-amber-100 text-amber-800">Unverified</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{program.institution}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span><MapPin className="h-4 w-4 mr-1" /> {program.city}, {program.state}</span>
                        <Badge variant="outline" className="text-capitalize">{program.program_type}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scams">
          {!loading && filteredPrograms.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">No scam reports yet.</CardContent></Card>}
          {!loading && filteredPrograms.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPrograms.map(program => (
                <Link key={program.id} to={`/programs/${program.id}`} className="text-inherit no-underline">
                  <Card className="border-l-4 border-destructive hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg truncate">{program.name}</CardTitle>
                        <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" /> {program.scam_reports_count} Reports</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{program.institution}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span><MapPin className="h-4 w-4 mr-1" /> {program.city}, {program.state}</span>
                        <Badge variant="outline" className="text-capitalize">{program.program_type}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
=======
            <Card><CardContent className="py-12 text-center text-muted-foreground">No programs match your active wide-net filters. Try selecting additional states or clearing filters.</CardContent></Card>
          ) : renderProgramCards(filteredPrograms)}
        </TabsContent>

        <TabsContent value="verified" className="mt-4">
          {!loading && filteredPrograms.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">No verified programs yet for this criteria.</CardContent></Card>}
          {!loading && filteredPrograms.length > 0 && renderProgramCards(filteredPrograms)}
        </TabsContent>

        <TabsContent value="unverified" className="mt-4">
          {!loading && filteredPrograms.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">All matching programs are verified.</CardContent></Card>}
          {!loading && filteredPrograms.length > 0 && renderProgramCards(filteredPrograms)}
        </TabsContent>

        <TabsContent value="scams" className="mt-4">
          {!loading && filteredPrograms.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">No scam reports for matching programs.</CardContent></Card>}
          {!loading && filteredPrograms.length > 0 && renderProgramCards(filteredPrograms)}
>>>>>>> f0b0ebb (feat: Multi-location program search, saved search presets, and OB/GYN import workbench)
        </TabsContent>
      </Tabs>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-600">
            Page <span className="font-semibold text-slate-900">{page}</span> of <span className="font-semibold text-slate-900">{totalPages}</span> ({totalCount} total programs)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              className="rounded-full"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              className="rounded-full"
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}