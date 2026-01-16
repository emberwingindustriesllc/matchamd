import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Settings, 
  Edit2, 
  LogOut, 
  Trophy, 
  MapPin, 
  Stethoscope,
  CheckCircle2,
  Camera,
  Moon,
  Globe,
  GraduationCap,
  BookOpen
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

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: user?.id }),
    enabled: !!user?.id
  });

  const { data: progressList = [] } = useQuery({
    queryKey: ['progress'],
    queryFn: () => base44.entities.Progress.filter({ user_id: user?.id }),
    enabled: !!user?.id
  });

  const profile = profiles?.[0];
  const completedModules = progressList.filter(p => p.status === 'completed').length;
  const totalModules = 13; // Total steps in residency pathway

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.UserProfile.update(profile.id, data);
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
      country: profile?.country || '',
      medical_school: profile?.medical_school || '',
      medical_school_country: profile?.medical_school_country || '',
      undergraduate_college: profile?.undergraduate_college || '',
      preferred_language: profile?.preferred_language || 'en',
      dark_mode: profile?.dark_mode || false
    });
    setIsEditOpen(true);
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header 
        title="Profile" 
        rightContent={
          <Button variant="ghost" size="icon" onClick={handleEditOpen} className="rounded-xl">
            <Settings className="w-5 h-5" />
          </Button>
        }
      />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex items-center gap-5">
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-white/30">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                  {profile.display_name?.[0]?.toUpperCase() || user?.full_name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4 text-indigo-600" />
              </button>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile.display_name || user?.full_name}</h2>
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
          <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700 text-center">
            <ProgressRing progress={(completedModules / totalModules) * 100} size={80} strokeWidth={6} />
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Journey Progress</p>
          </Card>
          
          <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700 text-center">
            <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
              {completedModules}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Steps Completed</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">of {totalModules} total</p>
          </Card>
        </div>

        {/* Info Cards */}
        <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Your Details</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Location</p>
                <p className="font-medium text-slate-800 dark:text-white">{profile.country || 'Not set'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Language</p>
                <p className="font-medium text-slate-800 dark:text-white">
                  {languages.find(l => l.code === profile.preferred_language)?.name || 'English'}
                </p>
              </div>
            </div>
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

        {/* Actions */}
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full h-12 rounded-xl text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>
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
                <Label>Preferred Language</Label>
                <Select 
                  value={editData.preferred_language} 
                  onValueChange={(v) => setEditData({ ...editData, preferred_language: v })}
                >
                  <SelectTrigger className="rounded-xl mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(l => (
                      <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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