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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { createProgram } from '@/api/programs';

const SPECIALTIES = [
  'Internal Medicine', 'Family Medicine', 'Pediatrics', 'Surgery',
  'Emergency Medicine', 'Psychiatry', 'OB/GYN', 'Neurology',
  'Radiology', 'Anesthesiology', 'Pathology', 'Dermatology',
  'Orthopedic Surgery', 'Urology', 'Ophthalmology', 'ENT',
  'Cardiology', 'Gastroenterology', 'Nephrology', 'Pulmonology',
  'Endocrinology', 'Hematology/Oncology', 'Infectious Disease',
  'Rheumatology', 'Allergy/Immunology', 'Other',
];

const PROGRAM_TYPES = [
  { value: 'residency', label: 'Residency (ACGME-accredited)' },
  { value: 'fellowship', label: 'Fellowship (ACGME-accredited)' },
  { value: 'observership', label: 'Observership / Clinical Observer' },
  { value: 'research', label: 'Research Position' },
  { value: 'elective', label: 'Clinical Elective (Medical Student)' },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

export default function AddProgramModal({ open, onOpenChange, onSuccess }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    specialty: [],
    program_type: 'residency',
    city: '',
    state: '',
    is_acgme_accredited: false,
    ecfmg_pathway_eligible: false,
    website: '',
    contact_email: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Program name is required';
      if (!formData.institution.trim()) newErrors.institution = 'Institution is required';
      if (!formData.program_type) newErrors.program_type = 'Select program type';
    }
    if (step === 2) {
      if (formData.specialty.length === 0) newErrors.specialty = 'Select at least one specialty';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'Select state';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setSubmitting(true);
    try {
      await createProgram({
        ...formData,
        specialty: formData.specialty,
        is_acgme_accredited: formData.is_acgme_accredited,
        ecfmg_pathway_eligible: formData.ecfmg_pathway_eligible,
      });

      toast.success('Program submitted for review. It will appear once verified.');
      onOpenChange(false);
      onSuccess?.();
      setFormData({
        name: '', institution: '', specialty: [], program_type: 'residency',
        city: '', state: '', is_acgme_accredited: false, ecfmg_pathway_eligible: false,
        website: '', contact_email: '', description: '',
      });
      setStep(1);
    } catch (error) {
      toast.error(error.message || 'Failed to submit program');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const toggleSpecialty = (spec) => {
    setFormData(prev => ({
      ...prev,
      specialty: prev.specialty.includes(spec)
        ? prev.specialty.filter(s => s !== spec)
        : [...prev.specialty, spec],
    }));
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Add a Program</DialogTitle>
          <DialogDescription className="text-center">
            Help build the community database. Submissions are reviewed before publishing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Progress */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex items-center gap-1 ${s <= step ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${s <= step ? 'bg-primary border-primary text-primary-foreground' : 'border-muted'}`}>{s}</div>
                {s < 3 && <div className={`w-12 h-0.5 ${s < step ? 'bg-primary' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Program Name *</Label>
                <Input id="name" placeholder="e.g., Internal Medicine Residency" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={errors.name ? 'border-destructive' : ''} />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution">Institution / Hospital *</Label>
                <Input id="institution" placeholder="e.g., Mercy Hospital, University Medical Center" value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} className={errors.institution ? 'border-destructive' : ''} />
                {errors.institution && <p className="text-sm text-destructive">{errors.institution}</p>}
              </div>
              <div className="space-y-2">
                <Label>Program Type *</Label>
                <Select value={formData.program_type} onValueChange={v => setFormData({...formData, program_type: v})}>
                  <SelectTrigger id="program_type" className={errors.program_type ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAM_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.program_type && <p className="text-sm text-destructive">{errors.program_type}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location & Specialties</h3>
              <div className="space-y-2">
                <Label>Specialty(s) *</Label>
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 border rounded">
                  {SPECIALTIES.map(spec => (
                    <label key={spec} className="inline-flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formData.specialty.includes(spec)}
                        onCheckedChange={() => toggleSpecialty(spec)}
                      />
                      <span className="text-sm">{spec}</span>
                    </label>
                  ))}
                </div>
                {errors.specialty && <p className="text-sm text-destructive">{errors.specialty}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" placeholder="e.g., Chicago" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={errors.city ? 'border-destructive' : ''} />
                  {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={v => setFormData({...formData, state: v})}>
                    <SelectTrigger id="state" className={errors.state ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Optional & Submit */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Details (Optional)</h3>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" type="url" placeholder="https://program.hospital.edu" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input id="contact_email" type="email" placeholder="coordinator@hospital.edu" value={formData.contact_email} onChange={e => setFormData({...formData, contact_email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={3} placeholder="Key features, strengths, IMG-friendly policies, etc." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="acgme" checked={formData.is_acgme_accredited} onCheckedChange={e => setFormData({...formData, is_acgme_accredited: e.target.checked})} />
                  <Label htmlFor="acgme">ACGME Accredited</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="ecfmg" checked={formData.ecfmg_pathway_eligible} onCheckedChange={e => setFormData({...formData, ecfmg_pathway_eligible: e.target.checked})} />
                  <Label htmlFor="ecfmg">ECFMG Pathway Eligible</Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1 || submitting}>Back</Button>
            <div className="flex gap-2">
              {step < 3 && <Button type="button" onClick={nextStep} disabled={submitting}>Next</Button>}
              {step === 3 && <Button type="submit" disabled={submitting}>{submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Submit Program'}</Button>}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}