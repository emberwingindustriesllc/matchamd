import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, Globe, Mail, Shield, ShieldCheck, AlertTriangle, BookOpen, Plus, Loader2,
  Verified, Calculator
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/AuthContext';
import {
  fetchProgramById,
  createProgramNote,
  fetchProgramNotes,
  fetchScamReports,
  updateScamReportStatus,
} from '@/api/programs';
import { createPageUrl } from '@/utils';
import ReportScamModal from '@/components/community/ReportScamModal';
import AddProgramModal from '@/components/community/AddProgramModal';
import ProgramNoteCard from '@/components/community/ProgramNoteCard';
import ScamReportCard from '@/components/community/ScamReportCard';
import { toast } from 'sonner';

const PROGRAM_TYPE_LABELS = {
  residency: 'Residency',
  fellowship: 'Fellowship',
  observership: 'Observership',
  research: 'Research',
  elective: 'Elective',
};

export default function ProgramDetail() {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const id = paramId || searchParams.get('id');
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
  const [budgetedPrograms, setBudgetedPrograms] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('matchamd_budgeted_programs') || '[]');
    } catch {
      return [];
    }
  });

  const isBudgeted = program && budgetedPrograms.some(p => p.id === program.id || p.name === program.name);

  const toggleBudgetProgram = () => {
    if (!program) return;
    const exists = budgetedPrograms.some(p => p.id === program.id || p.name === program.name);
    let updated;
    if (exists) {
      updated = budgetedPrograms.filter(p => p.id !== program.id && p.name !== program.name);
      toast.info(`Removed ${program.name} from ERAS Budget`);
    } else {
      const entry = {
        id: program.id,
        name: program.name,
        institution: program.institution,
        specialty: Array.isArray(program.specialty) ? program.specialty.join(', ') : program.specialty,
        city: program.city,
        state: program.state
      };
      updated = [...budgetedPrograms, entry];
      toast.success(`Added ${program.name} to ERAS Budget!`);
    }
    setBudgetedPrograms(updated);
    localStorage.setItem('matchamd_budgeted_programs', JSON.stringify(updated));
  };

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
      navigate(createPageUrl('ProgramsList'));
    } finally {
      setLoading(false);
    }
  };

  const checkModerator = async () => {
    if (!user) return;
    // In real app, check user_reputation table
    // For now, mock based on email or role
    setIsModerator(user.email?.includes('admin') || user.user_metadata?.role === 'moderator');
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
      toast.error(error.message || 'Failed to update report status');
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
        <Button onClick={() => navigate(createPageUrl('ProgramsList'))} className="mt-4">Browse Programs</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{program.name}</h1>
            {program.verified && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <Verified className="h-3 w-3 mr-1" /> Verified
              </Badge>
            )}
            <Badge variant="outline" className="text-capitalize">
              {PROGRAM_TYPE_LABELS[program.program_type] || program.program_type}
            </Badge>
            {program.is_acgme_accredited && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                <Shield className="h-3 w-3 mr-1" /> ACGME
              </Badge>
            )}
            {program.ecfmg_pathway_eligible && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                <BookOpen className="h-3 w-3 mr-1" /> ECFMG Pathway
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{program.institution}</p>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {program.city}, {program.state}</span>
            {program.specialty?.length && (
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {program.specialty.join(', ')}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={isBudgeted ? "default" : "outline"}
            onClick={toggleBudgetProgram}
            className={isBudgeted ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-emerald-600/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"}
          >
            <Calculator className="h-4 w-4 mr-2" />
            {isBudgeted ? 'In ERAS Budget ✓' : '+ Add to ERAS Budget'}
          </Button>
          <AddProgramModal open={showAddProgramModal} onOpenChange={setShowAddProgramModal} onSuccess={loadProgram} />
          <Button variant="outline" onClick={() => setShowAddProgramModal(true)}><Plus className="h-4 w-4 mr-2" /> Add Program</Button>
          <ReportScamModal
            programId={program.id}
            programName={program.name}
            open={showReportModal}
            onOpenChange={setShowReportModal}
          />
          <Button variant="destructive" onClick={() => setShowReportModal(true)}>
            <AlertTriangle className="h-4 w-4 mr-2" /> Report Scam
          </Button>
        </div>
        <p className="text-xs text-muted-foreground max-w-3xl">
          <strong>Before you report:</strong> nothing you file is published until a moderator
          verifies it. An unverified allegation about a real institution can hurt real
          people, which is why at least one piece of evidence is required and why a
          moderator &mdash; not you and not the program &mdash; decides what gets shown.
          Verified reports expire after 12 months, because programs and circumstances
          change. Please use this for facts you can document, not to settle a personal
          dispute with a coordinator or a program.
        </p>
      </div>

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
                <a href={`mailto:${program.contact_email}`} className="flex items-center gap-2 text-primary hover:underline">
                  <Mail className="h-5 w-5" /> Contact
                </a>
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
          <TabsTrigger value="notes">Community Notes{notes.length > 0 ? ` (${notes.length})` : ''}</TabsTrigger>
          <TabsTrigger value="reports">Scam Reports{reports.length > 0 ? ` (${reports.length})` : ''}</TabsTrigger>
          <TabsTrigger value="add">Add Note</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Program Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 md:grid-cols-2 text-sm">
                <div><span className="text-muted-foreground">Type:</span> <span className="ml-2 capitalize">{PROGRAM_TYPE_LABELS[program.program_type]}</span></div>
                <div><span className="text-muted-foreground">Location:</span> <span className="ml-2">{program.city}, {program.state}</span></div>
                <div><span className="text-muted-foreground">Specialties:</span> <span className="ml-2">{program.specialty?.join(', ') || '—'}</span></div>
                <div><span className="text-muted-foreground">IMG Representation:</span> <span className="ml-2 font-semibold text-amber-700 dark:text-amber-400">{program.img_percentage != null ? `${program.img_percentage}% IMGs` : (program.accepts_img ? 'IMG Friendly' : '—')}</span></div>
                {program.graduation_rate && (
                  <div><span className="text-muted-foreground">Graduation Rate:</span> <span className="ml-2 font-semibold text-emerald-700 dark:text-emerald-400">{program.graduation_rate}</span></div>
                )}
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
              <Card>
                <CardContent className="py-10 px-6 text-center space-y-2">
                  <p className="font-medium text-foreground">No notes on this program yet</p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Community notes are firsthand write-ups from people who actually
                    interviewed here, matched here, or spent a rotation here &mdash; what the
                    PD really asked, how the interview felt, what the program does not
                    advertise. If that is you, you are the only one who can write it.
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Add your experience above (or log in first) to be the first note on
                    this program.
                  </p>
                </CardContent>
              </Card>
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
            <Card>
              <CardContent className="py-10 px-6 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-foreground font-medium">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  No verified scam reports for this program
                </div>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Nothing appears here until a moderator has checked it. That is on
                  purpose: an unverified accusation against a real hospital or program
                  can do real damage to real people, so every report is read by a human
                  before anyone else sees it.
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Reports are anonymous and require evidence (screenshots, contracts,
                  emails, chat logs). If something happened to you here, file it &mdash; it
                  appears once a moderator verifies it, and verified reports expire
                  after 12 months.
                </p>
              </CardContent>
            </Card>
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
    </div>
  );
}