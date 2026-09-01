import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { sanitizeDisplayName } from '@/lib/utils';
import { validateProfile } from '@/lib/validation/profileSchema';

import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import ProgressRing from '@/components/common/ProgressRing';
import BadgeIcon from '@/components/common/BadgeIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Settings, 
  LogOut, 
  Trash2,
  Trophy, 
  MapPin, 
  Stethoscope,
  CheckCircle2,
  Camera,
  Moon,
  Globe,
  GraduationCap,
  BookOpen,
  Crown,
  Shield
} from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'zh', name: '中文' },
  { code: 'fr', name: 'Français' },
  { code: 'pt', name: 'Português' }
];

const specialties = [
  'Internal Medicine', 'Family Medicine', 'Pediatrics', 'Surgery', 
  'Emergency Medicine', 'Psychiatry', 'OB/GYN', 'Neurology',
  'Radiology', 'Anesthesiology', 'Pathology', 'Dermatology', 'Other'
];

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const { user, logout } = useAuth();


  const { data: profiles, isLoading } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const { data: progressList = [] } = useQuery({
    queryKey: ['progress', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('progress').select('*').eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const profile = profiles?.[0];
  const completedModules = progressList.filter(p => p.status === 'completed').length;
  const totalModules = 13; // Total steps in residency pathway

  const updateProfileMutation = useMutation({
    /** @param {any} dataToUpdate */
    mutationFn: async (dataToUpdate) => {
      // Validate the update data against ProfileEditSchema (partial schema)
      const validated = validateProfile(dataToUpdate, true);
      if (!validated.success) {
        throw new Error(`Validation failed: ${validated.errors.map(e => `${e.field}: ${e.message}`).join('; ')}`);
      }

      // Clean/sanitize fields for database
      const cleanedData = { ...validated.data };
      if (cleanedData.graduation_year !== undefined) {
        cleanedData.graduation_year = cleanedData.graduation_year ? parseInt(String(cleanedData.graduation_year), 10) : null;
      }

      const { data, error } = await supabase.from('user_profiles').update(cleanedData).eq('id', profile.id).select();

      if (error) {
        throw error;
      }
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setIsEditOpen(false);
    }
  });

  const handleEditOpen = () => {
    setEditData({
      display_name: profile?.display_name || '',
      bio: profile?.bio || '',
      target_specialty: profile?.target_specialty || '',
      target_city: profile?.target_city || '',
      target_state: profile?.target_state || '',
      country: profile?.country || '',
      medical_school: profile?.medical_school || '',
      medical_school_country: profile?.medical_school_country || '',
      undergraduate_college: profile?.undergraduate_college || '',
      visa_status: profile?.visa_status || 'none',
      acgme_waiver: profile?.acgme_waiver || false,
      previous_training: profile?.previous_training || '',
      usmle_step1_score: profile?.usmle_step1_score || '',
      usmle_step2_score: profile?.usmle_step2_score || '',
      graduation_year: profile?.graduation_year || '',
      dark_mode: profile?.dark_mode || false
    });
    setIsEditOpen(true);
  };

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      if (user?.id) {
        await supabase.from('profiles').delete().eq('id', user.id);
        localStorage.clear();
      }
      await logout();
      navigate(createPageUrl('Onboarding'));
    } catch (err) {
      console.error('Error deleting account:', err);
      setIsDeletingAccount(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header 
        title="Profile" 
        rightContent={
          <Button variant="ghost" size="icon" onClick={handleEditOpen} className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Button>
        }
      />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[rgb(var(--color-primary))] via-[rgb(var(--color-secondary))] to-[rgb(var(--color-accent))] p-6 text-white shadow-xl"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex items-center gap-5">
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-white/30">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                  {profile.display_name?.[0]?.toUpperCase() || user?.full_name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <Camera className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const readAsBase64 = (f) =>
                      new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(f);
                      });

                    try {
                      if (user?.id) {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                        const filePath = `${user.id}/${fileName}`;

                        const { error: uploadError } = await supabase.storage
                          .from('avatars')
                          .upload(filePath, file, { upsert: true });

                        if (!uploadError) {
                          const { data } = supabase.storage
                            .from('avatars')
                            .getPublicUrl(filePath);
                          if (data?.publicUrl) {
                            updateProfileMutation.mutate({ avatar_url: data.publicUrl });
                            return;
                          }
                        }
                      }
                    } catch (error) {
                      console.warn('Supabase storage upload failed, using local Base64 fallback:', error);
                    }

                    // Base64 Fallback
                    try {
                      const base64Url = await readAsBase64(file);
                      localStorage.setItem('matchamd_local_avatar', base64Url);
                      if (profile?.id && user?.id) {
                        updateProfileMutation.mutate({ avatar_url: base64Url });
                      } else {
                        queryClient.setQueryData(['userProfile', user?.id], (old) => {
                          if (!old || old.length === 0) return [{ ...profile, avatar_url: base64Url }];
                          return [{ ...old[0], avatar_url: base64Url }];
                        });
                      }
                    } catch (err) {
                      console.error('Failed to convert avatar to Base64:', err);
                    }
                  }}
                />
              </label>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold">{sanitizeDisplayName(profile.display_name) || user?.full_name || 'Dr. Applicant'}</h2>
              <p className="text-white/70 text-sm">{user?.email}</p>
              
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm font-medium">{profile.points || 0} pts</span>
                </div>
                {profile.ecfmg_certified && (
                  <div className="flex items-center gap-1.5 bg-emerald-400/30 rounded-full px-3 py-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">ECFMG</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card 
            onClick={() => navigate(createPageUrl('Guides'))}
            className="p-5 rounded-2xl border-slate-200 dark:border-slate-700 text-center hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer transition-all hover:shadow-md group"
          >
            <ProgressRing progress={(completedModules / totalModules) * 100} size={80} strokeWidth={6} />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Journey Progress
            </p>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">View Roadmap →</span>
          </Card>
          
          <Card 
            onClick={() => navigate(createPageUrl('Guides'))}
            className="p-5 rounded-2xl border-slate-200 dark:border-slate-700 text-center hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer transition-all hover:shadow-md group"
          >
            <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {completedModules}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Steps Completed</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">of {totalModules} total</p>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1 inline-block">Click to explore →</span>
          </Card>
        </div>

        {/* Info Cards */}
        <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Your Details</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(var(--color-primary),0.1)] dark:bg-[rgba(var(--color-primary),0.2)] flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Location</p>
                <p className="font-medium text-slate-800 dark:text-white">{profile.country || 'Not set'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(var(--color-secondary),0.1)] dark:bg-[rgba(var(--color-secondary),0.2)] flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-[rgb(var(--color-secondary))]" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Target Specialty</p>
                <p className="font-medium text-slate-800 dark:text-white">{profile.target_specialty || 'Not set'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Medical School</p>
                <p className="font-medium text-slate-800 dark:text-white">{profile.medical_school || 'Not set'}</p>
                {profile.medical_school_country && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{profile.medical_school_country}</p>
                )}
              </div>
            </div>

            {profile.undergraduate_college && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Undergraduate College</p>
                  <p className="font-medium text-slate-800 dark:text-white">{profile.undergraduate_college}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* USMLE Scores */}
        <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white">USMLE Progress</h3>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Click step to view guide</span>
          </div>
          
          <div className="space-y-3">
            <div 
              onClick={() => navigate(createPageUrl('GuideDetail?id=usmle_step1'))}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/70 dark:bg-slate-800 dark:hover:bg-indigo-900/30 border border-transparent hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                  Step 1
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-normal">→</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{profile.usmle_step1_status?.replace('_', ' ')}</p>
              </div>
              {profile.usmle_step1_score && (
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{profile.usmle_step1_score}</p>
                </div>
              )}
            </div>

            <div 
              onClick={() => navigate(createPageUrl('GuideDetail?id=usmle_step2'))}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/70 dark:bg-slate-800 dark:hover:bg-indigo-900/30 border border-transparent hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                  Step 2 CK
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-normal">→</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{profile.usmle_step2_status?.replace('_', ' ')}</p>
              </div>
              {profile.usmle_step2_score && (
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{profile.usmle_step2_score}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Critical for matching</p>
                </div>
              )}
            </div>

            <div 
              onClick={() => navigate(createPageUrl('GuideDetail?id=usmle_step3'))}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/70 dark:bg-slate-800 dark:hover:bg-indigo-900/30 border border-transparent hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                  Step 3
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-normal">→</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{(profile.usmle_step3_status || 'not_started').replace('_', ' ')}</p>
              </div>
              {profile.usmle_step3_result && profile.usmle_step3_result !== 'not_applicable' && (
                <Badge className={profile.usmle_step3_result === 'pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                  {profile.usmle_step3_result}
                </Badge>
              )}
            </div>

            {(profile.target_city || profile.target_state) && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Target Location</p>
                  <p className="font-medium text-slate-800 dark:text-white">
                    {profile.target_city ? `${profile.target_city}, ${profile.target_state || ''}` : profile.target_state}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Visa Status</p>
                <p className="font-medium text-slate-800 dark:text-white">
                  {profile.visa_status === 'none' ? 'None / Need Sponsorship' : profile.visa_status}
                </p>
              </div>
            </div>
            
            {profile.acgme_waiver && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">ACGME Waiver</p>
                  <p className="font-medium text-slate-800 dark:text-white">Yes</p>
                </div>
              </div>
            )}
            
            {profile.previous_training && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Previous Training</p>
                  <p className="font-medium text-slate-800 dark:text-white">{profile.previous_training}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Badges */}
        {profile.badges?.length > 0 && (
          <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Achievements</h3>
            <div className="flex gap-4 flex-wrap">
              {profile.badges.map(badge => (
                <BadgeIcon key={badge} type={badge} size="lg" showLabel />
              ))}
            </div>
          </Card>
        )}

        {/* Bio */}
        {profile.bio && (
          <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">About</h3>
            <p className="text-slate-600 dark:text-slate-400">{profile.bio}</p>
          </Card>
        )}

        {/* Premium */}
        <Card className="p-4 bg-gradient-to-br from-[rgba(var(--color-primary),0.05)] to-[rgba(var(--color-secondary),0.1)] dark:from-[rgba(var(--color-primary),0.1)] dark:to-[rgba(var(--color-secondary),0.2)] border-[rgba(var(--color-primary),0.20)] dark:border-[rgba(var(--color-primary),0.4)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Experience MatchaMD+</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Unlock all features & content</p>
            </div>
            <Button 
              onClick={() => navigate(createPageUrl('Subscription'))}
              className="bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] hover:opacity-90 text-white shadow-lg"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          </div>
        </Card>

        {/* Legal */}
        <Button 
          variant="outline" 
          onClick={() => navigate(createPageUrl('Legal'))}
          className="w-full h-12 rounded-xl"
        >
          <Shield className="w-5 h-5 mr-2" />
          Legal & Privacy
        </Button>

        {/* Actions */}
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full h-12 rounded-xl text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        >
          <LogOut className="w-5 h-5 mr-2 text-slate-500" />
          Sign Out
        </Button>

        {/* Delete Account (Google Play & Privacy Requirement) */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-xl text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Account & Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl max-w-sm sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Delete Account?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 dark:text-slate-400 text-sm">
                This will permanently delete your account profile, saved residency programs, checklist progress, and quiz history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row gap-2 justify-end">
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              >
                {isDeletingAccount ? 'Deleting...' : 'Delete Everything'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          
          {editData && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Display Name</Label>
                <Input
                  value={editData.display_name}
                  onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                  className="rounded-xl mt-1"
                />
              </div>
              
              <div>
                <Label>Bio</Label>
                <Textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  placeholder="Tell others about yourself..."
                  className="rounded-xl mt-1"
                />
              </div>
              
              <div>
                <Label>Target Specialty</Label>
                <Select 
                  value={editData.target_specialty} 
                  onValueChange={(v) => setEditData({ ...editData, target_specialty: v })}
                >
                  <SelectTrigger className="rounded-xl mt-1">
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Medical School</Label>
                <Input
                  value={editData.medical_school}
                  onChange={(e) => setEditData({ ...editData, medical_school: e.target.value })}
                  placeholder="Your medical school name"
                  className="rounded-xl mt-1"
                />
              </div>

              <div>
                <Label>Medical School Country</Label>
                <Input
                  value={editData.medical_school_country}
                  onChange={(e) => setEditData({ ...editData, medical_school_country: e.target.value })}
                  placeholder="Country"
                  className="rounded-xl mt-1"
                />
              </div>

              <div>
                <Label>Undergraduate College (Optional)</Label>
                <Input
                  value={editData.undergraduate_college}
                  onChange={(e) => setEditData({ ...editData, undergraduate_college: e.target.value })}
                  placeholder="Your undergraduate institution"
                  className="rounded-xl mt-1"
                />
              </div>

              <div>
                <Label>Target City (Optional)</Label>
                <Input
                  value={editData.target_city}
                  onChange={(e) => setEditData({ ...editData, target_city: e.target.value })}
                  placeholder="e.g., New York, Los Angeles"
                  className="rounded-xl mt-1"
                />
              </div>

              <div>
                <Label>Target State (Optional)</Label>
                <Input
                  value={editData.target_state}
                  onChange={(e) => setEditData({ ...editData, target_state: e.target.value })}
                  placeholder="e.g., NY, CA"
                  className="rounded-xl mt-1"
                />
              </div>
              
              <div>
                <Label>Visa Status</Label>
                <Select 
                  value={editData.visa_status} 
                  onValueChange={(v) => setEditData({ ...editData, visa_status: v })}
                >
                  <SelectTrigger className="rounded-xl mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None / Need Sponsorship</SelectItem>
                    <SelectItem value="J1">J-1 Visa</SelectItem>
                    <SelectItem value="H1B">H-1B Visa</SelectItem>
                    <SelectItem value="Citizen">US Citizen</SelectItem>
                    <SelectItem value="GreenCard">Permanent Resident (Green Card)</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Graduation Year</Label>
                <Input
                  type="number"
                  value={editData.graduation_year}
                  onChange={(e) => setEditData({ ...editData, graduation_year: e.target.value })}
                  className="rounded-xl mt-1"
                />
              </div>

              <div>
                <Label>Previous Training</Label>
                <Input
                  value={editData.previous_training}
                  onChange={(e) => setEditData({ ...editData, previous_training: e.target.value })}
                  placeholder="Have you had previous training? If so, what?"
                  className="rounded-xl mt-1"
                />
              </div>

              <div>
                <Label>USMLE Step 1 Score</Label>
                <Input
                  value={editData.usmle_step1_score}
                  onChange={(e) => setEditData({ ...editData, usmle_step1_score: e.target.value })}
                  className="rounded-xl mt-1"
                />
              </div>

              <div>
                <Label>USMLE Step 2 CK Score</Label>
                <Input
                  value={editData.usmle_step2_score}
                  onChange={(e) => setEditData({ ...editData, usmle_step2_score: e.target.value })}
                  className="rounded-xl mt-1"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">ACGME Waiver</span>
                </div>
                <Switch
                  checked={editData.acgme_waiver}
                  onCheckedChange={(v) => setEditData({ ...editData, acgme_waiver: v })}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">Dark Mode</span>
                </div>
                <Switch
                  checked={editData.dark_mode}
                  onCheckedChange={(v) => setEditData({ ...editData, dark_mode: v })}
                />
              </div>
              
              <Button 
                onClick={() => updateProfileMutation.mutate(editData)}
                disabled={updateProfileMutation.isPending}
                className="w-full rounded-xl"
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}