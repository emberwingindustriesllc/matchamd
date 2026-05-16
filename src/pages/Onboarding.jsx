import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo.png';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '@/components/i18n/LanguageContext';
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

const commonMedSchools = {
  'India': ['AIIMS', 'JIPMER', 'CMC Vellore', 'Armed Forces Medical College', 'Maulana Azad Medical College', 'Other'],
  'Pakistan': ['Aga Khan University', 'King Edward Medical University', 'Dow Medical College', 'Allama Iqbal Medical College', 'Other'],
  'Nigeria': ['University of Ibadan', 'University of Lagos', 'Obafemi Awolowo University', 'University of Nigeria', 'Other'],
  'Philippines': ['University of the Philippines', 'University of Santo Tomas', 'Far Eastern University', 'Other'],
  'Egypt': ['Cairo University', 'Ain Shams University', 'Alexandria University', 'Other'],
  'Mexico': ['UNAM', 'IPN', 'UAG', 'TEC de Monterrey', 'Other'],
  'Other': ['Other']
};

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
    color: 'from-[rgb(var(--color-primary))] to-[rgb(110,135,30)]'
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

const residencySpecialties = [
  'Internal Medicine', 'Family Medicine', 'Pediatrics', 'Surgery', 
  'Emergency Medicine', 'Psychiatry', 'OB/GYN', 'Neurology',
  'Radiology', 'Anesthesiology', 'Pathology', 'Dermatology', 'Other'
];

const pediatricFellowships = [
  'Adolescent Medicine',
  'Allergy and Immunology',
  'Cardiology',
  'Child Abuse Pediatrics',
  'Child and Adolescent Psychiatry',
  'Critical Care Medicine',
  'Developmental-Behavioral Pediatrics',
  'Emergency Medicine',
  'Endocrinology',
  'Gastroenterology',
  'Hematology-Oncology',
  'Hospital Medicine',
  'Infectious Disease',
  'Neonatal-Perinatal Medicine',
  'Nephrology',
  'Neurology',
  'Pulmonology',
  'Rheumatology',
  'Sports Medicine',
  'Transplant Hepatology'
];

const internalMedicineFellowships = [
  'Adolescent Medicine',
  'Adult Congenital Heart Disease',
  'Advanced Heart Failure and Transplant Cardiology',
  'Cardiovascular Disease',
  'Clinical Cardiac Electrophysiology',
  'Critical Care Medicine',
  'Endocrinology, Diabetes and Metabolism',
  'Gastroenterology',
  'Geriatric Medicine',
  'Hematology',
  'Hospice and Palliative Medicine',
  'Infectious Disease',
  'Interventional Cardiology',
  'Medical Oncology',
  'Nephrology',
  'Neurocritical Care',
  'Pulmonary Disease',
  'Rheumatology',
  'Sleep Medicine',
  'Sports Medicine',
  'Transplant Hepatology'
];

const combinedMedPedsFellowships = [
  ...new Set([...pediatricFellowships, ...internalMedicineFellowships])
].sort();

const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const currentYear = new Date().getFullYear();
const graduationYears = Array.from({ length: 30 }, (_, i) => currentYear - i);

