import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Globe,
  Mail,
  Filter,
  Beaker,
  ExternalLink
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

export default function ResearchOpportunities() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['researchOpportunities'],
    queryFn: () => base44.entities.ResearchOpportunity.filter({ status: 'open' })
  });

  const specialties = [...new Set(opportunities.map(o => o.specialty))];

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opp.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || opp.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const compensationColors = {
    unpaid: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    stipend: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header title="Research Opportunities" showBack showSearch={false} />

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Hero */}
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0">
              <Beaker className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Find Research Opportunities
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Connect with mentors offering research positions. Perfect for unmatched IMGs looking to strengthen their applications with publications and clinical research experience.
              </p>
            </div>
          </div>
        </Card>

        {/* Search & Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by title, institution, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedSpecialty === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedSpecialty('all')}
              className="rounded-full whitespace-nowrap"
              size="sm"
            >
              All Specialties
            </Button>
            {specialties.map(specialty => (
              <Button
                key={specialty}
                variant={selectedSpecialty === specialty ? 'default' : 'outline'}
                onClick={() => setSelectedSpecialty(specialty)}
                className="rounded-full whitespace-nowrap"
                size="sm"
              >
                {specialty}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {filteredOpportunities.length} opportunities found
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <Card className="p-12 text-center">
              <Beaker className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No opportunities found</p>
            </Card>
          ) : (
            filteredOpportunities.map((opp) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card 
                  className="p-5 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedOpportunity(opp)}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {opp.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {opp.institution}
                      </p>
                    </div>
                    <Badge className={compensationColors[opp.compensation]}>
                      {opp.compensation}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                    {opp.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {opp.specialty}
                    </Badge>
                    {opp.remote_allowed && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Remote OK
                      </Badge>
                    )}
                    {opp.tags?.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {opp.city}, {opp.state}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {opp.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {opp.positions_available} position{opp.positions_available > 1 ? 's' : ''}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={!!selectedOpportunity} onOpenChange={() => setSelectedOpportunity(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedOpportunity?.title}</DialogTitle>
          </DialogHeader>

          {selectedOpportunity && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Institution</h4>
                <p className="text-slate-600 dark:text-slate-400">{selectedOpportunity.institution}</p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  {selectedOpportunity.city}, {selectedOpportunity.state}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Description</h4>
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">
                  {selectedOpportunity.description}
                </p>
              </div>

              {selectedOpportunity.requirements?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Requirements</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                    {selectedOpportunity.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Duration</h4>
                  <p className="text-slate-600 dark:text-slate-400">{selectedOpportunity.duration}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Compensation</h4>
                  <Badge className={compensationColors[selectedOpportunity.compensation]}>
                    {selectedOpportunity.compensation}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Positions</h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedOpportunity.positions_available} available
                  </p>
                </div>
                {selectedOpportunity.application_deadline && (
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Deadline</h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {new Date(selectedOpportunity.application_deadline).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedOpportunity.contact_email && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Apply</h4>
                  <Button 
                    asChild
                    className="w-full"
                  >
                    <a href={`mailto:${selectedOpportunity.contact_email}?subject=Research Opportunity: ${selectedOpportunity.title}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Contact via Email
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}