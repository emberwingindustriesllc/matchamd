import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Star, 
  CheckCircle2, 
  AlertTriangle,
  Award
} from 'lucide-react';

export default function MockInterviewVideoPlayer({ lesson, onClose }) {
  const [activeClipTime, setActiveClipTime] = useState(0);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'critique'
  const iframeRef = useRef(null);

  // Timed breakdown clips mapped to lesson content
  const getTimelineClips = () => {
    if (lesson.id === 18) {
      return [
        { time: 0, title: '00:00 - Introduction & Candidate Opening', type: 'opening', note: 'Applicant delivers opening elevator pitch and summarizes clinical background.' },
        { time: 110, title: '01:50 - "Why Internal Medicine?" Narrative', type: 'strength', note: 'Connecting diagnostic problem solving with inpatient care passion.' },
        { time: 260, title: '04:20 - STAR Method: Complex Ward Management', type: 'strength', note: 'ICU handoff scenario demonstrating patient advocacy and multidisciplinary teamwork.' },
        { time: 440, title: '07:20 - Addressing Setbacks & Red Flags', type: 'improvement', note: 'Authentic self-reflection with tangible action steps for clinical growth.' },
        { time: 580, title: '09:40 - Asking High-Yield Questions to Interviewer', type: 'pd_tip', note: 'Mentorship, fellowship match pipelines, and program culture inquiries.' }
      ];
    }
    if (lesson.id === 19) {
      return [
        { time: 0, title: '00:00 - Opening & Surgical Commitment', type: 'opening', note: 'Candidate presents surgical career goals, OR endurance, and background.' },
        { time: 105, title: '01:45 - "Why General Surgery?" Narrative', type: 'strength', note: 'Pivotal patient encounter demonstrating dexterity, composure, and grit.' },
        { time: 250, title: '04:10 - Trauma & Acute Abdomen Case Vignette', type: 'strength', note: 'Structured ABCDE resuscitation and clear communication during acute triage.' },
        { time: 430, title: '07:10 - Handling Intraoperative Complications & M&M', type: 'improvement', note: 'Root-cause analysis, transparent disclosure, and emotional resilience.' },
        { time: 570, title: '09:30 - Final Questions for the Surgical Chair', type: 'pd_tip', note: 'Operative case volumes, robotic training, and preliminary-to-categorical transition.' }
      ];
    }
    if (lesson.id === 7) {
      return [
        { time: 0, title: '00:00 - Overview of Specialty Decision', type: 'opening', note: 'Foundational principles of medical specialty selection.' },
        { time: 240, title: '04:00 - "Why This Specialty?" Direct Framework', type: 'strength', note: 'The exact framework to articulate deep clinical passion without clichés.' }
      ];
    }
    if (lesson.id === 8) {
      return [
        { time: 0, title: '00:00 - Behavioral Foundations', type: 'opening', note: 'How programs evaluate applicant vulnerability and maturity.' },
        { time: 648, title: '10:48 - Handling Weakness & Red Flag Questions', type: 'strength', note: 'Proven formulas for discussing genuine non-fatal weaknesses and growth metrics.' }
      ];
    }
    return [
      { time: 0, title: '00:00 - Lesson Introduction', type: 'opening', note: lesson.summary || 'Key principles and high-yield interview frameworks.' }
    ];
  };

  const timelineClips = getTimelineClips();

  // Ensure iframe src has enablejsapi=1 so postMessage seeking works cleanly
  const getVideoSrc = () => {
    let src = lesson.video_url || lesson.videoUrl || '';
    if (!src) return '';
    if (src.includes('youtube.com/embed/')) {
      const separator = src.includes('?') ? '&' : '?';
      if (!src.includes('enablejsapi=1')) {
        src += `${separator}enablejsapi=1&rel=0`;
      }
    }
    return src;
  };

  const seekTo = (seconds) => {
    setActiveClipTime(seconds);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [seconds, true]
        }),
        '*'
      );
      // Also send playVideo command to ensure playback begins immediately
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'playVideo',
          args: []
        }),
        '*'
      );
    }
  };

  return (
    <Card className="border-indigo-200 dark:border-indigo-800 shadow-xl overflow-hidden rounded-3xl">
      <CardHeader className="py-3 px-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-row items-center justify-between">
        <div className="flex-1 min-w-0 mr-3">
          <div className="flex items-center gap-2 mb-0.5">
            <Badge className="bg-indigo-500/30 text-indigo-300 border-indigo-400/30 text-[11px] px-2 py-0.5">
              {lesson.id === 18 || lesson.id === 19 ? 'Interactive Mock Interview' : 'Curated Video Masterclass'}
            </Badge>
            <span className="text-xs text-slate-300">{lesson.duration}</span>
          </div>
          <CardTitle className="text-base font-bold truncate">{lesson.title}</CardTitle>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-300 hover:text-white text-xs h-8">
            Close
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-0 bg-slate-950">
        {/* Responsive Video Container with Native YouTube Controls */}
        <div className="relative aspect-video bg-black flex flex-col items-center justify-center overflow-hidden">
          {getVideoSrc() ? (
            <iframe
              ref={iframeRef}
              src={getVideoSrc()}
              title={lesson.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="text-center p-6 text-slate-400 text-sm">
              No video available for this lesson.
            </div>
          )}
        </div>

        {/* Timed Timeline & Faculty Critique Drawer */}
        {(lesson.id === 18 || lesson.id === 19 || timelineClips.length > 1) && (
          <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'timeline'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Interactive Timeline ({timelineClips.length} Chapters)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('critique')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'critique'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Faculty Scorecard & Rubric
                </button>
              </div>
              <span className="text-[11px] text-indigo-400 hidden sm:inline">
                Click chapter to jump video
              </span>
            </div>

            {activeTab === 'timeline' ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {timelineClips.map((clip, idx) => {
                  const isActive = activeClipTime === clip.time;
                  return (
                    <div
                      key={idx}
                      onClick={() => seekTo(clip.time)}
                      className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2.5 hover:scale-[1.01] ${
                        isActive
                          ? 'bg-indigo-950/90 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <Play className="w-3 h-3 fill-current" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-xs">{clip.title}</span>
                          {isActive && (
                            <Badge className="bg-indigo-500/30 text-indigo-300 text-[10px] py-0 px-1.5 border-indigo-400/40">Active</Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{clip.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 p-3 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-200 font-semibold">Faculty Committee Evaluation</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>4.8 / 5.0</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-semibold text-emerald-400 flex items-center gap-1 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> High-Yield Candidate Strengths
                  </h5>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    • Structured responses using STAR method (Situation, Task, Action, Result) kept clinical cases focused.<br />
                    • Answer duration stayed strictly between 90 and 120 seconds, avoiding rambling.<br />
                    • Demonstrated genuine clinical humility, collegiality, and patient safety prioritization.
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <h5 className="font-semibold text-amber-400 flex items-center gap-1 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" /> High-Yield Growth Areas
                  </h5>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    • Keep visa (J-1/H-1B) explanations straightforward: confirm ECFMG certification and Step 3 readiness without reciting state medical board statutes.<br />
                    • Maintain consistent direct eye contact with the camera lens during opening and closing statements.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
