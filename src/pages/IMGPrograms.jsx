import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
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
  TrendingUp, 
  Users, 
  Award,
  CheckCircle2,
  ExternalLink,
  Filter,
  GraduationCap,
  Globe
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

export default function IMGPrograms() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [minIMGScore, setMinIMGScore] = useState(5);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const { user } = useAuth();

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['residencyPrograms'],
    queryFn: async () => {
      const { data, error } = await supabase.from('residency_programs').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const specialties = [...new Set(programs.map(p => p.specialty))];
  const states = [...new Set(programs.map(p => p.state))];

  const filteredPrograms = programs.filter(prog => {
    const matchesSearch = prog.program_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prog.institution.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || prog.specialty === selectedSpecialty;
    const matchesState = selectedState === 'all' || prog.state === selectedState;
    const matchesIMGScore = prog.img_friendly_score >= minIMGScore;
    return matchesSearch && matchesSpecialty && matchesState && matchesIMGScore;
  });

  const getIMGFriendlinessColor = (score) => {
    if (score >= 8) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 6) return 'text-amber-600 dark:text-amber-400';
    return 'text-slate-600 dark:text-slate-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header title="IMG-Friendly Programs" showBack showSearch={false} />

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Hero */}
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                IMG-Friendly Residency Programs
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Find programs with high IMG acceptance rates, visa sponsorship, and competitive score requirements. Data includes number of current IMG residents and average scores.
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
                {states.sort().map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Min IMG-Friendly Score: {minIMGScore}/10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={minIMGScore}
              onChange={(e) => setMinIMGScore(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {filteredPrograms.length} programs found
            </p>
          </div>

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
            filteredPrograms.map((prog) => (
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
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {prog.program_name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {prog.institution}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getIMGFriendlinessColor(prog.img_friendly_score)}`}>
                        {prog.img_friendly_score}/10
                      </div>
                      <p className="text-xs text-slate-500">IMG Score</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {prog.specialty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="w-3 h-3 mr-1" />
                      {prog.city}, {prog.state}
                    </Badge>
                    {prog.visa_j1 && (
                      <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        J-1 Visa
                      </Badge>
                    )}
                    {prog.visa_h1b && (
                      <Badge className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        H-1B Visa
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">IMG Residents</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {prog.img_residents}/{prog.program_size} ({Math.round(prog.img_percentage)}%)
                      </span>
                    </div>
                    <Progress value={prog.img_percentage} className="h-2" />
                  </div>

                  {prog.step2_score_min && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                        <div>
                          <span className="font-medium">Min Step 2 CK:</span> {prog.step2_score_min}
                        </div>
                        {prog.step2_score_avg && (
                          <div>
                            <span className="font-medium">Avg:</span> {prog.step2_score_avg}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={!!selectedProgram} onOpenChange={() => setSelectedProgram(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProgram?.program_name}</DialogTitle>
          </DialogHeader>

          {selectedProgram && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Institution</h4>
                <p className="text-slate-600 dark:text-slate-400">{selectedProgram.institution}</p>
                <p className="text-sm text-slate-500">
                  {selectedProgram.city}, {selectedProgram.state}
                </p>
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
                    <span className="text-slate-600 dark:text-slate-400">IMG Percentage:</span>
                    <span className="font-semibold">{Math.round(selectedProgram.img_percentage)}%</span>
                  </div>
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
                  {selectedProgram.visa_j1 && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      J-1 Visa
                    </Badge>
                  )}
                  {selectedProgram.visa_h1b && (
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      H-1B Visa
                    </Badge>
                  )}
                </div>
              </div>

              {(selectedProgram.step1_score_avg || selectedProgram.step2_score_avg) && (
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

              {selectedProgram.website && (
                <Button asChild className="w-full">
                  <a href={selectedProgram.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Program Website
                  </a>
                </Button>
              )}

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