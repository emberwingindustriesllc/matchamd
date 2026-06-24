import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, FileText, Camera, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createScamReport } from '@/api/programs';

const SCAM_CATEGORIES = [
  { value: 'paid_rotation', label: 'Paid Rotation / Observership', description: 'Charging for clinical rotations that should be free' },
  { value: 'fake_letter', label: 'Fake / Purchased Letters of Recommendation', description: 'Selling or fabricating LoRs' },
  { value: 'visa_fraud', label: 'Visa Fraud / Misrepresentation', description: 'False J-1/H-1B sponsorship claims' },
  { value: 'money_for_match', label: 'Money for Match / Rank List Manipulation', description: 'Paying for guaranteed match or rank list spots' },
  { value: 'credential_fraud', label: 'Credential / Diploma Fraud', description: 'Fake diplomas, transcripts, ECFMG certificates' },
  { value: 'other', label: 'Other', description: 'Other predatory or fraudulent behavior' },
];

const ENTITY_TYPES = [
  { value: 'physician', label: 'Individual Physician / Attending' },
  { value: 'program', label: 'Residency / Fellowship Program' },
  { value: 'agency', label: 'Placement Agency / Consultancy' },
  { value: 'other', label: 'Other' },
];

export default function ReportScamModal({ programId, programName, open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    entity_name: '',
    entity_type: '',
    scam_category: '',
    description: '',
    amount_usd: '',
    evidence_urls: '',
    is_anonymous: true,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.entity_name.trim()) newErrors.entity_name = 'Entity name is required';
      if (!formData.entity_type) newErrors.entity_type = 'Select entity type';
      if (!formData.scam_category) newErrors.scam_category = 'Select scam category';
    }
    if (step === 2) {
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (formData.description.trim().length < 50) newErrors.description = 'Please provide at least 50 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setSubmitting(true);
    try {
      await createScamReport({
        program_id: programId || null,
        entity_name: formData.entity_name.trim(),
        entity_type: formData.entity_type,
        scam_category: formData.scam_category,
        description: formData.description.trim(),
        amount_usd: formData.amount_usd ? parseFloat(formData.amount_usd) : null,
        evidence_urls: formData.evidence_urls.split('\n').map(u => u.trim()).filter(Boolean),
        is_anonymous: formData.is_anonymous,
      });

      toast.success('Report submitted for review. Thank you for helping keep the community safe.');
      onOpenChange(false);
      setFormData({
        entity_name: '',
        entity_type: '',
        scam_category: '',
        description: '',
        amount_usd: '',
        evidence_urls: '',
        is_anonymous: true,
      });
      setStep(1);
    } catch (error) {
      toast.error(error.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <DialogTitle className="text-center">Report a Scam or Predatory Practice</DialogTitle>
          <DialogDescription className="text-center">
            Help protect other IMGs by reporting fraudulent entities. Your identity is <strong>always anonymous</strong>.
            {programName && <p className="mt-2 text-sm text-muted-foreground">Linked to: <strong>{programName}</strong></p>}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Progress indicator */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`flex items-center gap-1 ${s <= step ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  s <= step ? 'bg-primary border-primary text-primary-foreground' : 'border-muted'
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 ${s < step ? 'bg-primary' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: What & Who */}
          {step === 1 && (
            <div className="space-y-4" data-step="1">
              <h3 className="text-lg font-medium">Who and What</h3>
              <Alert variant="info" className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-sm">
                  <strong>Anonymity guaranteed:</strong> Your name/email will never be shown publicly or to the reported entity.
                  Only verified moderators see submission metadata for verification purposes.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="entity_name">Entity Name *</Label>
                <Input
                  id="entity_name"
                  placeholder="e.g., Dr. John Smith, Mercy Hospital IM Program, Global Med Placements"
                  value={formData.entity_name}
                  onChange={e => setFormData({...formData, entity_name: e.target.value})}
                  className={errors.entity_name ? 'border-destructive' : ''}
                />
                {errors.entity_name && <p className="text-sm text-destructive">{errors.entity_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="entity_type">Entity Type *</Label>
                <Select value={formData.entity_type} onValueChange={v => setFormData({...formData, entity_type: v})}>
                  <SelectTrigger id="entity_type" className={errors.entity_type ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTITY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.entity_type && <p className="text-sm text-destructive">{errors.entity_type}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="scam_category">Scam Category *</Label>
                <Select value={formData.scam_category} onValueChange={v => setFormData({...formData, scam_category: v})}>
                  <SelectTrigger id="scam_category" className={errors.scam_category ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCAM_CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>
                        <div>
                          <div className="font-medium">{c.label}</div>
                          <div className="text-xs text-muted-foreground">{c.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.scam_category && <p className="text-sm text-destructive">{errors.scam_category}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-4" data-step="2">
              <h3 className="text-lg font-medium">What Happened</h3>
              <Alert variant="info" className="bg-amber-50 border-amber-200">
                <AlertDescription className="text-sm">
                  Be specific: dates, amounts, what was promised vs delivered, names of people involved,
                  communication records (emails, WhatsApp, contracts). Screenshots = stronger report.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="description">Description * (minimum 50 characters)</Label>
                <Textarea
                  id="description"
                  rows={6}
                  placeholder="Describe what happened in detail..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/50 min characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount_usd">Amount Lost (USD, optional)</Label>
                <Input
                  id="amount_usd"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 10000"
                  value={formData.amount_usd}
                  onChange={e => setFormData({...formData, amount_usd: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">Helps quantify the scope. Leave blank if not applicable.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidence_urls">Evidence URLs (one per line, optional)</Label>
                <Textarea
                  id="evidence_urls"
                  rows={3}
                  placeholder="https://imgur.com/screenshot1.png
https://drive.google.com/contract.pdf
https://whatsapp.com/chat/..."
                  value={formData.evidence_urls}
                  onChange={e => setFormData({...formData, evidence_urls: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  Screenshots, contracts, emails, chat logs. Upload to Imgur/Drive/Dropbox first.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-4" data-step="3">
              <h3 className="text-lg font-medium">Review & Submit</h3>
              <Alert variant="info">
                <AlertDescription className="text-sm">
                  <strong>Before submitting:</strong> Ensure accuracy. False reports harm real people and weaken community trust.
                  Verified moderators will review before any public warning is posted.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div><strong>Entity:</strong> {formData.entity_name}</div>
                <div><strong>Type:</strong> {ENTITY_TYPES.find(t => t.value === formData.entity_type)?.label}</div>
                <div><strong>Category:</strong> {SCAM_CATEGORIES.find(c => c.value === formData.scam_category)?.label}</div>
                <div><strong>Amount:</strong> {formData.amount_usd ? `$${parseFloat(formData.amount_usd).toLocaleString()}` : 'Not specified'}</div>
                <div><strong>Evidence:</strong> {formData.evidence_urls.trim() ? formData.evidence_urls.trim().split('\n').length + ' link(s)' : 'None provided'}</div>
                <div><strong>Anonymous:</strong> {formData.is_anonymous ? 'Yes' : 'No'}</div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="confirm"
                  checked={true}
                  disabled
                />
                <Label htmlFor="confirm" className="text-sm">
                  I confirm this report is truthful to the best of my knowledge
                </Label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <DialogFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1 || submitting}>
              Back
            </Button>
            <div className="flex gap-2">
              {step < 3 && (
                <Button type="button" onClick={nextStep} disabled={submitting}>
                  Next
                </Button>
              )}
              {step === 3 && (
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <> <Send className="h-4 w-4 mr-2" /> Submit Report </>}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}