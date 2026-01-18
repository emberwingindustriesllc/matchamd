import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
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
  X
} from 'lucide-react';

export default function Mentors() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: myProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: user?.id });
      return profiles[0];
    },
    enabled: !!user?.id
  });

  const { data: mentors = [], isLoading } = useQuery({
    queryKey: ['mentors'],
    queryFn: () => base44.entities.UserProfile.filter({ mentor_verified: true })
  });

  const { data: myRequests = [] } = useQuery({
    queryKey: ['mentorRequests'],
    queryFn: () => base44.entities.MentorRequest.filter({ mentee_id: user?.id }),
    enabled: !!user?.id
  });

  const sendRequestMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.MentorRequest.create({
        mentee_id: user.id,
        mentor_id: selectedMentor.user_id,
        mentee_name: myProfile?.display_name || user?.full_name,
        mentor_name: selectedMentor.display_name,
        message: requestMessage,
        goal: myProfile?.primary_goal,
        specialty_interest: myProfile?.target_specialty,
        status: 'pending'
      });
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
                         mentor.matched_city?.toLowerCase().includes(searchQuery.toLowerCase());
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
      <Header title="Find a Mentor" showBack />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 text-white mb-6"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <Star className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold mb-2">Connect with Success</h2>
            <p className="text-white/80 text-sm">
              Get guidance from verified FMGs who've matched into their dream programs
            </p>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by name, specialty, or location..."
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
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
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
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
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
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''} available
            </span>
            {specialtyFilter !== 'all' && (
              <span className="flex items-center gap-1">
                <Stethoscope className="w-4 h-4" />
                {specialtyFilter}
              </span>
            )}
          </div>
        </div>

        {/* Mentors List */}
        <div className="space-y-4">
          {filteredMentors.map((mentor, idx) => (
            <motion.div
              key={mentor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={mentor.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-lg">
                    {mentor.display_name?.[0]?.toUpperCase() || 'M'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800 dark:text-white truncate">
                      {mentor.display_name}
                    </h3>
                    <Award className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {mentor.target_specialty && (
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                        <Stethoscope className="w-3 h-3 mr-1" />
                        {mentor.target_specialty}
                      </Badge>
                    )}
                    {(mentor.matched_city || mentor.matched_state) && (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                        <MapPin className="w-3 h-3 mr-1" />
                        {mentor.matched_city ? `${mentor.matched_city}, ${mentor.matched_state || ''}` : mentor.matched_state}
                      </Badge>
                    )}
                    {mentor.ecfmg_certified && (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        ECFMG Certified
                      </Badge>
                    )}
                  </div>
                  
                  {mentor.bio && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                      {mentor.bio}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    {hasAcceptedConnection(mentor.user_id) ? (
                      <Button className="rounded-xl bg-emerald-600" disabled>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Connected
                      </Button>
                    ) : hasPendingRequest(mentor.user_id) ? (
                      <Button variant="outline" className="rounded-xl" disabled>
                        Request Pending
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setSelectedMentor(mentor)}
                        className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Request Mentorship
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}

          {!isLoading && filteredMentors.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">No mentors found</h3>
              <p className="text-slate-500 dark:text-slate-400">Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </main>

      {/* Request Dialog */}
      <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
            <DialogDescription>
              Send a personalized message to {selectedMentor?.display_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Textarea
              placeholder="Introduce yourself and explain what you're looking for in a mentor..."
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              className="min-h-[150px] rounded-xl"
            />
            <Button 
              onClick={() => sendRequestMutation.mutate()}
              disabled={!requestMessage.trim() || sendRequestMutation.isPending}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500"
            >
              Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}