import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Clock, 
  MessageSquare, 
  Star, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function MockInterviewVideoPlayer({ lesson, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(600); // 10 minutes (600s) default
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'critique'

  const timerRef = useRef(null);

  // Timed breakdown clips for mock interviews
  const timelineClips = lesson.id === 19 ? [
    { time: 0, title: '00:00 - Introduction & Surgical Ambition', type: 'opening', note: 'Applicant opens with high energy and introduces MBBS clinical research background.' },
    { time: 90, title: '01:30 - "Why Surgery?" Narrative', type: 'strength', note: 'Strong patient encounter anecdote demonstrating surgical dexterity and grit.' },
    { time: 240, title: '04:00 - Addressing Step 1 & YOG Gaps', type: 'improvement', note: 'Needs smoother transition when explaining 2-year clinical research gap.' },
    { time: 420, title: '07:00 - Trauma Case Vignette Handoff', type: 'strength', note: 'Exceptional communication during acute patient management scenario.' },
    { time: 540, title: '09:00 - Final Questions for Program Director', type: 'pd_tip', note: 'High-yield questions about operative volume and robotic surgery access.' }
  ] : [
    { time: 0, title: '00:00 - Opening Pitch & Professional Greeting', type: 'opening', note: 'Clear articulation, appropriate virtual lighting, and confident posture.' },
    { time: 100, title: '01:40 - STAR Method: Complex Ward Management', type: 'strength', note: 'Structured response highlighting ICU team collaboration and patient advocacy.' },
    { time: 270, title: '04:30 - Navigating Visa Status (J-1 vs H-1B)', type: 'pd_tip', note: 'Transparent explanation of ECFMG certification and Statement of Need timeline.' },
    { time: 450, title: '07:30 - Handling Weakness & Conflict Questions', type: 'improvement', note: 'Authentic self-reflection with clear growth action items.' },
    { time: 550, title: '09:10 - PD Scorecard & Final Feedback', type: 'summary', note: 'Program Director awards 4.8 / 5.0 for clinical clarity and interview fit.' }
  ];

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1 * playbackRate;
        });
      }, 1000 / playbackRate);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, playbackRate, duration]);

  const seekTo = (seconds) => {
    setCurrentTime(seconds);
    setIsPlaying(true);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeClip = [...timelineClips].reverse().find((clip) => currentTime >= clip.time) || timelineClips[0];

  return (
    <Card className="border-indigo-200 dark:border-indigo-800 shadow-xl overflow-hidden rounded-3xl">
      <CardHeader className="pb-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-indigo-500/30 text-indigo-300 border-indigo-400/30 text-xs">
              Interactive Mock Video
            </Badge>
            <span className="text-xs text-slate-400">{lesson.duration}</span>
          </div>
          <CardTitle className="text-lg font-bold">{lesson.title}</CardTitle>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-300 hover:text-white">
            Close
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-0 bg-slate-950">
        {/* Video Frame */}
        <div className="relative aspect-video bg-slate-900 flex flex-col items-center justify-center overflow-hidden border-b border-slate-800">
          {lesson.video_url || lesson.videoUrl ? (
            lesson.video_url?.includes('youtube') || lesson.videoUrl?.includes('youtube') ? (
              <iframe
                src={lesson.video_url || lesson.videoUrl}
                title={lesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={lesson.video_url || lesson.videoUrl}
                controls
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/80 via-slate-900 to-slate-950 opacity-90" />
              
              {/* Animated Waveform / Interactive Graphic Fallback */}
              <div className="relative z-10 text-center p-6 space-y-3">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Sparkles className="w-10 h-10 text-white animate-pulse" />
                  {isPlaying && (
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-30" />
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-white font-semibold text-base">
                    {lesson.title}
                  </h4>
                  <p className="text-indigo-300 text-xs max-w-md mx-auto line-clamp-2">
                    {activeClip ? activeClip.note : lesson.summary}
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs backdrop-blur-md">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
              </div>
            </>
          )}

          {/* Media Player Scrubber Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent space-y-2 z-20">
            <div 
              className="w-full h-2 bg-slate-800 rounded-full cursor-pointer overflow-hidden relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickPos = (e.clientX - rect.left) / rect.width;
                seekTo(clickPos * duration);
              }}
            >
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-8 h-8 rounded-full text-slate-300 hover:text-white"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>

                <span className="font-mono text-[11px] text-slate-300">
                  {formatTime(currentTime)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Speed:</span>
                {[1.0, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      playbackRate === rate
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timed Timeline & Faculty Critique Drawer */}
        <div className="p-4 bg-slate-900 space-y-3">
          <div className="flex gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'timeline'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Timed Timeline ({timelineClips.length} Clips)
            </button>
            <button
              onClick={() => setActiveTab('critique')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'critique'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Faculty Scorecard & Rubric
            </button>
          </div>

          {activeTab === 'timeline' ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {timelineClips.map((clip, idx) => {
                const isActive = activeClip.time === clip.time;
                return (
                  <div
                    key={idx}
                    onClick={() => seekTo(clip.time)}
                    className={`p-3 rounded-2xl border text-xs transition-all cursor-pointer flex items-start gap-3 ${
                      isActive
                        ? 'bg-indigo-950/80 border-indigo-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Clock className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{clip.title}</span>
                        {isActive && (
                          <Badge className="bg-indigo-500/20 text-indigo-300 text-[10px]">Active</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{clip.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3 p-3 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Faculty Rating</span>
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>4.8 / 5.0</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <h5 className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Key Strengths
                </h5>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  • Clear clinical communication using structured STAR method.<br />
                  • Concise answers avoiding rambling or reciting CV bullets.<br />
                  • Authentic enthusiasm for hospital patient population and specialty.
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <h5 className="font-semibold text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Areas to Refine
                </h5>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  • Ensure visa status (J-1/H-1B) explanations remain concise without over-explaining state laws.<br />
                  • Maintain eye contact with virtual camera lens during key story climaxes.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
