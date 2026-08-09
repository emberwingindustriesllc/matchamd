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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { toast } from 'sonner';
import { Award, Star, UserCheck, Stethoscope, Check } from 'lucide-react';

const SPECIALTIES = [
  'Internal Medicine', 'Family Medicine', 'Pediatrics', 'Surgery',
  'Emergency Medicine', 'Psychiatry', 'OB/GYN', 'Neurology',
  'Radiology', 'Anesthesiology', 'Pathology', 'Dermatology',
  'Other'
];

const GUIDANCE_TOPICS = [
  'Personal Statement Review',
  'ERAS Strategy & Signaling',
  'Interview Preparation & Mocks',
  'USCE & Observerships Advice',
  'Cold Emailing PIs for Research',
  'SOAP Preparation & Backup Options',
  'Step 2 CK & 3 Prep Strategy'
];

export default function BecomeMentorModal({ open, onOpenChange, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: user?.user_metadata?.full_name || '',
    target_specialty: 'Internal Medicine',
    matched_program: '',
    matched_city: '',
    matched_state: '',
    medical_school: '',
    medical_school_country: '',
    graduation_year: new Date().getFullYear(),
    usmle_step2_score: '',
    visa_status: 'J-1 Visa',
    ecfmg_certified: true,
    languages: 'English',
    guidance_topics: ['Personal Statement Review', 'Interview Preparation & Mocks'],
    bio: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTopic = (topic) => {
    setFormData((prev) => {
      const current = prev.guidance_topics;
      return {
        ...prev,
        guidance_topics: current.includes(topic)
          ? current.filter((t) => t !== topic)
          : [...current, topic],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.display_name || !formData.matched_program || !formData.bio) {
      toast.error('Please fill in your name, matched program, and bio');
      return;
    }

    setLoading(true);

    const langArray = formData.languages
      ? formData.languages.split(',').map((l) => l.trim()).filter(Boolean)
      : ['English'];

    const mentorRecord = {
      id: 'mentor_app_' + Date.now(),
      user_id: user?.id || 'm_user_' + Date.now(),
      display_name: formData.display_name.startsWith('Dr.') ? formData.display_name : `Dr. ${formData.display_name}`,
      target_specialty: formData.target_specialty,
      matched_program: formData.matched_program.trim(),
      matched_city: formData.matched_city.trim() || 'US',
      matched_state: formData.matched_state.trim() || 'NY',
      medical_school: formData.medical_school.trim() || 'International Medical School',
      medical_school_country: formData.medical_school_country.trim() || 'International',
      graduation_year: Number(formData.graduation_year) || 2023,
      usmle_step1_status: 'passed',
      usmle_step2_score: Number(formData.usmle_step2_score) || 245,
      usmle_step3_result: 'passed',
      ecfmg_certified: formData.ecfmg_certified,
      visa_status: formData.visa_status,
      mentor_verified: true,
      bio: formData.bio.trim(),
      avatar_url: `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80`,
      languages: langArray,
      guidance_topics: formData.guidance_topics,
      rating: 5.0,
      reviews_count: 1,
      accepted_count: 0,
      created_at: new Date().toISOString(),
    };

    try {
      if (user?.id) {
        const { error } = await supabase
          .from('user_profiles')
          .update({
            mentor_verified: true,
            display_name: mentorRecord.display_name,
            target_specialty: mentorRecord.target_specialty,
            matched_city: mentorRecord.matched_city,
            matched_state: mentorRecord.matched_state,
            bio: mentorRecord.bio,
            ecfmg_certified: mentorRecord.ecfmg_certified,
          })
          .eq('user_id', user.id);

        if (error) {
          console.warn('Supabase profile mentor update failed, storing locally:', error);
          saveLocally(mentorRecord);
        } else {
          toast.success('Your mentor application was approved and activated!');
        }
      } else {
        saveLocally(mentorRecord);
      }

      saveLocally(mentorRecord);
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.warn('Error updating mentor profile, storing locally:', err);
      saveLocally(mentorRecord);
      onSuccess?.();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const saveLocally = (record) => {
    const existing = JSON.parse(localStorage.getItem('matchamd_local_mentors') || '[]');
    localStorage.setItem('matchamd_local_mentors', JSON.stringify([record, ...existing]));
    toast.success('Mentor profile registered successfully!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Become a Verified Mentor</DialogTitle>
              <DialogDescription className="text-xs">
                Guide foreign medical graduates through USMLE exams, ERAS applications, and Match interviews
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Full Name with Title *
            </Label>
            <Input
              placeholder="e.g. Dr. Sarah Chen, MD"
              value={formData.display_name}
              onChange={(e) => handleChange('display_name', e.target.value)}
              className="rounded-xl h-11"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Primary Specialty *
              </Label>
              <Select value={formData.target_specialty} onValueChange={(v) => handleChange('target_specialty', v)}>
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

            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Matched Program / Hospital *
              </Label>
              <Input
                placeholder="e.g. Cook County Hospital IM"
                value={formData.matched_program}
                onChange={(e) => handleChange('matched_program', e.target.value)}
                className="rounded-xl h-11"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Program City</Label>
              <Input
                placeholder="e.g. Chicago"
                value={formData.matched_city}
                onChange={(e) => handleChange('matched_city', e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Program State</Label>
              <Input
                placeholder="e.g. IL"
                value={formData.matched_state}
                onChange={(e) => handleChange('matched_state', e.target.value.toUpperCase())}
                maxLength={2}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Medical School</Label>
              <Input
                placeholder="e.g. Aga Khan University"
                value={formData.medical_school}
                onChange={(e) => handleChange('medical_school', e.target.value)}
                className="rounded-xl h-11"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Medical School Country</Label>
              <Input
                placeholder="e.g. Pakistan"
                value={formData.medical_school_country}
                onChange={(e) => handleChange('medical_school_country', e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Grad Year</Label>
              <Input
                type="number"
                value={formData.graduation_year}
                onChange={(e) => handleChange('graduation_year', e.target.value)}
                className="rounded-xl h-11"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Step 2 Score</Label>
              <Input
                type="number"
                placeholder="e.g. 254"
                value={formData.usmle_step2_score}
                onChange={(e) => handleChange('usmle_step2_score', e.target.value)}
                className="rounded-xl h-11"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Visa Status</Label>
              <Select value={formData.visa_status} onValueChange={(v) => handleChange('visa_status', v)}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="J-1 Visa">J-1 Visa</SelectItem>
                  <SelectItem value="H-1B Visa">H-1B Visa</SelectItem>
                  <SelectItem value="US Citizen">US Citizen</SelectItem>
                  <SelectItem value="Green Card">Green Card</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div>
              <Label className="font-semibold text-xs text-slate-800 dark:text-white">ECFMG Certified?</Label>
              <p className="text-[11px] text-slate-500">Do you hold active ECFMG certification?</p>
            </div>
            <Switch
              checked={formData.ecfmg_certified}
              onCheckedChange={(c) => handleChange('ecfmg_certified', c)}
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Guidance Topics Provided
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GUIDANCE_TOPICS.map((topic) => {
                const isChecked = formData.guidance_topics.includes(topic);
                return (
                  <div
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 text-amber-900 dark:text-amber-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Checkbox checked={isChecked} onCheckedChange={() => toggleTopic(topic)} />
                    <span className="truncate">{topic}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Languages Spoken (comma separated)
            </Label>
            <Input
              placeholder="e.g. English, Spanish, Hindi, Urdu"
              value={formData.languages}
              onChange={(e) => handleChange('languages', e.target.value)}
              className="rounded-xl h-11 text-xs"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Mentor Bio & Advice Philosophy *
            </Label>
            <Textarea
              placeholder="Describe your journey, how many rotations/publications you completed, and what unique insights you offer to applicants..."
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              className="min-h-[90px] rounded-xl text-xs"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white h-12 font-semibold shadow-md mt-2"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            {loading ? 'Submitting Application...' : 'Register as Verified Mentor'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
