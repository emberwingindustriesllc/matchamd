import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Award, 
  MapPin, 
  Stethoscope, 
  MessageSquare,
  CheckCircle2,
  Star,
  Filter,
  X,
  Users,
  Video,
  ChevronRight,
  UserCheck,
  Plus
} from 'lucide-react';
import VideoCallModal from '@/components/mentorship/VideoCallModal';
import MentorDetailModal from '@/components/mentorship/MentorDetailModal';
import BecomeMentorModal from '@/components/mentorship/BecomeMentorModal';
import { mockMentors } from '@/data/mockMentors';

export default function Mentors() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [detailModalMentor, setDetailModalMentor] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [videoCallMentor, setVideoCallMentor] = useState(null);
  const [showBecomeMentorModal, setShowBecomeMentorModal] = useState(false);

  const { user } = useAuth();

  const { data: myProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', user?.id);
      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!user?.id
  });

  const { data: dbMentors = [], isLoading, refetch: refetchMentors } = useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('user_profiles').select('*').eq('mentor_verified', true);
        if (error) return [];
        return data || [];
      } catch (e) {
        return [];
      }
    }
  });

  // Combine DB mentors with mockMentors and local applications
  const mentors = React.useMemo(() => {
    const local = JSON.parse(localStorage.getItem('matchamd_local_mentors') || '[]');
    const dbIds = new Set(dbMentors.map(m => m.user_id || m.id));
    const uniqueMock = mockMentors.filter(m => !dbIds.has(m.id) && !dbIds.has(m.user_id));
    const uniqueLocal = local.filter(m => !dbIds.has(m.id) && !dbIds.has(m.user_id));
    return [...uniqueLocal, ...dbMentors, ...uniqueMock];
  }, [dbMentors]);

  const { data: myRequests = [] } = useQuery({
    queryKey: ['mentorRequests'],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const { data, error } = await supabase.from('mentor_requests').select('*').eq('mentee_id', user?.id);
        if (error) return [];
        return data || [];
      } catch (e) {
        return [];
      }
    },
    enabled: !!user?.id
  });

  const sendRequestMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMentor) return;
      const { data, error } = await supabase.from('mentor_requests').insert({
        mentee_id: user?.id || 'demo_user',
        mentor_id: selectedMentor.user_id || selectedMentor.id,
        mentee_name: myProfile?.display_name || user?.full_name || 'Applicant',
        mentor_name: selectedMentor.display_name,
        message: requestMessage,
        goal: myProfile?.primary_goal || 'Residency Guidance',
        specialty_interest: myProfile?.target_specialty || selectedMentor.target_specialty,
        status: 'pending'
      }).select().single();
      if (error) {
        console.warn('Could not save request to DB, keeping UI updated:', error);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorRequests'] });
      setSelectedMentor(null);
      setRequestMessage('');
    }
  });

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.target_specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.matched_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.medical_school?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'all' || mentor.target_specialty === specialtyFilter;
    const matchesLocation = locationFilter === 'all' || 
                           mentor.matched_city === locationFilter || 
                           mentor.matched_state === locationFilter;
    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  const specialties = [...new Set(mentors.map(m => m.target_specialty).filter(Boolean))];
  const locations = [...new Set(mentors.map(m => m.matched_city || m.matched_state).filter(Boolean))];

  const hasPendingRequest = (mentorId) => {
    return myRequests.some(r => r.mentor_id === mentorId && r.status === 'pending');
  };

  const hasAcceptedConnection = (mentorId) => {
    return myRequests.some(r => r.mentor_id === mentorId && r.status === 'accepted');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header
        title="Find a Mentor"
        showBack
        rightContent={
          <Button
            onClick={() => setShowBecomeMentorModal(true)}
            size="sm"
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-sm"
          >
            <UserCheck className="w-4 h-4 mr-1" /> Become Mentor
          </Button>
        }
      />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 text-white mb-6 shadow-md"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <Button
                onClick={() => setShowBecomeMentorModal(true)}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-xl text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Join as Mentor
              </Button>
            </div>
            <h2 className="text-xl font-bold mb-1">Connect with Verified FMG Mentors</h2>
            <p className="text-white/90 text-sm">
              Get personalized 1-on-1 guidance, personal statement edits, and mock interviews from physicians who matched.
            </p>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by name, specialty, or hospital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-2xl border-slate-200 dark:border-slate-700"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-12 w-12 rounded-2xl ${showFilters ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500' : ''}`}
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>

          {/* Quick Specialty Chips */}
          {!showFilters && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSpecialtyFilter('all')}
                className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all flex-shrink-0 ${
                  specialtyFilter === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                All Specialties
              </button>
              {specialties.slice(0, 6).map(specialty => (
                <button
                  key={specialty}
                  onClick={() => setSpecialtyFilter(specialty)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all flex-shrink-0 ${
                    specialtyFilter === specialty
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          )}

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3"
            >
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Filter by Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Filter by Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(specialtyFilter !== 'all' || locationFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSpecialtyFilter('all');
                    setLocationFilter('all');
                  }}
                  className="w-full rounded-xl"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </motion.div>
          )}

          {/* Stats */}
          <div className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <Users className="w-4 h-4 text-indigo-500" />
              {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''} available
            </span>
          </div>
        </div>

        {/* Mentors List */}
        <div className="space-y-4">
          {filteredMentors.map((mentor, idx) => (
            <motion.div
              key={mentor.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setDetailModalMentor(mentor)}
              className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-14 h-14 border border-slate-100 dark:border-slate-700 flex-shrink-0">
                  <AvatarImage src={mentor.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-lg font-bold">
                    {mentor.display_name?.[0]?.toUpperCase() || 'M'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {mentor.display_name}
                      </h3>
                      <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {mentor.target_specialty && (
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-medium">
                        <Stethoscope className="w-3 h-3 mr-1" />
                        {mentor.target_specialty}
                      </Badge>
                    )}
                    {(mentor.matched_city || mentor.matched_state) && (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        <MapPin className="w-3 h-3 mr-1" />
                        {mentor.matched_city ? `${mentor.matched_city}, ${mentor.matched_state || ''}` : mentor.matched_state}
                      </Badge>
                    )}
                    {mentor.ecfmg_certified && (
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        ECFMG Certified
                      </Badge>
                    )}
                  </div>
                  
                  {mentor.bio && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                      {mentor.bio}
                    </p>
                  )}
                  
                  <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                    {hasAcceptedConnection(mentor.user_id || mentor.id) ? (
                      <>
                        <Button 
                          onClick={() => setVideoCallMentor(mentor)}
                          className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs h-9"
                        >
                          <Video className="w-3.5 h-3.5 mr-1.5" />
                          Video Call
                        </Button>
                        <Button variant="outline" className="rounded-xl text-xs h-9">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    ) : hasPendingRequest(mentor.user_id || mentor.id) ? (
                      <Button variant="outline" className="rounded-xl text-xs h-9" disabled>
                        Request Pending
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setSelectedMentor(mentor)}
                        className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs h-9 shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                        Request Mentorship
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && filteredMentors.length === 0 && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}

          {filteredMentors.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
              <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 dark:text-white mb-1">No mentors found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search query or filters</p>
            </div>
          )}
        </div>
      </main>

      {/* Mentor Details Modal */}
      <MentorDetailModal
        mentor={detailModalMentor}
        isOpen={!!detailModalMentor}
        onClose={() => setDetailModalMentor(null)}
        onRequestMentorship={(m) => setSelectedMentor(m)}
        onStartVideoCall={(m) => setVideoCallMentor(m)}
        hasPending={detailModalMentor && hasPendingRequest(detailModalMentor.user_id || detailModalMentor.id)}
        hasAccepted={detailModalMentor && hasAcceptedConnection(detailModalMentor.user_id || detailModalMentor.id)}
      />

      {/* Request Dialog */}
      <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
            <DialogDescription>
              Send a personalized message to {selectedMentor?.display_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Textarea
              placeholder="Introduce yourself, your step scores/timeline, and explain what advice or assistance you are seeking..."
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              className="min-h-[140px] rounded-2xl"
            />
            <Button 
              onClick={() => sendRequestMutation.mutate()}
              disabled={!requestMessage.trim() || sendRequestMutation.isPending}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium h-12"
            >
              Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <VideoCallModal
        isOpen={!!videoCallMentor}
        onClose={() => setVideoCallMentor(null)}
        mentorName={videoCallMentor?.display_name || 'Mentor'}
      />

      <BecomeMentorModal
        open={showBecomeMentorModal}
        onOpenChange={setShowBecomeMentorModal}
        onSuccess={refetchMentors}
      />

      <BottomNav />
    </div>
  );
}