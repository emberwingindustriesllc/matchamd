import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  MapPin, 
  Users, 
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Globe,
  Heart,
  Star,
  ArrowUpDown,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function IMGPrograms() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [minIMGScore, setMinIMGScore] = useState(1);
  const [sortBy, setSortBy] = useState('img_friendly_score');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['residencyPrograms'],
    queryFn: () => base44.entities.ResidencyProgram.list()
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => base44.entities.FavoriteProgram.filter({ user_id: user?.id }),
    enabled: !!user?.id
  });

  const addFavoriteMutation = useMutation({
    mutationFn: ({ program_id, rank }) =>
      base44.entities.FavoriteProgram.create({ user_id: user.id, program_id, rank }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Added to favorites');
    }
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (favId) => base44.entities.FavoriteProgram.delete(favId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Removed from favorites');
    }
  });

  const isFavorite = (programId) => favorites.some(f => f.program_id === programId);
  const getFavorite = (programId) => favorites.find(f => f.program_id === programId);

  const toggleFavorite = (prog, e) => {
    e.stopPropagation();
    const fav = getFavorite(prog.id);
    if (fav) {
      removeFavoriteMutation.mutate(fav.id);
    } else {
      addFavoriteMutation.mutate({ program_id: prog.id, rank: favorites.length + 1 });
    }
  };

  const specialties = [...new Set(programs.map(p => p.specialty))].sort();
  const states = [...new Set(programs.map(p => p.state))].sort();

  const filteredPrograms = programs
    .filter(prog => {
      const matchesSearch = prog.program_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           prog.institution.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialty = selectedSpecialty === 'all' || prog.specialty === selectedSpecialty;
      const matchesState = selectedState === 'all' || prog.state === selectedState;
      const matchesIMGScore = (prog.img_friendly_score || 0) >= minIMGScore;
      const matchesFav = !showFavoritesOnly || isFavorite(prog.id);
      return matchesSearch && matchesSpecialty && matchesState && matchesIMGScore && matchesFav;
    })
    .sort((a, b) => {
      if (sortBy === 'img_friendly_score') return (b.img_friendly_score || 0) - (a.img_friendly_score || 0);
      if (sortBy === 'img_percentage') return (b.img_percentage || 0) - (a.img_percentage || 0);
      if (sortBy === 'img_graduation_rate') return (b.img_graduation_rate || 0) - (a.img_graduation_rate || 0);
      if (sortBy === 'state') return (a.state || '').localeCompare(b.state || '');
      if (sortBy === 'favorites') {
        const aRank = getFavorite(a.id)?.rank ?? 9999;
        const bRank = getFavorite(b.id)?.rank ?? 9999;
        return aRank - bRank;
      }
      return 0;
    });

  const getIMGFriendlinessColor = (score) => {
    if (score >= 8) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 6) return 'text-amber-600 dark:text-amber-400';
    return 'text-slate-600 dark:text-slate-400';
  };

  const getGradRateBadge = (rate) => {
    if (!rate) return null;
    if (rate >= 90) return { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: `${rate}% grad rate` };
    if (rate >= 75) return { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: `${rate}% grad rate` };
    return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: `${rate}% grad rate` };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header title="IMG-Friendly Programs" showBack showSearch={false} />

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Hero */}
        <Card className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                IMG-Friendly Residency Programs
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Find programs with high IMG acceptance rates, visa sponsorship, and IMG graduation rates. Save favorites and rank them.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <a
                  href="https://apps.acgme.org/ads/Public/Programs/Search"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  FRIEDA / ACGME Program Search
                </a>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <a
                  href="https://www.appd.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  APPD – Unfilled Spots
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* APPD Notice */}
        <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Alternative Pathway: Unfilled Spots</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                <strong>APPD (appd.org)</strong> posts unfilled residency positions mid-year. This is NOT for fresh graduates — it's best suited for applicants with prior US training or clinical experience who need a spot quickly. Check their site regularly after the main match cycle.
              </p>
            </div>
          </div>
        </Card>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search programs or institutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="rounded-xl flex-1">
                <ArrowUpDown className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="img_friendly_score">Most IMG-Friendly</SelectItem>
                <SelectItem value="img_percentage">Highest % IMG Residents</SelectItem>
                <SelectItem value="img_graduation_rate">Best IMG Graduation Rate</SelectItem>
                <SelectItem value="state">By State (A-Z)</SelectItem>
                <SelectItem value="favorites">My Ranking</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showFavoritesOnly ? 'default' : 'outline'}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="rounded-xl gap-2 shrink-0"
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-white' : ''}`} />
              Saved ({favorites.length})
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {filteredPrograms.length} programs found
          </p>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredPrograms.length === 0 ? (
            <Card className="p-12 text-center">
              <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No programs found</p>
            </Card>
          ) : (
            filteredPrograms.map((prog) => {
              const gradBadge = getGradRateBadge(prog.img_graduation_rate);
              const favRank = getFavorite(prog.id)?.rank;
              return (
                <motion.div
                  key={prog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card 
                    className="p-5 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedProgram(prog)}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {favRank && (
                            <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full font-medium">
                              <Star className="w-3 h-3 fill-current" />#{favRank}
                            </span>
                          )}
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {prog.program_name}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {prog.institution}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getIMGFriendlinessColor(prog.img_friendly_score)}`}>
                            {prog.img_friendly_score}/10
                          </div>
                          <p className="text-xs text-slate-500">IMG Score</p>
                        </div>
                        <button
                          onClick={(e) => toggleFavorite(prog, e)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Heart className={`w-5 h-5 ${isFavorite(prog.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">{prog.specialty}</Badge>
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        {prog.city}, {prog.state}
                      </Badge>
                      {prog.visa_j1 && (
                        <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">J-1</Badge>
                      )}
                      {prog.visa_h1b && (
                        <Badge className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">H-1B</Badge>
                      )}
                      {gradBadge && (
                        <Badge className={`text-xs ${gradBadge.color}`}>{gradBadge.label}</Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          IMG Residents
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {prog.img_residents}/{prog.program_size} ({Math.round(prog.img_percentage || 0)}%)
                        </span>
                      </div>
                      <Progress value={prog.img_percentage || 0} className="h-2" />
                    </div>

                    {prog.step2_score_min && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                          <div><span className="font-medium">Min Step 2 CK:</span> {prog.step2_score_min}</div>
                          {prog.step2_score_avg && (
                            <div><span className="font-medium">Avg:</span> {prog.step2_score_avg}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={!!selectedProgram} onOpenChange={() => setSelectedProgram(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3">
              <span>{selectedProgram?.program_name}</span>
              {selectedProgram && (
                <button
                  onClick={(e) => { toggleFavorite(selectedProgram, e); }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Heart className={`w-5 h-5 ${isFavorite(selectedProgram?.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                </button>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedProgram && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Institution</h4>
                <p className="text-slate-600 dark:text-slate-400">{selectedProgram.institution}</p>
                <p className="text-sm text-slate-500">{selectedProgram.city}, {selectedProgram.state}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Specialty</h4>
                  <p className="text-slate-600 dark:text-slate-400">{selectedProgram.specialty}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Program Type</h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedProgram.community_program ? 'Community' : 'University'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">IMG Statistics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Total Residents:</span>
                    <span className="font-semibold">{selectedProgram.program_size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">IMG Residents:</span>
                    <span className="font-semibold">{selectedProgram.img_residents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">IMG % of Program:</span>
                    <span className="font-semibold">{Math.round(selectedProgram.img_percentage || 0)}%</span>
                  </div>
                  {selectedProgram.img_graduation_rate && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">IMG Graduation Rate:</span>
                      <span className={`font-semibold ${getGradRateBadge(selectedProgram.img_graduation_rate)?.color || ''} px-2 py-0.5 rounded`}>
                        {selectedProgram.img_graduation_rate}%
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">IMG-Friendly Score:</span>
                    <span className={`font-semibold text-lg ${getIMGFriendlinessColor(selectedProgram.img_friendly_score)}`}>
                      {selectedProgram.img_friendly_score}/10
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Visa Sponsorship</h4>
                <div className="flex gap-2">
                  {selectedProgram.visa_j1 ? (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      <CheckCircle2 className="w-3 h-3 mr-1" />J-1 Visa
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-400">No J-1</Badge>
                  )}
                  {selectedProgram.visa_h1b ? (
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      <CheckCircle2 className="w-3 h-3 mr-1" />H-1B Visa
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-400">No H-1B</Badge>
                  )}
                </div>
              </div>

              {(selectedProgram.step2_score_min || selectedProgram.step2_score_avg) && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Score Requirements</h4>
                  <div className="space-y-2">
                    {selectedProgram.step2_score_min && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Min Step 2 CK:</span>
                        <span className="font-semibold">{selectedProgram.step2_score_min}</span>
                      </div>
                    )}
                    {selectedProgram.step2_score_avg && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Avg Step 2 CK:</span>
                        <span className="font-semibold">{selectedProgram.step2_score_avg}</span>
                      </div>
                    )}
                    {selectedProgram.step3_required && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Step 3:</span>
                        <Badge variant="outline">Required</Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {selectedProgram.website && (
                  <Button asChild className="flex-1">
                    <a href={selectedProgram.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Program Website
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline" className="flex-1">
                  <a href={`https://apps.acgme.org/ads/Public/Programs/Search`} target="_blank" rel="noopener noreferrer">
                    <BookOpen className="w-4 h-4 mr-2" />
                    ACGME / FRIEDA
                  </a>
                </Button>
              </div>

              {selectedProgram.nrmp_code && (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  NRMP Code: {selectedProgram.nrmp_code}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}