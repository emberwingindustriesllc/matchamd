import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MapPin, Globe, Mail, Shield, AlertTriangle, 
  BookOpen, Plus, Loader2, Verified, Sparkles,
  Info, Check, Copy
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getProgramFitDetails } from '@/lib/programMatch';
import { fetchProgramById, createProgramNote, updateScamReportStatus, fetchScamReports, fetchProgramNotes } from '@/api/programs';
import ReportScamModal from '@/components/community/ReportScamModal';
import AddProgramModal from '@/components/community/AddProgramModal';
import ProgramNoteCard from '@/components/community/ProgramNoteCard';
import ScamReportCard from '@/components/community/ScamReportCard';
import { toast } from 'sonner';
import { canManageModeration } from '@/lib/moderation';
import { supabase } from '@/api/supabaseClient';

const PROGRAM_TYPE_LABELS = {
  residency: 'Residency',
  fellowship: 'Fellowship',
  observership: 'Observership',
  research: 'Research',
  elective: 'Elective',
};

export default function ProgramDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [program, setProgram] = useState(null);
  const [notes, setNotes] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAddProgramModal, setShowAddProgramModal] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', note_type: 'experience', rating: null });
  const [submittingNote, setSubmittingNote] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

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

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadProgram();
    checkModerator();
  }, [id]);

  const loadProgram = async () => {
    try {
      setLoading(true);
      const [programData, notesData, reportsData] = await Promise.all([
        fetchProgramById(id),
        fetchProgramNotes(id),
        fetchScamReports(id),
      ]);
      setProgram(programData);
      setNotes(notesData);
      setReports(reportsData);
    } catch (error) {
      console.error('Failed to load program:', error);
      toast.error('Failed to load program');
      navigate('/programs');
    } finally {
      setLoading(false);
    }
  };

  const checkModerator = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      setIsModerator(canManageModeration(profile?.role));
    } catch (error) {
      console.error('Failed to determine moderator status', error);
      setIsModerator(false);
    }
  };

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!newNote.content.trim()) return;
    if (!isAuthenticated) { toast.error('Please log in to add notes'); return; }

    setSubmittingNote(true);
    try {
      await createProgramNote(id, newNote);
      toast.success('Note added');
      setNewNote({ title: '', content: '', note_type: 'experience', rating: null });
      loadProgram(); // refresh
    } catch (error) {
      toast.error(error.message || 'Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleReportStatusChange = async (reportId, status, moderatorNotes) => {
    try {
      await updateScamReportStatus(reportId, status, moderatorNotes);
      toast.success(`Report marked as ${status}`);
      loadProgram();
    } catch (error) {
      toast.error(error.message || 'Unable to update report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-medium">Program Not Found</h2>
        <Button onClick={() => navigate('/programs')} className="mt-4">Browse Programs</Button>
      </div>
    );
  }

  const normalizedProgram = {
    ...program,
    program_name: program?.program_name || program?.name,
    institution: program?.institution || program?.description || 'Community Program',
  };

  const fitDetails = profile && program ? getProgramFitDetails(profile, normalizedProgram) : null;

  const targetSpec = (profile?.target_specialty || '').toLowerCase();
  const pSpecs = Array.isArray(program?.specialty) 
    ? program.specialty.map(s => s.toLowerCase()) 
    : [ (program?.specialty || '').toLowerCase() ];
  const specialtyMatches = targetSpec && pSpecs.some(s => s.includes(targetSpec) || targetSpec.includes(s));

  const getEmailSubject = () => {
    return `Inquiry Regarding Clinical Opportunities - Dr. ${profile?.display_name || user?.email?.split('@')[0] || ''}`;
  };

  const getEmailBody = () => {
    return `Dear Program Coordinator,

I hope this email finds you well.

I am contacting you to inquire about clinical matching and observership opportunities at ${normalizedProgram.program_name} (${normalizedProgram.institution || ''}). 

Here are my clinical qualifications for your review:
- Target Specialty: ${profile?.target_specialty || 'Pediatrics'}
- USMLE Step 1 Status: ${profile?.usmle_step1_status === 'passed' ? 'Pass' : 'Pending/Completed'}
- USMLE Step 2 CK score: ${profile?.usmle_step2_score || 'Not provided'}
- US Clinical Experience: ${profile?.us_clinical_experience ? 'Yes' : 'No'}
- Visa Status: ${profile?.visa_status === 'none' ? 'No Visa Required' : (profile?.visa_status || 'Not provided')}

${profile?.bio ? `About Me:\n${profile.bio}\n` : ''}
Thank you very much for your time and consideration.

Sincerely,

Dr. ${profile?.display_name || 'Anonymous'}
${user?.email || ''}`;
  };

  const handleOpenEmailApp = () => {
    const subject = encodeURIComponent(getEmailSubject());
    const body = encodeURIComponent(getEmailBody());
    window.open(`mailto:${program.contact_email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(getEmailBody());
    setCopiedEmail(true);
    toast.success("Draft copied to clipboard!");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-[rgb(var(--color-primary))] p-6 text-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.7)]"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-slate-100 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              <span>Training opportunity snapshot</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold sm:text-3xl">{program.name}</h1>
              {program.verified && (
                <Badge variant="default" className="bg-emerald-500/90 text-white">
                  <Verified className="mr-1 h-3 w-3" /> Verified
                </Badge>
              )}
              <Badge variant="outline" className="border-white/20 bg-white/10 text-white capitalize">
                {PROGRAM_TYPE_LABELS[program.program_type] || program.program_type}
              </Badge>
              {program.is_acgme_accredited && (
                <Badge variant="outline" className="border-sky-200/30 bg-sky-500/20 text-sky-100">
                  <Shield className="mr-1 h-3 w-3" /> ACGME
                </Badge>
              )}
              {program.ecfmg_pathway_eligible && (
                <Badge variant="outline" className="border-violet-200/30 bg-violet-500/20 text-violet-100">
                  <BookOpen className="mr-1 h-3 w-3" /> ECFMG Pathway
                </Badge>
              )}
            </div>
            <p className="mt-3 text-sm text-slate-200/90 sm:text-base">{program.institution}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-200/90">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {program.city}, {program.state}</span>
              {program.specialty?.length && (
                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {program.specialty.join(', ')}</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <AddProgramModal open={showAddProgramModal} onOpenChange={setShowAddProgramModal} onSuccess={loadProgram} />
            <Button className="rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={() => setShowAddProgramModal(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Program
            </Button>
            <ReportScamModal
              programId={program.id}
              programName={program.name}
              open={showReportModal}
              onOpenChange={setShowReportModal}
            />
            <Button className="rounded-full border border-rose-300/40 bg-rose-500/15 text-rose-50 hover:bg-rose-500/25" onClick={() => setShowReportModal(true)}>
              <AlertTriangle className="mr-2 h-4 w-4" /> Report Scam
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Contact Info */}
      {(program.website || program.contact_email || program.description) && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              {program.website && (
                <a href={program.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  <Globe className="h-5 w-5" /> Website
                </a>
              )}
              {program.contact_email && (
                <button
                  onClick={() => {
                    if (isAuthenticated && profile) {
                      setShowEmailModal(true);
                    } else {
                      window.location.href = `mailto:${program.contact_email}`;
                    }
                  }}
                  className="flex items-center gap-2 text-primary hover:underline bg-transparent border-none p-0 cursor-pointer text-left font-normal"
                >
                  <Mail className="h-5 w-5" /> Contact Coordinator
                </button>
              )}
              {program.description && (
                <div className="md:col-span-3">
                  <p className="text-sm text-muted-foreground">{program.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">Community Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="reports">Scam Reports ({reports.length})</TabsTrigger>
          <TabsTrigger value="add">Add Note</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Compatibility Dashboard Card */}
          {isAuthenticated && fitDetails && (
            <Card className="border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 shadow-sm overflow-hidden dark:from-slate-900 dark:to-slate-800/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-500" />
                    Compatibility Dashboard
                  </CardTitle>
                  <Badge className={`text-xs px-2.5 py-1 font-bold ${
                    fitDetails.score >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                    fitDetails.score >= 50 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                    'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}>
                    {fitDetails.score}% Match Alignment
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Real-time credentials matching comparison with your active Clinical Profile.
                </p>

                {/* Compatibility Checks list */}
                <div className="grid gap-2.5">
                  {/* Specialty Check */}
                  <div className="flex items-start justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-xs">
                    <div>
                      <span className="font-semibold block text-slate-700 dark:text-slate-300">Target Specialty</span>
                      <span className="text-muted-foreground mt-0.5 block">Your Target: {profile.target_specialty || 'Not specified'}</span>
                    </div>
                    {specialtyMatches ? (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Matches Specialty</Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-200">Mismatch</Badge>
                    )}
                  </div>

                  {/* Visa Check */}
                  <div className="flex items-start justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-xs">
                    <div>
                      <span className="font-semibold block text-slate-700 dark:text-slate-300">Visa Requirements</span>
                      <span className="text-muted-foreground mt-0.5 block">Your Status: {profile.visa_status === 'none' ? 'No Visa Required' : profile.visa_status}</span>
                    </div>
                    {!fitDetails.visaIssue ? (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Eligible / Sponsors</Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">Needs Sponsor</Badge>
                    )}
                  </div>

                  {/* Step 2 CK Check */}
                  <div className="flex items-start justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-xs">
                    <div>
                      <span className="font-semibold block text-slate-700 dark:text-slate-300">USMLE Step 2 Score</span>
                      <span className="text-muted-foreground mt-0.5 block">
                        Your Score: {profile.usmle_step2_score || 'Not provided'} (Program Min: {program.step2_score_min || 'None'}, Avg: {program.step2_score_avg || 'None'})
                      </span>
                    </div>
                    {(!program.step2_score_min || Number(profile.usmle_step2_score) >= program.step2_score_min) ? (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Meets Min</Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">Below Min</Badge>
                    )}
                  </div>
                </div>

                {/* Score analysis details */}
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-3">
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-slate-500" />
                    Match Analysis Reasons
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-muted-foreground">
                    {fitDetails.reasons.map((reason, index) => (
                      <li key={index} className={reason.includes('below') || reason.includes('not provided') || reason.includes('Does not sponsor') || reason.includes('Requires') ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Not logged in CTA */}
          {!isAuthenticated && (
            <Card className="border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
              <CardContent className="pt-6 text-center space-y-3">
                <Sparkles className="h-8 w-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Compatibility Check</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Log in and complete your clinical profile to see a real-time compatibility score and matching details.
                </p>
                <Button size="sm" onClick={() => navigate('/Login')} className="rounded-xl">
                  Log In
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Logged in but missing profile CTA */}
          {isAuthenticated && !profile && (
            <Card className="border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
              <CardContent className="pt-6 text-center space-y-3">
                <Sparkles className="h-8 w-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Complete Your Profile</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Complete your clinical profile settings to see how well you align with this program's requirements.
                </p>
                <Button size="sm" onClick={() => navigate('/profile')} className="rounded-xl">
                  Setup Profile
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Standard Program Details Card */}
          <Card>
            <CardHeader><CardTitle>Program Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 md:grid-cols-2 text-sm">
                <div><span className="text-muted-foreground">Type:</span> <span className="ml-2 capitalize">{PROGRAM_TYPE_LABELS[program.program_type]}</span></div>
                <div><span className="text-muted-foreground">Location:</span> <span className="ml-2">{program.city}, {program.state}</span></div>
                <div><span className="text-muted-foreground">Specialties:</span> <span className="ml-2">{program.specialty?.join(', ') || '—'}</span></div>
                <div><span className="text-muted-foreground">ACGME Accredited:</span> <span className="ml-2">{program.is_acgme_accredited ? 'Yes' : 'No'}</span></div>
                <div><span className="text-muted-foreground">ECFMG Pathway:</span> <span className="ml-2">{program.ecfmg_pathway_eligible ? 'Yes' : 'No'}</span></div>
                <div><span className="text-muted-foreground">Verified:</span> <span className="ml-2">{program.verified ? 'Yes' : 'Pending'}</span></div>
                <div><span className="text-muted-foreground">Submitted:</span> <span className="ml-2">{formatDistanceToNow(new Date(program.created_at), { addSuffix: true })}</span></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          {isAuthenticated ? (
            <Card>
              <CardHeader className="pb-2"><CardTitle>Add Your Experience</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitNote} className="space-y-4">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="note_title">Title (optional)</Label>
                      <Input id="note_title" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} placeholder="e.g., Great IMG Support" />
                    </div>
                    <div className="space-y-1">
                      <Label>Type</Label>
                      <select value={newNote.note_type} onChange={e => setNewNote({...newNote, note_type: e.target.value})} className="w-full rounded border p-2">
                        <option value="experience">Experience</option>
                        <option value="tip">Tip</option>
                        <option value="warning">Warning</option>
                        <option value="cost">Cost Info</option>
                        <option value="visa">Visa</option>
                        <option value="interview">Interview</option>
                        <option value="culture">Culture</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="note_content">Your Note *</Label>
                    <Textarea id="note_content" rows={3} value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} placeholder="Share your experience..." required />
                  </div>
                  <div className="space-y-1">
                    <Label>Rating (optional)</Label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(n => (
                        <button type="button" key={n} onClick={() => setNewNote({...newNote, rating: newNote.rating === n ? null : n})} className={`w-10 h-10 rounded border-2 flex items-center justify-center ${newNote.rating === n ? 'border-primary bg-primary text-primary-foreground' : 'border-muted hover:border-primary/50'}`}>{n}★</button>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" disabled={submittingNote || !newNote.content.trim()}>
                    {submittingNote ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Post Note'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Alert variant="info">
              <AlertDescription>Log in to add notes and see community experiences.</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {notes.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No notes yet. Be the first to share!</CardContent></Card>
            ) : (
              notes.map(note => <ProgramNoteCard key={note.id} note={note} currentUserId={user?.id} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Alert variant="info">
            <AlertDescription>
              <strong>Community-reported scams & predatory practices.</strong> All reports are anonymous and reviewed by moderators before verification.
              Verified reports show a red border and warning badge.
            </AlertDescription>
          </Alert>
          {reports.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No scam reports for this program yet.</CardContent></Card>
          ) : (
            reports.map(report => <ScamReportCard key={report.id} report={report} currentUserId={user?.id} isModerator={isModerator} onStatusChange={handleReportStatusChange} />)
          )}
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Alert variant="info">
            <AlertDescription>Add a new program to the community database. It will be reviewed before publishing.</AlertDescription>
          </Alert>
          <AddProgramModal open={showAddProgramModal} onOpenChange={setShowAddProgramModal} onSuccess={loadProgram} />
          <Button onClick={() => setShowAddProgramModal(true)} className="w-full"><Plus className="h-4 w-4 mr-2" /> Add New Program</Button>
        </TabsContent>
      </Tabs>
      {/* Email Composer Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-500" />
              Inquiry Draft Composer
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              A professional email draft has been generated using your active Clinical Profile credentials.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">To:</span>
              <div className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono">
                {program.contact_email}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">Subject:</span>
              <div className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                {getEmailSubject()}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">Body Preview:</span>
              <textarea
                readOnly
                value={getEmailBody()}
                rows={10}
                className="w-full text-xs p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleCopyEmail} className="rounded-xl flex items-center gap-1.5">
              {copiedEmail ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              {copiedEmail ? 'Copied!' : 'Copy Text'}
            </Button>
            <Button size="sm" onClick={handleOpenEmailApp} className="rounded-xl flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              Open Email App
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}