import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Search, Filter, MapPin, BookOpen, Shield, Plus, AlertTriangle, Verified, Stethoscope, Download } from 'lucide-react';
import { fetchPrograms } from '@/api/programs';
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

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const STATE_PRESETS = [
  { label: 'Tri-State Area', values: ['NY', 'NJ', 'PA', 'CT'] },
  { label: 'West Coast', values: ['CA', 'OR', 'WA'] },
];

export default function ProgramsList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
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
    loadPrograms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, programs, activeTab]);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      const data = await fetchPrograms();
      setPrograms(data);
      setFilteredPrograms(data);
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
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({programs.length})</TabsTrigger>
          <TabsTrigger value="verified">Verified ({programs.filter(p => p.verified).length})</TabsTrigger>
          <TabsTrigger value="unverified">Unverified ({programs.filter(p => !p.verified).length})</TabsTrigger>
          <TabsTrigger value="scams">⚠️ Reports ({programs.filter(p => p.scam_reports_count > 0).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filteredPrograms.length === 0 ? (
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
        </TabsContent>
      </Tabs>
    </div>
  );
}