export default function Onboarding() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState({
    display_name: '',
    country: '',
    target_city: '',
    target_state: '',
    medical_school: '',
    medical_school_country: '',
    undergraduate_college: '',
    languages: ['en'],
    preferred_language: 'en',
    primary_goal: '',
    fellowship_type: '',
    target_specialty: '',
    graduation_year: null,
    graduation_cutoff_aware: false,
    usmle_step1_status: 'not_started',
    usmle_step1_score: '',
    usmle_step2_status: 'not_started',
    usmle_step2_score: '',
    usmle_step3_status: 'not_started',
    usmle_step3_result: 'not_applicable',
    ecfmg_certified: false,
    acgme_waiver: false,
    visa_status: 'none',
    us_clinical_experience: false,
    previous_training: false,
    previous_training_details: '',
    medical_school_custom: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    checkAuth();
  }, []);

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
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }

      const user = await base44.auth.me();
      
      if (!user || !user.id) {
        throw new Error('Unable to get user information. Please try logging in again.');
      }

      const medSchoolFinal = profile.medical_school === 'Other' 
        ? (profile.medical_school_custom || 'Other') 
        : (profile.medical_school || '');

      const profileData = {
        user_id: user.id,
        primary_goal: profile.primary_goal,
        display_name: profile.display_name || user.full_name,
        country: profile.country || '',
        target_city: profile.target_city || '',
        target_state: profile.target_state || '',
        medical_school: medSchoolFinal,
        medical_school_country: profile.medical_school_country || '',
        undergraduate_college: profile.undergraduate_college || '',
        languages: profile.languages || ['en'],
        preferred_language: profile.preferred_language || 'en',
        fellowship_type: profile.fellowship_type || '',
        target_specialty: profile.target_specialty || '',
        graduation_year: profile.graduation_year || null,
        graduation_cutoff_aware: profile.graduation_cutoff_aware || false,
        usmle_step1_status: profile.usmle_step1_status || 'not_started',
        usmle_step1_score: profile.usmle_step1_score || '',
        usmle_step2_status: profile.usmle_step2_status || 'not_started',
        usmle_step2_score: profile.usmle_step2_score || '',
        usmle_step3_status: profile.usmle_step3_status || 'not_started',
        usmle_step3_result: profile.usmle_step3_result || 'not_applicable',
        ecfmg_certified: profile.ecfmg_certified || false,
        acgme_waiver: profile.acgme_waiver || false,
        visa_status: profile.visa_status || 'none',
        us_clinical_experience: profile.us_clinical_experience || false,
        previous_training: profile.previous_training || false,
        previous_training_details: profile.previous_training_details || '',
        onboarding_complete: true,
        is_mentor: false,
        mentor_verified: false,
        badges: [],
        points: 0
      };

      // Check if profile already exists to avoid duplicate create
      const existing = await base44.entities.UserProfile.filter({ user_id: user.id });
      if (existing && existing.length > 0) {
        await base44.entities.UserProfile.update(existing[0].id, { ...profileData, onboarding_complete: true });
      } else {
        await base44.entities.UserProfile.create(profileData);
      }
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Onboarding error:', error);
      if (error.message?.includes('Authentication') || error.status === 401) {
        alert('Your session has expired. Please log in again.');
        base44.auth.redirectToLogin(window.location.href);
      } else {
        alert(`Setup failed: ${error.message || 'Please try again'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="w-48 h-48 mx-auto mb-6 flex items-center justify-center p-2">
        <img 
          src={logo} 
          alt="MatchaMD Logo" 
          className="w-full h-full object-contain drop-shadow-lg"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://img.icons8.com/color/512/matcha.png'; // Fallback
          }}
        />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">
        {t('onboarding.welcome')}
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-sm mx-auto">
        {t('onboarding.subtitle')}
      </p>
      
      {/* Immediate Value Preview */}
      <div className="bg-gradient-to-r from-[rgba(var(--color-primary),0.05)] to-[rgba(var(--color-primary),0.1)] dark:from-[rgba(var(--color-primary),0.1)] dark:to-[rgba(var(--color-primary),0.2)] rounded-2xl p-4 mb-6 border border-[rgba(var(--color-primary),0.2)] dark:border-[rgba(var(--color-primary),0.4)] space-y-2 text-left max-w-md mx-auto">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">What You'll Get:</h3>
        <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>
            <span>Step-by-step ECFMG pathway guidance (Pathway 1, 3, 4, 5, 6)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>
            <span>USMLE prep roadmap with score targets (≥240 Step 2)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>
            <span>NRMP Match timeline & deadlines (March 2026)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>
            <span>Vetted resources: ECFMG.org, UWorld, ERAS tips</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>
            <span>Community of 16,000+ FMGs & verified mentors</span>
          </li>
        </ul>
      </div>
      
      <div className="space-y-3 mb-8">
        <Input
          placeholder={t('onboarding.yourName')}
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
        {t('onboarding.location')}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
        {t('onboarding.locationSubtitle')}
      </p>

      <div className="space-y-4">
        <div>
          <Label className="text-slate-700 dark:text-slate-300">{t('onboarding.currentCountry')}</Label>
          <Select value={profile.country} onValueChange={(v) => updateProfile('country', v)}>
            <SelectTrigger className="h-12 rounded-xl mt-1">
              <SelectValue placeholder={t('onboarding.selectCountry')} />
            </SelectTrigger>
            <SelectContent>
              {countries.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-slate-700 dark:text-slate-300">{t('onboarding.medSchoolCountry')}</Label>
          <Select value={profile.medical_school_country} onValueChange={(v) => {
            updateProfile('medical_school_country', v);
            updateProfile('medical_school', '');
          }}>
            <SelectTrigger className="h-12 rounded-xl mt-1">
              <SelectValue placeholder={t('onboarding.whereStudied')} />
            </SelectTrigger>
            <SelectContent>
              {countries.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {profile.medical_school_country && (
          <div>
            <Label className="text-slate-700 dark:text-slate-300">{t('onboarding.medSchool')}</Label>
            <Select value={profile.medical_school} onValueChange={(v) => updateProfile('medical_school', v)}>
              <SelectTrigger className="h-12 rounded-xl mt-1">
                <SelectValue placeholder={t('onboarding.selectMedSchool')} />
              </SelectTrigger>
              <SelectContent>
                {(commonMedSchools[profile.medical_school_country] || commonMedSchools['Other']).map(school => (
                  <SelectItem key={school} value={school}>{school}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {profile.medical_school === 'Other' && (
              <Input
                placeholder={t('onboarding.enterMedSchool')}
                value={profile.medical_school_custom || ''}
                onChange={(e) => updateProfile('medical_school_custom', e.target.value)}
                className="h-12 rounded-xl mt-2"
              />
            )}
          </div>
        )}

        <div>
          <Label className="text-slate-700 dark:text-slate-300">{t('onboarding.undergrad')}</Label>
          <Input
            placeholder={t('onboarding.undergradPlaceholder')}
            value={profile.undergraduate_college}
            onChange={(e) => updateProfile('undergraduate_college', e.target.value)}
            className="h-12 rounded-xl mt-1"
          />
        </div>
      </div>
    </motion.div>,

    // Step 2: Languages (collected but app stays in English)
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
        Languages You Speak
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-center mb-2">
        Select all languages you speak. This helps us connect you with the right mentors.
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-6 italic">
        The app interface is in English only.
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
        {t('onboarding.goal')}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
        {t('onboarding.goalSubtitle')}
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
                <h3 className="font-semibold text-slate-800 dark:text-white">{t(`goals.${goal.id}`)}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t(`goals.${goal.id}Desc`)}</p>
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
        Your Training Details
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
        Help us personalize your pathway guidance
      </p>

      <div className="space-y-4">
        {profile.primary_goal === 'fellowship' && (
          <div>
            <Label className="text-slate-700 dark:text-slate-300">Fellowship Type</Label>
            <Select value={profile.fellowship_type} onValueChange={(v) => {
              updateProfile('fellowship_type', v);
              updateProfile('target_specialty', '');
            }}>
              <SelectTrigger className="h-12 rounded-xl mt-1">
                <SelectValue placeholder="Select fellowship type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pediatrics">Pediatrics</SelectItem>
                <SelectItem value="internal_medicine_pediatrics">Internal Medicine-Pediatrics</SelectItem>
                <SelectItem value="internal_medicine">Internal Medicine</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {profile.primary_goal === 'residency' && (
          <div>
            <Label className="text-slate-700 dark:text-slate-300">{t('onboarding.targetSpecialty')}</Label>
            <Select value={profile.target_specialty} onValueChange={(v) => updateProfile('target_specialty', v)}>
              <SelectTrigger className="h-12 rounded-xl mt-1">
                <SelectValue placeholder={t('onboarding.selectSpecialty')} />
              </SelectTrigger>
              <SelectContent>
                {residencySpecialties.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {profile.primary_goal === 'fellowship' && profile.fellowship_type === 'pediatrics' && (
          <div>
            <Label className="text-slate-700 dark:text-slate-300">Pediatric Subspecialty</Label>
            <Select value={profile.target_specialty} onValueChange={(v) => updateProfile('target_specialty', v)}>
              <SelectTrigger className="h-12 rounded-xl mt-1">
                <SelectValue placeholder="Select subspecialty" />
              </SelectTrigger>
              <SelectContent>
                {pediatricFellowships.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {profile.primary_goal === 'fellowship' && profile.fellowship_type === 'internal_medicine' && (
          <div>
            <Label className="text-slate-700 dark:text-slate-300">Internal Medicine Subspecialty</Label>
            <Select value={profile.target_specialty} onValueChange={(v) => updateProfile('target_specialty', v)}>
              <SelectTrigger className="h-12 rounded-xl mt-1">
                <SelectValue placeholder="Select subspecialty" />
              </SelectTrigger>
              <SelectContent>
                {internalMedicineFellowships.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {profile.primary_goal === 'fellowship' && profile.fellowship_type === 'internal_medicine_pediatrics' && (
          <div>
            <Label className="text-slate-700 dark:text-slate-300">Med-Peds Subspecialty</Label>
            <Select value={profile.target_specialty} onValueChange={(v) => updateProfile('target_specialty', v)}>
              <SelectTrigger className="h-12 rounded-xl mt-1">
                <SelectValue placeholder="Select subspecialty" />
              </SelectTrigger>
              <SelectContent>
                {combinedMedPedsFellowships.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {profile.primary_goal !== 'med_school' && (
          <>
            <div>
              <Label className="text-slate-700 dark:text-slate-300">{t('onboarding.targetCity')}</Label>
              <Input
                placeholder={t('onboarding.targetCityPlaceholder')}
                value={profile.target_city}
                onChange={(e) => updateProfile('target_city', e.target.value)}
                className="h-12 rounded-xl mt-1"
              />
            </div>

            <div>
              <Label className="text-slate-700 dark:text-slate-300">{t('onboarding.targetState')}</Label>
              <Select value={profile.target_state} onValueChange={(v) => updateProfile('target_state', v)}>
                <SelectTrigger className="h-12 rounded-xl mt-1">
                  <SelectValue placeholder={t('onboarding.selectState')} />
                </SelectTrigger>
                <SelectContent>
                  {usStates.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Graduation Year */}
        <div>
          <Label className="text-slate-700 dark:text-slate-300">Medical School Graduation Year</Label>
          <Select value={profile.graduation_year?.toString() || ''} onValueChange={(v) => updateProfile('graduation_year', parseInt(v))}>
            <SelectTrigger className="h-12 rounded-xl mt-1">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {graduationYears.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {profile.graduation_year && (currentYear - profile.graduation_year) >= 10 && (
            <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">⚠️ Graduation Cutoff Notice</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Some residency programs have a 10-year graduation cutoff policy. Applicants who graduated over 10 years ago may face additional challenges. Consider programs that explicitly welcome older graduates or look into APPD for unfilled spots.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Checkbox
                  checked={profile.graduation_cutoff_aware}
                  onCheckedChange={(v) => updateProfile('graduation_cutoff_aware', v)}
                />
                <span className="text-xs text-amber-700 dark:text-amber-400">I understand this consideration</span>
              </div>
            </div>
          )}
        </div>

        {/* Visa Status */}
        <div>
          <Label className="text-slate-700 dark:text-slate-300">Current Visa / Immigration Status</Label>
          <Select value={profile.visa_status} onValueChange={(v) => updateProfile('visa_status', v)}>
            <SelectTrigger className="h-12 rounded-xl mt-1">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No US visa / Outside US</SelectItem>
              <SelectItem value="j1">J-1 Exchange Visitor</SelectItem>
              <SelectItem value="h1b">H-1B Work Visa</SelectItem>
              <SelectItem value="green_card">Green Card / Permanent Resident</SelectItem>
              <SelectItem value="citizen">US Citizen</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ACGME Waiver */}
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={profile.acgme_waiver}
              onCheckedChange={(v) => updateProfile('acgme_waiver', v)}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">I have or need an ACGME waiver</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                An ACGME waiver (J-1 waiver) typically adds 1 extra year of required service in an underserved area before you can pursue other opportunities. Check this if applicable.
              </p>
            </div>
          </div>
        </div>

        {/* Previous Training */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
          <div className="flex items-start gap-3 mb-3">
            <Checkbox
              checked={profile.previous_training}
              onCheckedChange={(v) => updateProfile('previous_training', v)}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">I have had previous US residency or fellowship training</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This includes any ACGME-accredited program, even if not completed.
              </p>
            </div>
          </div>
          {profile.previous_training && (
            <textarea
              placeholder="Please describe: specialty, program name, years attended, and reason for leaving (e.g., 'Internal Medicine at X Hospital, 2021-2022, left due to visa issues')"
              value={profile.previous_training_details}
              onChange={(e) => updateProfile('previous_training_details', e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm resize-none h-24"
            />
          )}
        </div>

        <div>
          <Label className="text-slate-700 dark:text-slate-300">{t('onboarding.step1Status')}</Label>
          <Select value={profile.usmle_step1_status} onValueChange={(v) => updateProfile('usmle_step1_status', v)}>
            <SelectTrigger className="h-12 rounded-xl mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">{t('onboarding.notStarted')}</SelectItem>
              <SelectItem value="studying">{t('onboarding.studying')}</SelectItem>
              <SelectItem value="scheduled">{t('onboarding.scheduled')}</SelectItem>
              <SelectItem value="passed">{t('onboarding.passed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {profile.usmle_step1_status === 'passed' && (
          <div>
            <Label className="text-slate-700 dark:text-slate-300">Step 1 Score (Optional)</Label>
            <Input
              placeholder="e.g., 230"
              value={profile.usmle_step1_score}
              onChange={(e) => updateProfile('usmle_step1_score', e.target.value)}
              className="h-12 rounded-xl mt-1"
            />
          </div>
        )}

        <div>
          <Label className="text-slate-700 dark:text-slate-300">{t('onboarding.step2Status')}</Label>
          <Select value={profile.usmle_step2_status} onValueChange={(v) => updateProfile('usmle_step2_status', v)}>
            <SelectTrigger className="h-12 rounded-xl mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">{t('onboarding.notStarted')}</SelectItem>
              <SelectItem value="studying">{t('onboarding.studying')}</SelectItem>
              <SelectItem value="scheduled">{t('onboarding.scheduled')}</SelectItem>
              <SelectItem value="passed">{t('onboarding.passed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {profile.usmle_step2_status === 'passed' && (
          <div>
            <Label className="text-slate-700 dark:text-slate-300">Step 2 CK Score (Critical for Matching)</Label>
            <Input
              placeholder="e.g., 245 - aim for ≥240 for best chances"
              value={profile.usmle_step2_score}
              onChange={(e) => updateProfile('usmle_step2_score', e.target.value)}
              className="h-12 rounded-xl mt-1"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Step 2 CK score is a major factor for IMG matching success
            </p>
          </div>
        )}

        <div>
          <Label className="text-slate-700 dark:text-slate-300">USMLE Step 3 Status</Label>
          <Select value={profile.usmle_step3_status} onValueChange={(v) => updateProfile('usmle_step3_status', v)}>
            <SelectTrigger className="h-12 rounded-xl mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="studying">Studying</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {profile.usmle_step3_status === 'passed' && (
          <div>
            <Label className="text-slate-700 dark:text-slate-300">Step 3 Result</Label>
            <Select value={profile.usmle_step3_result} onValueChange={(v) => updateProfile('usmle_step3_result', v)}>
              <SelectTrigger className="h-12 rounded-xl mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="fail">Fail</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

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
          <span className="text-slate-700 dark:text-slate-300">I have US clinical experience (observership/externship/rotation)</span>
        </div>

        {/* Alternative Pathways Notice */}
        {profile.previous_training && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-1">💡 Alternative Pathway</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Since you have previous training, consider checking <strong>APPD (appd.org)</strong> for unfilled residency spots. Programs post available positions mid-year — this is a faster route for applicants with prior US training experience.
            </p>
          </div>
        )}
        {profile.graduation_year && (currentYear - profile.graduation_year) >= 10 && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-1">💡 Alternative Pathway for Your Situation</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Given your graduation year, also check <strong>APPD (appd.org)</strong> for unfilled residency spots mid-year. Some community programs are more flexible with graduation cutoffs and may have immediate openings.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  ];

  const canProceed = () => {
    switch(step) {
      case 0: return profile.display_name.length > 0;
      case 1: return profile.country && profile.medical_school_country && profile.medical_school;
      case 2: return profile.languages.length > 0;
      case 3: return !!profile.primary_goal;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex flex-col safe-area-top">
      <div className="px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {steps.map((_, idx) => (
            <div key={idx} className="flex items-center flex-1">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  idx <= step
                    ? 'bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(110,135,30)] text-white shadow-lg'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: idx === step ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {idx + 1}
              </motion.div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                  idx < step ? 'bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(110,135,30)]' : 'bg-slate-200 dark:bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>
        <motion.p
          key={step}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-slate-600 dark:text-slate-400 mt-3"
        >
          Step {step + 1} of {steps.length}
        </motion.p>
      </div>

      <div className="flex-1 flex flex-col justify-center py-8">
        <AnimatePresence mode="wait">
          {steps[step]}
        </AnimatePresence>
      </div>

      <div className="p-6 pb-safe flex gap-3">
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
          className="flex-1 h-14 rounded-xl bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(110,135,30)] hover:opacity-90 text-white font-semibold"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : step === steps.length - 1 ? (
            t('onboarding.startJourney')
          ) : (
            <>{t('continue')} <ChevronRight className="w-5 h-5 ml-2" /></>
          )}
        </Button>
      </div>
    </div>
  );
}