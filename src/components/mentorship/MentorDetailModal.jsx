import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Award,
  MapPin,
  Stethoscope,
  GraduationCap,
  CheckCircle2,
  Globe,
  MessageSquare,
  Video,
  Star,
  BookOpen,
} from 'lucide-react';

export default function MentorDetailModal({
  mentor,
  isOpen,
  onClose,
  onRequestMentorship,
  onStartVideoCall,
  hasPending,
  hasAccepted,
}) {
  if (!mentor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span>Mentor Profile</span>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              <Award className="w-3.5 h-3.5 mr-1 text-amber-500" />
              Verified FMG Mentor
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Header Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-5 text-white shadow-md">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16 border-2 border-white/40">
                <AvatarImage src={mentor.avatar_url} />
                <AvatarFallback className="bg-amber-500 text-white text-xl font-bold">
                  {mentor.display_name?.[0]?.toUpperCase() || 'M'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold truncate">{mentor.display_name}</h3>
                <p className="text-indigo-200 text-sm font-medium flex items-center gap-1.5 mt-0.5">
                  <Stethoscope className="w-4 h-4 text-indigo-300 flex-shrink-0" />
                  <span>{mentor.target_specialty}</span>
                </p>

                {mentor.matched_program && (
                  <p className="text-xs text-indigo-100/90 mt-1 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{mentor.matched_program}</span>
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  {(mentor.matched_city || mentor.matched_state) && (
                    <span className="inline-flex items-center text-xs bg-white/15 px-2.5 py-1 rounded-full text-white">
                      <MapPin className="w-3 h-3 mr-1" />
                      {mentor.matched_city ? `${mentor.matched_city}, ${mentor.matched_state || ''}` : mentor.matched_state}
                    </span>
                  )}
                  {mentor.visa_status && (
                    <span className="inline-flex items-center text-xs bg-white/15 px-2.5 py-1 rounded-full text-white">
                      {mentor.visa_status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Step 2 Score</p>
              <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {mentor.usmle_step2_score || 'Passed'}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">ECFMG</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Certified
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rating</p>
              <p className="text-base font-bold text-amber-500 mt-0.5 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                {mentor.rating || '5.0'}
              </p>
            </div>
          </div>

          {/* Bio & Education */}
          <div className="space-y-3 text-sm">
            {mentor.bio && (
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">About Mentor</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                  {mentor.bio}
                </p>
              </div>
            )}

            {mentor.medical_school && (
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <GraduationCap className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span>
                  <strong className="font-medium">Medical School:</strong> {mentor.medical_school} ({mentor.medical_school_country || 'International'})
                </span>
              </div>
            )}

            {mentor.languages && mentor.languages.length > 0 && (
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Globe className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span>
                  <strong className="font-medium">Languages:</strong> {mentor.languages.join(', ')}
                </span>
              </div>
            )}

            {mentor.guidance_topics && (
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  Areas of Expertise
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {mentor.guidance_topics.map((topic, i) => (
                    <Badge key={i} variant="outline" className="rounded-xl border-slate-200 dark:border-slate-700 text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {hasAccepted ? (
              <>
                <Button
                  onClick={() => {
                    onClose();
                    onStartVideoCall(mentor);
                  }}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Start Video Call
                </Button>
              </>
            ) : hasPending ? (
              <Button variant="outline" className="w-full rounded-2xl" disabled>
                Mentorship Request Pending
              </Button>
            ) : (
              <Button
                onClick={() => {
                  onClose();
                  onRequestMentorship(mentor);
                }}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium shadow-md"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Request Mentorship
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
