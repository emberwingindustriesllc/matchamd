import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  GraduationCap, 
  Stethoscope, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft,
  Globe,
  Languages,
  Target,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const countries = [
  'India', 'Pakistan', 'Nigeria', 'Philippines', 'Egypt', 'Mexico', 'Brazil', 
  'Colombia', 'China', 'Bangladesh', 'Iran', 'Iraq', 'Syria', 'Lebanon',
  'Jordan', 'Saudi Arabia', 'UAE', 'United Kingdom', 'Canada', 'Other'
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'zh', name: '中文' },
  { code: 'fr', name: 'Français' },
  { code: 'pt', name: 'Português' }
];

const goals = [
  { 
    id: 'residency', 
    icon: Stethoscope, 
    title: 'Residency',
    description: 'Apply for US medical residency programs',
    color: 'from-indigo-500 to-purple-500'
  },
  { 
    id: 'fellowship', 
    icon: GraduationCap, 
    title: 'Fellowship',
    description: 'Pursue subspecialty training',
    color: 'from-emerald-500 to-teal-500'
  },
  { 
    id: 'med_school', 
    icon: BookOpen, 
    title: 'Med School',
    description: 'Apply to US medical schools',
    color: 'from-amber-500 to-orange-500'
  }
];

const specialties = [
  'Internal Medicine', 'Family Medicine', 'Pediatrics', 'Surgery', 
  'Emergency Medicine', 'Psychiatry', 'OB/GYN', 'Neurology',
  'Radiology', 'Anesthesiology', 'Pathology', 'Dermatology', 'Other'
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState({
    display_name: '',
    country: '',
    medical_school_country: '',
    languages: ['en'],
    preferred_language: 'en',
    primary_goal: '',
    target_specialty: '',
    graduation_year: null,
    usmle_step1_status: 'not_started',
    usmle_step2_status: 'not_started',
    ecfmg_certified: false,
    visa_status: 'none',
    us_clinical_experience: false
  });

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleLanguage = (code) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.includes(code)
        ? prev.languages.filter(l => l !== code)
        : [...prev.languages, code]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.UserProfile.create({
        ...profile,
        user_id: user.id,
        onboarding_complete: true,
        badges: [],
        points: 0
      });
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Error creating profile:', error);
    }
    setIsSubmitting(false);
  };

  const steps = [
    // Step 0: Welcome
    <motion.div
      key="welcome"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center px-6"
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">
        Welcome to FMG Pathway
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto">
        Your personalized guide to achieving your US medical career goals
      </p>
      
      <div className="space-y-3 mb-8">
        <Input
          placeholder="Your name"
          value={profile.display_name}
          onChange={(e) => updateProfile('display_name', e.target.value)}
          className="h-12 rounded-xl text-center text-lg"
        />
      </div>
    </motion.div>,

    // Step 1: Location
    <motion.div
      key="location"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="px-6"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
        <Globe className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">
        Where are you located?
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
        We'll customize visa and location-specific guidance
      </p>

      <div className="space-y-4">
        <div>
          <Label className="text-slate-700 dark:text-slate-300">Current Country</Label>
          <Select value={profile.country} onValueChange={(v) => updateProfile('country', v)}>
            <SelectTrigger className="h-12 rounded-xl mt-1">
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-slate-700 dark:text-slate-300">Medical School Country</Label>
          <Select value={profile.medical_school_country} onValueChange={(v) => updateProfile('medical_school_country', v)}>
            <SelectTrigger className="h-12 rounded-xl mt-1">
              <SelectValue placeholder="Where did you study medicine?" />
            </SelectTrigger>
            <SelectContent>
              {countries.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>,

    // Step 2: Languages
    <motion.div
      key="languages"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="px-6"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <Languages className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">
        Languages you speak
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
        Select all that apply
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => toggleLanguage(lang.code)}
            className={`p-4 rounded-xl border-2 transition-all ${
              profile.languages.includes(lang.code)
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="font-medium text-slate-800 dark:text-white">{lang.name}</span>
          </button>
        ))}
      </div>

      <div>
        <Label className="text-slate-700 dark:text-slate-300">Preferred app language</Label>
        <Select value={profile.preferred_language} onValueChange={(v) => updateProfile('preferred_language', v)}>
          <SelectTrigger className="h-12 rounded-xl mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map(l => (
              <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>,

    // Step 3: Goal
    <motion.div
      key="goal"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="px-6"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
        <Target className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">
        What's your goal?
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
        Choose your primary pathway
      </p>

      <div className="space-y-3">
        {goals.map(goal => (
          <button
            key={goal.id}
            onClick={() => updateProfile('primary_goal', goal.id)}
            className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
              profile.primary_goal === goal.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center`}>
                <goal.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">{goal.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{goal.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 4: Details
    <motion.div
      key="details"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="px-6"
    >
      <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">
        A few more details
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
        Help us personalize your journey
      </p>

      <div className="space-y-4">
        {profile.primary_goal !== 'med_school' && (
          <div>
            <Label className="text-slate-700 dark:text-slate-300">Target Specialty</Label>
            <Select value={profile.target_specialty} onValueChange={(v) => updateProfile('target_specialty', v)}>
              <SelectTrigger className="h-12 rounded-xl mt-1">
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label className="text-slate-700 dark:text-slate-300">USMLE Step 1 Status</Label>
          <Select value={profile.usmle_step1_status} onValueChange={(v) => updateProfile('usmle_step1_status', v)}>
            <SelectTrigger className="h-12 rounded-xl mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not started</SelectItem>
              <SelectItem value="studying">Currently studying</SelectItem>
              <SelectItem value="scheduled">Exam scheduled</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-slate-700 dark:text-slate-300">USMLE Step 2 CK Status</Label>
          <Select value={profile.usmle_step2_status} onValueChange={(v) => updateProfile('usmle_step2_status', v)}>
            <SelectTrigger className="h-12 rounded-xl mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not started</SelectItem>
              <SelectItem value="studying">Currently studying</SelectItem>
              <SelectItem value="scheduled">Exam scheduled</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
          <Checkbox
            checked={profile.ecfmg_certified}
            onCheckedChange={(v) => updateProfile('ecfmg_certified', v)}
          />
          <span className="text-slate-700 dark:text-slate-300">I am ECFMG certified</span>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
          <Checkbox
            checked={profile.us_clinical_experience}
            onCheckedChange={(v) => updateProfile('us_clinical_experience', v)}
          />
          <span className="text-slate-700 dark:text-slate-300">I have US clinical experience</span>
        </div>
      </div>
    </motion.div>
  ];

  const canProceed = () => {
    switch(step) {
      case 0: return profile.display_name.length > 0;
      case 1: return profile.country && profile.medical_school_country;
      case 2: return profile.languages.length > 0;
      case 3: return profile.primary_goal;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-slate-200 dark:bg-slate-700">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center py-8">
        <AnimatePresence mode="wait">
          {steps[step]}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-6 flex gap-3">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="h-14 rounded-xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        
        <Button
          onClick={() => step === steps.length - 1 ? handleSubmit() : setStep(step + 1)}
          disabled={!canProceed() || isSubmitting}
          className="flex-1 h-14 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : step === steps.length - 1 ? (
            'Start My Journey'
          ) : (
            <>Continue <ChevronRight className="w-5 h-5 ml-2" /></>
          )}
        </Button>
      </div>
    </div>
  );
}