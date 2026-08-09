import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { toast } from 'sonner';
import { Beaker, Send, MapPin, Mail } from 'lucide-react';

const SPECIALTIES = [
  'Internal Medicine', 'Family Medicine', 'Pediatrics', 'Surgery',
  'Emergency Medicine', 'Psychiatry', 'OB/GYN', 'Neurology',
  'Radiology', 'Anesthesiology', 'Pathology', 'Dermatology',
  'Cardiology', 'Gastroenterology', 'Nephrology', 'Pulmonology',
  'Endocrinology', 'Hematology/Oncology', 'Infectious Disease',
  'Other'
];

export default function PostResearchModal({ open, onOpenChange, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    institution: '',
    specialty: 'Internal Medicine',
    city: '',
    state: '',
    compensation: 'unpaid',
    remote_allowed: false,
    positions_available: 1,
    duration: '12 Months',
    description: '',
    requirements: '',
    contact_email: user?.email || '',
    application_deadline: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.institution || !formData.contact_email || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const reqArray = formData.requirements
      ? formData.requirements.split('\n').filter(Boolean)
      : [];

    const payload = {
      id: 'res_' + Date.now(),
      title: formData.title.trim(),
      institution: formData.institution.trim(),
      specialty: formData.specialty,
      city: formData.city.trim() || 'Remote',
      state: formData.state.trim() || 'US',
      compensation: formData.compensation,
      remote_allowed: formData.remote_allowed,
      positions_available: Number(formData.positions_available) || 1,
      duration: formData.duration.trim() || 'Flexible',
      description: formData.description.trim(),
      requirements: reqArray,
      contact_email: formData.contact_email.trim(),
      application_deadline: formData.application_deadline || null,
      status: 'open',
      submitted_by: user?.id || 'guest',
      created_at: new Date().toISOString(),
    };

    try {
      if (user?.id) {
        const { error } = await supabase.from('research_opportunities').insert(payload);
        if (error) {
          console.warn('Supabase insert failed, storing locally:', error);
          saveLocally(payload);
        } else {
          toast.success('Research opportunity posted successfully!');
        }
      } else {
        saveLocally(payload);
      }
      onSuccess?.();
      onOpenChange(false);
      resetForm();
    } catch (err) {
      console.warn('Network error, storing research position locally:', err);
      saveLocally(payload);
      onSuccess?.();
      onOpenChange(false);
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const saveLocally = (payload) => {
    const existing = JSON.parse(localStorage.getItem('matchamd_local_research_opps') || '[]');
    localStorage.setItem('matchamd_local_research_opps', JSON.stringify([payload, ...existing]));
    toast.success('Research position posted (saved locally)!');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      institution: '',
      specialty: 'Internal Medicine',
      city: '',
      state: '',
      compensation: 'unpaid',
      remote_allowed: false,
      positions_available: 1,
      duration: '12 Months',
      description: '',
      requirements: '',
      contact_email: user?.email || '',
      application_deadline: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Beaker className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Post a Research Opportunity</DialogTitle>
              <DialogDescription className="text-xs">
                Share clinical trials, remote research, or lab positions with IMG applicants
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Position Title *
            </Label>
            <Input
              placeholder="e.g. Postdoctoral Fellow in Cardiovascular Research"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="rounded-xl h-11"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Institution / Hospital *
              </Label>
              <Input
                placeholder="e.g. Mayo Clinic, Johns Hopkins"
                value={formData.institution}
                onChange={(e) => handleChange('institution', e.target.value)}
                className="rounded-xl h-11"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Specialty *
              </Label>
              <Select value={formData.specialty} onValueChange={(v) => handleChange('specialty', v)}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">City</Label>
              <Input
                placeholder="e.g. Chicago"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">State (2 letters)</Label>
              <Input
                placeholder="e.g. IL"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                maxLength={2}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Compensation</Label>
              <Select value={formData.compensation} onValueChange={(v) => handleChange('compensation', v)}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="stipend">Stipend</SelectItem>
                  <SelectItem value="paid">Paid Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Duration</Label>
              <Input
                placeholder="e.g. 12 Months"
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                className="rounded-xl h-11"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Positions</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={formData.positions_available}
                onChange={(e) => handleChange('positions_available', e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div>
              <Label className="font-semibold text-xs text-slate-800 dark:text-white">Remote Allowed?</Label>
              <p className="text-[11px] text-slate-500">Can applicants contribute virtually from abroad?</p>
            </div>
            <Switch
              checked={formData.remote_allowed}
              onCheckedChange={(c) => handleChange('remote_allowed', c)}
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Position Description *
            </Label>
            <Textarea
              placeholder="Outline research focus, manuscript output expectation, clinical duties, and lab responsibilities..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="min-h-[100px] rounded-xl text-xs"
              required
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Applicant Requirements (one per line)
            </Label>
            <Textarea
              placeholder="e.g.&#10;Passed USMLE Step 1&#10;Experience in statistical analysis (STATA/R)&#10;Prior peer-reviewed publications"
              value={formData.requirements}
              onChange={(e) => handleChange('requirements', e.target.value)}
              className="min-h-[70px] rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Contact Email *
              </Label>
              <Input
                type="email"
                placeholder="pi.lab@hospital.org"
                value={formData.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="rounded-xl h-11"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Application Deadline
              </Label>
              <Input
                type="date"
                value={formData.application_deadline}
                onChange={(e) => handleChange('application_deadline', e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-12 font-semibold shadow-md mt-2"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Posting Position...' : 'Post Research Position'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
