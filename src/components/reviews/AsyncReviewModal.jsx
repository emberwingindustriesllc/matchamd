import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  FileText, 
  Send, 
  Clock, 
  CheckCircle2, 
  ShieldCheck,
  Link as LinkIcon
} from 'lucide-react';

export default function AsyncReviewModal({ isOpen, onClose, initialType = 'cv_ps', onSubmitted }) {
  const { toast } = useToast();
  const [reviewType, setReviewType] = useState(initialType);
  const [applicantName, setApplicantName] = useState('');
  const [email, setEmail] = useState('');
  const [targetSpecialty, setTargetSpecialty] = useState('Pediatrics');
  const [documentUrl, setDocumentUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [specificQuestions, setSpecificQuestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Sync initialType when modal opens with a different initial type
  React.useEffect(() => {
    if (initialType) setReviewType(initialType);
  }, [initialType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!applicantName.trim() || !email.trim()) {
      toast({
        title: 'Required Information Missing',
        description: 'Please provide your name and email address.',
        variant: 'destructive',
      });
      return;
    }

    if (!documentUrl.trim() && !pastedText.trim()) {
      toast({
        title: 'No Document Provided',
        description: 'Please provide a link to your Google Doc/PDF or paste your draft text below.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const submission = {
      id: `rev_${Date.now()}`,
      type: reviewType,
      applicant_name: applicantName,
      email,
      target_specialty: targetSpecialty,
      document_url: documentUrl,
      pasted_text: pastedText,
      specific_questions: specificQuestions,
      submitted_at: new Date().toISOString(),
      status: 'queued',
      estimated_turnaround: '5-7 business days'
    };

    try {
      const existing = JSON.parse(localStorage.getItem('matchamd_async_reviews') || '[]');
      localStorage.setItem('matchamd_async_reviews', JSON.stringify([submission, ...existing]));
    } catch (err) {
      console.warn('Failed to save review submission locally', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      toast({
        title: 'Review Submitted to Queue! 🩺',
        description: 'Your submission has been queued for comprehensive clinical review.',
      });
      if (onSubmitted) onSubmitted(submission);
    }, 600);
  };

  const handleResetAndClose = () => {
    setSubmittedSuccess(false);
    setApplicantName('');
    setEmail('');
    setDocumentUrl('');
    setPastedText('');
    setSpecificQuestions('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleResetAndClose}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              Founder Clinical Review Queue
            </Badge>
            <div className="flex items-center text-xs text-slate-500 gap-1 ml-auto">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>5-7 Business Days SLA</span>
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            Submit for Asynchronous Clinical Review
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 text-sm">
            Receive in-depth, structured feedback on your medical CV, Personal Statement, or Research Abstract directly from experienced US physician reviewers.
          </DialogDescription>
        </DialogHeader>

        {submittedSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submission Successfully Queued</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Thank you! Your draft has been added to the review queue for <strong>{targetSpecialty}</strong>. You will receive a detailed rubric and margin feedback report via email within 5 to 7 business days.
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-left text-xs space-y-1.5 text-slate-600 dark:text-slate-300 max-w-md mx-auto border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Recipient Email:</span>
                <span>{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Target Specialty:</span>
                <span>{targetSpecialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Review Focus:</span>
                <span>{reviewType === 'research' ? 'Research & Study Design Critique' : 'CV / Personal Statement Rubric'}</span>
              </div>
            </div>
            <Button onClick={handleResetAndClose} className="mt-4 bg-[rgb(var(--color-primary))] text-white hover:opacity-90">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="applicantName" className="text-xs font-semibold">Your Full Name *</Label>
                <Input
                  id="applicantName"
                  placeholder="Dr. Jane Doe, MD"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">Contact Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Review Type</Label>
                <Select value={reviewType} onValueChange={setReviewType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select review type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cv_ps">CV & Personal Statement Review ($49)</SelectItem>
                    <SelectItem value="personal_statement">Personal Statement Only ($39)</SelectItem>
                    <SelectItem value="eras_cv">Medical CV / ERAS Experiences ($39)</SelectItem>
                    <SelectItem value="research">Research Abstract & Study Design ($39)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Target Specialty</Label>
                <Select value={targetSpecialty} onValueChange={setTargetSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Target specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
                    <SelectItem value="Family Medicine">Family Medicine</SelectItem>
                    <SelectItem value="General Surgery">General Surgery</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                    <SelectItem value="Pathology">Pathology</SelectItem>
                    <SelectItem value="Other Subspecialty / Fellowship">Fellowship / Subspecialty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="docUrl" className="text-xs font-semibold flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                Google Doc / Cloud Link (Recommended)
              </Label>
              <Input
                id="docUrl"
                placeholder="https://docs.google.com/... (Ensure sharing is set to 'Anyone with link can comment')"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
              />
              <p className="text-[11px] text-slate-500">
                Tip: Providing a Google Doc with 'Commenter' access allows our physician reviewer to leave precise margin notes.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pastedDraft" className="text-xs font-semibold">
                Or Paste Draft Text Below
              </Label>
              <Textarea
                id="pastedDraft"
                rows={4}
                placeholder="Paste your personal statement paragraph, CV summary, or research abstract here..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="questions" className="text-xs font-semibold">
                Specific Concerns or Questions (Optional)
              </Label>
              <Textarea
                id="questions"
                rows={2}
                placeholder="e.g. How to address my 2-year graduation gap? Does my intro paragraph clearly emphasize clinical curiosity?"
                value={specificQuestions}
                onChange={(e) => setSpecificQuestions(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-800 dark:text-slate-100">Review Standard: </span>
                Evaluated against US residency selection benchmarks (narrative clarity, red-flag avoidance, clinical impact, and IMRaD scientific structure).
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[rgb(var(--color-primary))] text-white hover:opacity-90 gap-1.5"
                disabled={isSubmitting}
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Submitting to Queue...' : 'Submit to Review Queue'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
