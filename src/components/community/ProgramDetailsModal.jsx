import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ExternalLink, 
  AlertTriangle, 
  MapPin, 
  Plane, 
  Home, 
  DollarSign, 
  GraduationCap, 
  TrendingUp, 
  Sparkles,
  Award,
  Users,
  Moon
} from 'lucide-react';
import { fetchProgramNotes, createProgramNote, fetchScamReports, createScamReport } from '@/api/programs';
import { toast } from 'sonner';

export default function ProgramDetailsModal({ open, onClose, program, profile, calculateFitScore }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState([]);
  const [scams, setScams] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [newScam, setNewScam] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);
  const [submittingScam, setSubmittingScam] = useState(false);

  useEffect(() => {
    if (open && program?.id) {
      loadNotesAndScams();
    }
  }, [open, program?.id]);

  const loadNotesAndScams = async () => {
    try {
      setLoading(true);
      const [notesData, scamsData] = await Promise.all([
        fetchProgramNotes(program.id),
        fetchScamReports(program.id)
      ]);
      setNotes(notesData || []);
      setScams(scamsData || []);
    } catch (err) {
      console.error('Failed to load notes or scams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    try {
      await createProgramNote(program.id, {
        content: newNote,
        title: '',
        note_type: 'experience',
        rating: null
      });
      toast.success('Note submitted successfully!');
      setNewNote('');
      loadNotesAndScams();
    } catch (err) {
      toast.error(err.message || 'Failed to submit note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleAddScam = async (e) => {
    e.preventDefault();
    if (!newScam.trim()) return;
    setSubmittingScam(true);
    try {
      await createScamReport({
        program_id: program.id,
        incident_type: 'Other',
        details: newScam
      });
      toast.success('Incident flag filed successfully!');
      setNewScam('');
      loadNotesAndScams();
    } catch (err) {
      toast.error(err.message || 'Failed to file report');
    } finally {
      setSubmittingScam(false);
    }
  };

  if (!program) return null;

  const fit = calculateFitScore ? calculateFitScore(program) : { reasons: [], score: 50 };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="space-y-4">
          <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-xl font-bold text-slate-950 dark:text-white">
              {program.program_name}
            </DialogTitle>
            <p className="text-slate-500 text-sm">
              {program.institution} — {program.city}, {program.state}
            </p>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap gap-1 w-full bg-slate-100 dark:bg-slate-850 p-1 mb-4 rounded-xl">
              <TabsTrigger value="overview" className="text-xs flex-grow py-1.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">Info</TabsTrigger>
              <TabsTrigger value="fit" className="text-xs flex-grow py-1.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">Fit & Visa</TabsTrigger>
              <TabsTrigger value="reqs" className="text-xs flex-grow py-1.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">Reqs & Cost</TabsTrigger>
              <TabsTrigger value="benefits" className="text-xs flex-grow py-1.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">Stipends</TabsTrigger>
              <TabsTrigger value="maps" className="text-xs flex-grow py-1.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">Maps & Lifestyle</TabsTrigger>
              <TabsTrigger value="soap" className="text-xs flex-grow py-1.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">SOAP</TabsTrigger>
              <TabsTrigger value="notes" className="text-xs flex-grow py-1.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                Notes {notes.length > 0 && `(${notes.length})`}
              </TabsTrigger>
              <TabsTrigger value="scams" className="text-xs flex-grow py-1.5 rounded-lg text-amber-600 dark:text-amber-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                Scams {scams.length > 0 && `(${scams.length})`}
              </TabsTrigger>
            </TabsList>

            {/* Tab Content: Overview */}
            <TabsContent value="overview" className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-slate-455 block">Specialty</span>
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{program.specialty}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-455 block">Subspecialty</span>
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{program.subspecialty || 'General'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-455 block">Program Type</span>
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    {program.community_program ? 'Community Program' : 'University Hospital'}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-455 block">Interview Format</span>
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{program.interview_format}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-450">NRMP Match Code:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{program.nrmp_code || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">Total Residents:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{program.program_size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">Annual Intake Slots:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{program.annual_intake || 'N/A'}</span>
                </div>
              </div>

              {program.website && (
                <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl mt-2 text-white">
                  <a href={program.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Official Website
                  </a>
                </Button>
              )}
            </TabsContent>

            {/* Tab Content: Fit */}
            <TabsContent value="fit" className="space-y-4 pt-1">
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Personal Match Compatibility</h4>
                
                <div className="space-y-2 text-xs">
                  {/* Step 2 CK */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30">
                    <span className="text-slate-700 dark:text-slate-300">Step 2 CK Score</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-450">Min: {program.step2_score_min} (Avg: {program.step2_score_avg})</span>
                      <Badge className="font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50">
                        You: {profile?.usmle_step2_score || "N/A"}
                      </Badge>
                    </div>
                  </div>

                  {/* Visa */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30">
                    <span className="text-slate-700 dark:text-slate-300">Visa Sponsorship</span>
                    <div className="flex items-center gap-1.5">
                      {program.visa_j1 && <Badge variant="outline" className="dark:border-slate-700 dark:text-slate-300">J-1</Badge>}
                      {program.visa_h1b && <Badge variant="outline" className="dark:border-slate-700 dark:text-slate-300">H-1B</Badge>}
                      <Badge className="font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50">
                        You: {profile?.visa_status === 'none' ? 'Needs Visa' : profile?.visa_status}
                      </Badge>
                    </div>
                  </div>

                  {/* USCE */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30">
                    <span className="text-slate-700 dark:text-slate-300">US Clinical Experience (USCE)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-450">Preferred: {program.min_usce_months || 0} mos</span>
                      <Badge className="font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50">
                        You: {profile?.us_clinical_experience ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>

                  {/* Grad year */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30">
                    <span className="text-slate-700 dark:text-slate-300">Graduation Year Cutoff</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-450">Cutoff: {program.grad_year_cutoff ? `${program.grad_year_cutoff} yrs` : 'None'}</span>
                      <Badge className="font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50">
                        You: {profile?.graduation_year || "N/A"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Breakdown Reasons */}
                <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/15 border border-indigo-100 dark:border-indigo-900 rounded-2xl text-xs space-y-2 mt-2">
                  <span className="font-bold text-indigo-900 dark:text-indigo-400 block mb-1">Fit Analysis Breakdown:</span>
                  {fit.reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-indigo-955 dark:text-indigo-300">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Tab Content: Requirements & Costs */}
            <TabsContent value="reqs" className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-slate-455 block">LoR Requirements</span>
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{program.lor_required || 3} letters</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-455 block">Step 3 Required?</span>
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{program.step3_required ? 'Yes' : 'No'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-455 block">Application Deadline</span>
                  <span className="font-semibold text-sm text-amber-600 dark:text-amber-500">{program.application_deadline}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-455 block">Graduation Rate</span>
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{program.graduation_rate || 'N/A'}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-1.5">Estimated ERAS & Interview Cost</h4>
                <div className="flex justify-between">
                  <span className="text-slate-450">ERAS Base Application Fee:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">${program.estimated_cost?.application_fee || 26}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">Interview Format Travel Estimate:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">${program.estimated_cost?.travel_cost || 0}</span>
                </div>
                <div className="flex justify-between border-t dark:border-slate-800 pt-1.5 font-bold">
                  <span className="text-indigo-650 dark:text-indigo-400">Total Program Cost Estimate:</span>
                  <span className="text-indigo-650 dark:text-indigo-400">${(program.estimated_cost?.application_fee || 26) + (program.estimated_cost?.travel_cost || 0)}</span>
                </div>
              </div>
            </TabsContent>

            {/* Tab Content: Stipends & Benefits */}
            <TabsContent value="benefits" className="space-y-4 pt-1">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-1.5">Financial package (Stipends & Perks)</h4>
                <div className="flex justify-between">
                  <span className="text-slate-455">Annual PGY-1 Stipend:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ${program.stipends_benefits?.annual_stipend?.toLocaleString() || "65,000"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">Health Insurance:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {program.stipends_benefits?.health_insurance ? "Included (Full Coverage)" : "Co-pay required"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">CME / Book Allowance:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ${program.stipends_benefits?.cme_allowance?.toLocaleString() || "1,000"} / year
                  </span>
                </div>
                {program.stipends_benefits?.housing_stipend > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="text-slate-455">Housing Stipend Add-on:</span>
                    <span>${program.stipends_benefits.housing_stipend.toLocaleString()} / year</span>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab Content: Maps & Lifestyle (Google Maps Concept) */}
            <TabsContent value="maps" className="space-y-4 pt-1 text-xs">
              <div className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/15 dark:to-slate-900 border border-blue-150 rounded-2xl">
                <h4 className="font-bold text-sm text-blue-900 dark:text-blue-400 flex items-center gap-1.5 mb-1">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  "Google Maps" for Applicants: Local Intelligence
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Intelligent geographical analysis for relocation, cost-of-living index, nearest logistics nodes, and program lifestyle data.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cost of Living & Housing */}
                <Card className="p-4 border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 rounded-2xl">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border-b pb-1.5">
                    <Home className="w-4 h-4 text-emerald-500" />
                    Living & Housing Index
                  </span>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rent Cost Index</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {program.city?.toLowerCase().includes('new york') || program.city?.toLowerCase().includes('boston') || program.city?.toLowerCase().includes('los angeles') ? 'High ($$$$)' : 'Moderate ($$)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Average 1BR Rent</span>
                      <span className="font-semibold">
                        {program.city?.toLowerCase().includes('new york') || program.city?.toLowerCase().includes('boston') || program.city?.toLowerCase().includes('los angeles') ? '$2,200 - $3,100/mo' : '$1,100 - $1,600/mo'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Housing Availability</span>
                      <span className="font-semibold">
                        {program.city?.toLowerCase().includes('pittsburgh') ? 'Excellent (Subsidized options available)' : 'Moderate'}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Transportation & Hubs */}
                <Card className="p-4 border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 rounded-2xl">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border-b pb-1.5">
                    <Plane className="w-4 h-4 text-blue-500" />
                    Nearby Logistics & Airports
                  </span>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nearest Airport Hub</span>
                      <span className="font-semibold">
                        {program.city?.toLowerCase().includes('pittsburgh') ? 'PIT (Pittsburgh Int\'l)' : 
                         program.city?.toLowerCase().includes('chicago') ? 'ORD / MDW' : 
                         program.city?.toLowerCase().includes('bronx') || program.city?.toLowerCase().includes('brooklyn') ? 'LGA / JFK / EWR' : 
                         'Local Airport (within 20 miles)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Public Transit Rating</span>
                      <span className="font-semibold">
                        {program.city?.toLowerCase().includes('bronx') || program.city?.toLowerCase().includes('brooklyn') || program.city?.toLowerCase().includes('boston') ? 'Excellent (Subway & Bus)' : 
                         program.city?.toLowerCase().includes('pittsburgh') ? 'Very Good (Free university shuttles)' : 
                         'Car recommended'}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Training Environment & Moonlighting */}
                <Card className="p-4 border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 rounded-2xl">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border-b pb-1.5">
                    <Moon className="w-4 h-4 text-purple-500" />
                    Moonlighting & Work Culture
                  </span>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Moonlighting Allowed</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {program.program_type === 'fellowship' || program.subspecialty ? 'Yes (Clinical & Research shifts)' : 'Yes (For PGY-2+ with license)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Call Schedule Style</span>
                      <span className="font-semibold">Night Float rotation system</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Work/Life Score</span>
                      <span className="font-semibold">8.5 / 10</span>
                    </div>
                  </div>
                </Card>

                {/* Fellowship & Alumni Placement */}
                <Card className="p-4 border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 rounded-2xl">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border-b pb-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                    Alumni Outcomes
                  </span>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fellowship Match Rate</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {program.program_type === 'fellowship' ? '100% Board Certified' : '92% overall match success'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Primary Placements</span>
                      <span className="font-semibold truncate max-w-[130px]" title="Pediatric Specialties, Cardiology, Hematology, Primary Care">
                        {program.program_type === 'fellowship' ? 'Academic Medicine' : 'Cardiology, Pulm/Onc, Hospitalist'}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* AI Program Summary */}
              <div className="p-4 bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/40 rounded-2xl text-xs space-y-2">
                <span className="font-bold text-indigo-900 dark:text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500 fill-current animate-float" />
                  AI Program Summary Analysis
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  "{program.program_name} in {program.city}, {program.state} represents an exceptional match for candidates emphasizing comprehensive clinical exposure. With an annual intake of {program.annual_intake || 3} and an IMG enrollment rate near {Math.round(program.img_percentage || 45)}%, the department supports solid visa sponsorships (J-1/H-1B). Located near key regional airport hubs and transit lines, residents benefit from subsidized housing packages and premium PGY-1 stipends."
                </p>
              </div>
            </TabsContent>

            {/* Tab Content: SOAP History */}
            <TabsContent value="soap" className="space-y-4 pt-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Historical Open Positions (SOAP History)</h4>
              <p className="text-xs text-slate-500">
                Review unfilled program positions entered into the SOAP (Post-Match Supplemental Offer and Acceptance Program) in previous Match years.
              </p>

              <Table>
                <TableHeader>
                  <TableRow className="dark:border-slate-800">
                    <TableHead className="dark:text-slate-400">Year</TableHead>
                    <TableHead className="text-right dark:text-slate-400">Unfilled SOAP Spots</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {program.historical_open_spots?.map((row, idx) => (
                    <TableRow key={idx} className="dark:border-slate-800">
                      <TableCell className="dark:text-slate-300">{row.year}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {row.spots === 0 ? (
                          <Badge className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/50" variant="outline">0 spots</Badge>
                        ) : (
                          <Badge className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-250 dark:border-amber-900/50" variant="outline">{row.spots} spots</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-slate-400 dark:text-slate-500">No historical SOAP data available.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* COMMUNITY NOTES TAB PANEL */}
            <TabsContent value="notes" className="space-y-4 pt-1">
              <div className="space-y-2">
                {loading ? (
                  <p className="text-sm text-slate-500 italic text-center py-4">Loading notes...</p>
                ) : notes.length === 0 ? (
                  <p className="text-sm text-slate-500 italic py-2">No community notes added yet for this program.</p>
                ) : (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {notes.map((note, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                        <p className="text-sm text-slate-800 dark:text-slate-200">{note.content || note.text}</p>
                        <span className="text-xs text-slate-400 dark:text-slate-500 block mt-1">
                          Submitted on {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'recent'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <form onSubmit={handleAddNote} className="mt-4 pt-4 border-t dark:border-slate-800">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add an anonymous note about deadlines, communication, or application tips..."
                  className="w-full p-3 border dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow text-slate-805 dark:text-slate-200"
                  rows={3}
                />
                <Button 
                  type="submit" 
                  disabled={submittingNote || !newNote.trim()} 
                  className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium"
                >
                  {submittingNote ? 'Submitting...' : 'Submit Note'}
                </Button>
              </form>
            </TabsContent>

            {/* SCAM ALERTS TAB PANEL */}
            <TabsContent value="scams" className="space-y-4 pt-1">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-amber-800 dark:text-amber-300 text-xs">
                ⚠️ <strong>Anti-Predatory Warning:</strong> Use this section to flag unverified third-party rotation agencies, hidden fees, or false matching guarantees associated with this program listing.
              </div>

              <div className="space-y-2">
                {loading ? (
                  <p className="text-sm text-slate-500 italic text-center py-4">Loading reports...</p>
                ) : scams.length === 0 ? (
                  <p className="text-sm text-slate-500 italic text-center py-4">No flags or scam alerts reported for this entity.</p>
                ) : (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {scams.map((scam, idx) => (
                      <div key={idx} className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/50 text-rose-900 dark:text-rose-200">
                        <p className="text-sm font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                          {scam.incident_type}
                        </p>
                        <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">{scam.details}</p>
                        {scam.created_at && (
                          <span className="text-[10px] text-rose-400 dark:text-rose-500/70 block mt-1">
                            Reported on {new Date(scam.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleAddScam} className="mt-4 pt-4 border-t dark:border-slate-800">
                <input 
                  type="text"
                  value={newScam}
                  onChange={(e) => setNewScam(e.target.value)}
                  placeholder="Report a specific scam practice, fake offer, or malicious link..."
                  className="w-full p-3 border dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-shadow text-slate-805 dark:text-slate-200"
                />
                <Button 
                  type="submit" 
                  disabled={submittingScam || !newScam.trim()}
                  className="mt-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium"
                >
                  {submittingScam ? 'Filing Flag...' : 'File Incident Flag'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
