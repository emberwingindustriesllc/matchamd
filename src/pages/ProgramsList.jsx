import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Search, Filter, MapPin, BookOpen, Shield, Plus, AlertTriangle, Verified, Sparkles } from 'lucide-react';
import { fetchPrograms } from '@/api/programs';
import AddProgramModal from '@/components/community/AddProgramModal';
import { toast } from 'sonner';

const SPECIALTIES = [
  'Internal Medicine', 'Family Medicine', 'Pediatrics', 'Surgery',
  'Emergency Medicine', 'Psychiatry', 'OB/GYN', 'Neurology',
  'Radiology', 'Anesthesiology', 'Pathology', 'Dermatology',
  'Cardiology', 'Gastroenterology', 'Nephrology', 'Pulmonology',
  'Endocrinology', 'Hematology/Oncology', 'Infectious Disease',
  'Rheumatology', 'Allergy/Immunology', 'Other',
];

const PROGRAM_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'residency_categorical', label: 'Categorical Residency' },
  { value: 'residency_preliminary', label: 'Preliminary Residency (Prelim)' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'observership', label: 'Observership' },
  { value: 'research', label: 'Research' },
  { value: 'elective', label: 'Elective' },
];

const US_STATES = [
  { value: '', label: 'All States' },
  ...['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(s => ({ value: s, label: s })),
];

export default function ProgramsList() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    specialty: '',
    program_type: '',
    state: '',
    verifiedOnly: false,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadPrograms();
  }, [filters, activeTab]);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      let dbProgramType = filters.program_type;
      if (filters.program_type === 'residency_categorical' || filters.program_type === 'residency_preliminary') {
        dbProgramType = 'residency';
      }

      const data = await fetchPrograms({
        ...filters,
        program_type: dbProgramType,
        limit: 100,
      });

      let processedData = data;
      if (filters.program_type === 'residency_categorical') {
        processedData = data.filter(p => {
          const name = p.name || '';
          const specialty = Array.isArray(p.specialty) ? p.specialty.join(' ') : (p.specialty || '');
          const isPrelim = name.toLowerCase().includes('prelim') || name.toLowerCase().includes('transitional') || specialty.toLowerCase().includes('prelim') || specialty.toLowerCase().includes('transitional');
          return !isPrelim;
        });
      } else if (filters.program_type === 'residency_preliminary') {
        processedData = data.filter(p => {
          const name = p.name || '';
          const specialty = Array.isArray(p.specialty) ? p.specialty.join(' ') : (p.specialty || '');
          const isPrelim = name.toLowerCase().includes('prelim') || name.toLowerCase().includes('transitional') || specialty.toLowerCase().includes('prelim') || specialty.toLowerCase().includes('transitional');
          return isPrelim;
        });
      }

      setPrograms(processedData);
    } catch (error) {
      console.error('Failed to load programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', specialty: '', program_type: '', state: '', verifiedOnly: false });
  };

  const filteredPrograms = programs.filter(p => {
    if (activeTab === 'verified' && !p.verified) return false;
    if (activeTab === 'unverified' && p.verified) return false;
    if (activeTab === 'scams' && p.scam_reports_count === 0) return false;
    return true;
  });

  const verifiedCount = programs.filter(p => p.verified).length;
  const reportedCount = programs.filter(p => p.scam_reports_count > 0).length;

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
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize text-slate-700">{typeLabel}</Badge>
                    {program.is_acgme_accredited && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        <Shield className="mr-1 h-3 w-3" /> ACGME
                      </Badge>
                    )}
                    {program.ecfmg_pathway_eligible && (
                      <Badge variant="outline" className="bg-violet-50 text-violet-700">
                        <BookOpen className="mr-1 h-3 w-3" /> ECFMG
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-[rgb(var(--color-primary))] p-6 text-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.7)]"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-slate-100 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              <span>Community-driven program discovery</span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Find the programs that fit your path</h1>
            <p className="mt-3 max-w-xl text-sm text-slate-200/90 sm:text-base">
              Browse verified training opportunities, community notes, and scam warnings in one polished place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-2xl font-semibold">{programs.length}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-200/80">Programs</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-2xl font-semibold">{verifiedCount}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-200/80">Verified</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-2xl font-semibold">{reportedCount}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-200/80">Reports</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Search and filter</h2>
          <p className="text-sm text-slate-600">Narrow the list by specialty, location, and verification status.</p>
        </div>
        <AddProgramModal open={showAddModal} onOpenChange={setShowAddModal} onSuccess={loadPrograms} />
        <Button onClick={() => setShowAddModal(true)} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" /> Add Program
        </Button>
      </div>

      <Card className="border-slate-200/80 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative min-w-[260px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search programs, institutions..."
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filters.specialty} onValueChange={v => handleFilterChange('specialty', v)}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Specialty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Specialties</SelectItem>
                {SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.program_type} onValueChange={v => handleFilterChange('program_type', v)}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>{PROGRAM_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filters.state} onValueChange={v => handleFilterChange('state', v)}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="State" /></SelectTrigger>
              <SelectContent>{US_STATES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <input type="checkbox" checked={filters.verifiedOnly} onChange={e => handleFilterChange('verifiedOnly', e.target.checked)} className="rounded border-slate-300" />
              <span>Verified only</span>
            </label>
            {(filters.search || filters.specialty || filters.program_type || filters.state || filters.verifiedOnly) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-full">
                <Filter className="mr-1 h-4 w-4" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 rounded-full bg-slate-100 p-1">
          <TabsTrigger value="all" className="rounded-full">All ({programs.length})</TabsTrigger>
          <TabsTrigger value="verified" className="rounded-full">Verified ({verifiedCount})</TabsTrigger>
          <TabsTrigger value="unverified" className="rounded-full">Unverified ({programs.filter(p => !p.verified).length})</TabsTrigger>
          <TabsTrigger value="scams" className="rounded-full">⚠️ Reports ({reportedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filteredPrograms.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No programs found. Try adjusting filters or add one.</CardContent></Card>
          ) : renderProgramCards(filteredPrograms)}
        </TabsContent>

        <TabsContent value="verified" className="mt-4">
          {!loading && filteredPrograms.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">No verified programs yet.</CardContent></Card>}
          {!loading && filteredPrograms.length > 0 && renderProgramCards(filteredPrograms)}
        </TabsContent>

        <TabsContent value="unverified" className="mt-4">
          {!loading && filteredPrograms.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">All programs are verified.</CardContent></Card>}
          {!loading && filteredPrograms.length > 0 && renderProgramCards(filteredPrograms)}
        </TabsContent>

        <TabsContent value="scams" className="mt-4">
          {!loading && filteredPrograms.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">No scam reports yet.</CardContent></Card>}
          {!loading && filteredPrograms.length > 0 && renderProgramCards(filteredPrograms)}
        </TabsContent>
      </Tabs>
    </div>
  );
}