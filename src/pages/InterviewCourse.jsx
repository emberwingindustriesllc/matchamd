import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import logo from '@/assets/logo.png';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Video,
  CheckCircle2,
  PlayCircle,
  Play,
  Lightbulb,
  FileText,
  Star,
  X,
  Eye,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumGate from '@/components/premium/PremiumGate';
import { toast } from 'sonner';

const courseModules = [
  {
    id: 1,
    title: 'Interview Fundamentals',
    lessons: [
      { id: 1, title: 'What Program Directors Look For', duration: '8 min', completed: true, summary: 'Learn the core criteria US program directors evaluate: clinical competence, communication skills, professionalism, and team fit.' },
      { id: 2, title: 'Virtual vs In-Person Interviews', duration: '6 min', completed: false, summary: 'Master lighting, camera setup, eye contact, and platform troubleshooting for virtual residency interviews.' },
      { id: 3, title: 'First Impressions & Body Language', duration: '10 min', completed: false, summary: 'Key posture tips, confident vocal tone, and engaging storytelling techniques.' },
      { id: 4, title: 'Structuring Your Answers (STAR Method)', duration: '12 min', completed: false, summary: 'Situation, Task, Action, Result framework tailored for medical clinical vignettes.' }
    ]
  },
  {
    id: 2,
    title: 'Common Interview Questions',
    lessons: [
      { id: 5, title: '"Tell Me About Yourself" - Perfect Answer', duration: '15 min', completed: false, summary: 'Crafting a 2-minute elevated pitch connecting your medical background to your residency goals.' },
      { id: 6, title: '"Why Our Program?" Research Strategies', duration: '10 min', completed: false, summary: 'How to analyze hospital patient volume, fellowship matches, and faculty research.' },
      { id: 7, title: '"Why This Specialty?" Compelling Narratives', duration: '12 min', completed: false, summary: 'Articulating passion through patient encounters and rotation highlights.' },
      { id: 8, title: 'Handling Weakness Questions', duration: '10 min', completed: false, summary: 'Authentic self-reflection paired with tangible action steps for improvement.' },
      { id: 9, title: 'Discussing Gap Years & Challenges', duration: '14 min', completed: false, summary: 'Framing clinical gaps or visa hurdles into stories of resilience and dedication.' }
    ]
  },
  {
    id: 3,
    title: 'IMG-Specific Challenges',
    lessons: [
      { id: 10, title: 'Addressing Visa Status Confidently', duration: '8 min', completed: false, summary: 'Clear explanations of J-1 vs H-1B requirements and state licensing.' },
      { id: 11, title: 'Explaining Multiple Step Attempts', duration: '10 min', completed: false, summary: 'Addressing exam setbacks proactively with proven growth metrics.' },
      { id: 12, title: 'Showcasing International Experience', duration: '9 min', completed: false, summary: 'Translating global healthcare insights into unique clinical strengths.' },
      { id: 13, title: 'Cultural Differences & Communication', duration: '11 min', completed: false, summary: 'Navigating US medical hierarchy, patient autonomy, and interprofessional teams.' }
    ]
  },
  {
    id: 4,
    title: 'Advanced Techniques',
    lessons: [
      { id: 14, title: 'Asking Smart Questions to Interviewers', duration: '12 min', completed: false, summary: 'High-yield questions that demonstrate deep interest and clinical ambition.' },
      { id: 15, title: 'Reading the Room & Adapting', duration: '10 min', completed: false, summary: 'Adjusting tone based on interviewer style—academic vs clinical focus.' },
      { id: 16, title: 'Ranking Programs After Interviews', duration: '15 min', completed: false, summary: 'Objective scoring matrices for gut feeling, geography, and career trajectory.' },
      { id: 17, title: 'Thank You Notes That Stand Out', duration: '8 min', completed: false, summary: 'Timing, personalized references, and post-interview communication etiquette.' }
    ]
  },
  {
    id: 5,
    title: 'Mock Interviews & Practice',
    lessons: [
      { id: 18, title: 'Full Mock Interview #1 - Internal Medicine', duration: '25 min', completed: false, summary: 'Watch a real IMG participate in a 25-minute mock interview with detailed faculty critique.' },
      { id: 19, title: 'Full Mock Interview #2 - Surgery', duration: '22 min', completed: false, summary: 'Surgical subspecialty mock interview breakdown and scoring.' },
      { id: 20, title: 'Analyzing Your Performance', duration: '10 min', completed: false, summary: 'Self-video analysis checklist for final interview week preparation.' }
    ]
  }
];

const lessonDetails = {
  1: {
    takeaways: [
      'Screening Metrics: High Step 2 CK score gets your application past initial filters.',
      'Clinical Competence: LORs from US attending surgeons or physicians prove real ward readiness.',
      'Communication: Fluency and clear articulation ensure patient safety during handoffs.',
      'Culture Fit: Program directors want residents who are hardworking, humble, and collegial.'
    ],
    details: 'Program directors evaluate applicants across 4 primary pillars: Clinical Excellence, Communication Fluency, Team Leadership, and Authentic Mission Alignment. When interviewing, avoid reciting your CV. Instead, highlight how your specific clinical encounters demonstrate resilience, patient advocacy, and team collaboration.',
    practicePrompt: 'Draft your core pitch explaining why you are clinically prepared to excel in a US residency program:'
  },
  2: {
    takeaways: [
      'Framing: Eye-level camera angle with head and shoulders centered.',
      'Lighting: Soft front illumination; avoid bright windows or harsh overhead shadows.',
      'Audio Quality: Dedicated microphone or headset eliminates room echo and ambient noise.',
      'Emergency Backup: Have phone hotspot ready and interviewer phone numbers saved.'
    ],
    details: 'Virtual interviews are now the standard for residency selection. Technical professionalism reflects clinical thoroughness. Set up your room 30 minutes before your first interview, test your microphone and webcam, and ensure your background is clean and clutter-free.',
    practicePrompt: 'List your virtual interview technology checklist and backup connectivity plan:'
  },
  3: {
    takeaways: [
      'Camera Lens Eye Contact: Look directly at the camera lens while speaking, not down at screen tiles.',
      'Active Listening: Nod and smile naturally while faculty or chief residents speak.',
      'Vocal Pace: Maintain a measured tone (130-150 words per minute) to project confidence.',
      'Postural Stamina: Sit upright with shoulders back throughout multi-hour interview sessions.'
    ],
    details: 'First impressions are established within the first 30 seconds of an interview call. Non-verbal signals—including eye contact, facial expressions, and vocal cadence—convey confidence and warmth before you even complete your opening sentence.',
    practicePrompt: 'Write down key posture and vocal cues you will practice before interview day:'
  },
  4: {
    takeaways: [
      'Situation (15%): Briefly describe patient context, clinical setting, or team challenge.',
      'Task (15%): Define your specific role or clinical objective.',
      'Action (50%): Detail your personal clinical interventions and decision-making.',
      'Result (20%): State clinical outcome, patient resolution, and what you learned.'
    ],
    details: 'The STAR method (Situation, Task, Action, Result) is the industry standard for answering behavioral interview questions. Devote at least 50% of your response time to the ACTION step—explaining what YOU specifically did and thought.',
    practicePrompt: 'Structure a recent clinical conflict or patient dilemma using the STAR framework (Situation, Task, Action, Result):'
  },
  5: {
    takeaways: [
      'Length: Exactly 90 to 120 seconds.',
      'Structure: Present (current status/USCE) -> Past (medical origin & key achievement) -> Future (residency goals).',
      'Avoid: Re-listing USMLE scores or reciting your entire high school timeline.'
    ],
    details: '"Tell me about yourself" is almost always the opening question. Craft an engaging narrative that connects your clinical background, personal motivation, and future goals as an internal medicine or surgical resident.',
    practicePrompt: 'Draft your 90-120 second "Tell Me About Yourself" elevator pitch:'
  },
  6: {
    takeaways: [
      'Analyze resident roster: Check where current residents graduated and fellowship match results.',
      'Faculty research alignment: Identify 2-3 faculty members whose clinical interests match yours.',
      'Specific clinical tracks: Mention unique program tracks (e.g. global health, hospitalist, ultrasound).'
    ],
    details: 'Generic answers like "Your program has great clinical training" signal lack of research. Show program directors that you investigated their specific rotation sites, fellowship pipelines, and community outreach projects.',
    practicePrompt: 'Write 3 specific reasons why your target program is your top choice:'
  },
  7: {
    takeaways: [
      'Pivotal Patient Case: Describe a memorable patient encounter that sealed your commitment.',
      'Long-Term Vision: Connect clinical passion with long-term specialty career goals.',
      'Specialty Attributes: Highlight why your skill set fits the specialty demands.'
    ],
    details: 'Articulate why you chose your specialty beyond generic phrases like "I love helping people". Explain the diagnostic intellectual rigor or procedural satisfaction that drives your dedication.',
    practicePrompt: 'Draft your "Why This Specialty" compelling narrative paragraph:'
  },
  8: {
    takeaways: [
      'Select a Real, Non-Fatal Weakness: Avoid fake weaknesses like "I work too hard".',
      'Show Action Metrics: Explain the concrete system or habit you developed to fix it.',
      'Demonstrate Growth: Show how your self-correction improved patient care.'
    ],
    details: 'Handling weakness questions requires genuine self-awareness paired with proactive improvement strategies. Focus on professional skills you have actively worked to refine.',
    practicePrompt: 'Write down a genuine weakness and the exact steps you took to overcome it:'
  },
  9: {
    takeaways: [
      'Frame Gaps Positively: Emphasize continuous learning, research, or clinical observerships.',
      'Show Dedication: Detail any volunteer work, USCE, or advanced certifications obtained.',
      'Maintain Transparency: Address timeline questions directly with calm confidence.'
    ],
    details: 'Clinical gaps or extended timelines are common for IMGs. Program directors want to see how you utilized gap years to grow clinically, academically, or personally.',
    practicePrompt: 'Summarize your gap year activities and key clinical/academic accomplishments:'
  },
  10: {
    takeaways: [
      'State Visa Requirements Clearly: Know whether you need J-1 (ECFMG sponsored) or H-1B.',
      'Step 3 Advantage: Passing Step 3 makes you eligible for H-1B sponsorship at participating programs.',
      'State Licensing Awareness: Understand state medical board eligibility rules.'
    ],
    details: 'Be knowledgeable and straightforward regarding your visa status. Demonstrating clarity on ECFMG certification timelines and visa requirements reassures program leadership.',
    practicePrompt: 'Write your 30-second confident response regarding your visa status and licensing readiness:'
  },
  11: {
    takeaways: [
      'Own the Result: Take immediate responsibility without blaming circumstances.',
      'Detail Your Study Overhaul: Explain how you changed study techniques (e.g. UWorld + Anki).',
      'Highlight Subsequent Success: Show high Step 2 CK or Step 3 scores as proof of growth.'
    ],
    details: 'If you have exam setbacks, program directors evaluate your resilience and capacity for self-correction. Focus on how the experience transformed your clinical knowledge base.',
    practicePrompt: 'Draft your explanation for exam attempts, highlighting your study overhaul and score rebound:'
  },
  12: {
    takeaways: [
      'Clinical Autonomy: Detail high patient volume and hands-on diagnostic experience abroad.',
      'Resourcefulness: Explain how training in diverse settings honed clinical decision-making.',
      'Cultural Empathy: Highlight ability to care for patients from diverse international backgrounds.'
    ],
    details: 'Your international medical training is a significant asset. Showcase your adaptability, clinical autonomy, and experience caring for complex, diverse patient populations.',
    practicePrompt: 'Write 3 unique strengths your international clinical background brings to a US hospital:'
  },
  13: {
    takeaways: [
      'US Medical Hierarchy: Understand interprofessional roles (nurses, pharmacists, social workers).',
      'Patient Autonomy: Respect patient-centered care models and shared decision-making.',
      'Clear Communication: Practice direct, structured clinical sign-outs and team updates.'
    ],
    details: 'Navigating US healthcare culture requires adapting to patient autonomy, collaborative interprofessional teams, and open communication with attendings and nurses.',
    practicePrompt: 'Note key communication strategies you use to build trust with US interprofessional teams:'
  },
  14: {
    takeaways: [
      'Ask Deep, High-Yield Questions: Focus on mentorship, fellowship matches, and program growth.',
      'Avoid Basic Admin Questions: Don\'t ask about salary or vacation days found on website.',
      'Tailor Questions to Interviewer: Ask PDs about program vision, ask residents about daily life.'
    ],
    details: 'The questions you ask at the end of an interview demonstrate your intellect and genuine interest. Prepare thoughtful questions tailored separately for faculty vs current residents.',
    practicePrompt: 'List 5 high-yield questions you will ask Program Directors during your interviews:'
  },
  15: {
    takeaways: [
      'Identify Interviewer Style: Academic/research focused vs community/clinical focused.',
      'Match Energy Level: Adapt cadence while remaining professional and respectful.',
      'Handle Unexpected Questions: Pause gracefully, collect thoughts, and answer structured.'
    ],
    details: 'Successful candidates adapt to different interviewer personalities. Learn to read conversational cues and pivot your responses to match faculty interests.',
    practicePrompt: 'Write down strategies for staying calm and composed during unexpected interview questions:'
  },
  16: {
    takeaways: [
      'Objective Scoring Matrix: Rate programs on clinical training, fellowship pipeline, location, and culture.',
      'Trust Your Gut Feeling: Reflect on how welcome and supported you felt on interview day.',
      'Submit ROL on Time: Double check NRMP submission deadlines.'
    ],
    details: 'Ranking programs after interview season requires balancing career goals, clinical environment, geography, and resident happiness. Create an objective scoring matrix.',
    practicePrompt: 'List your top 5 ranking criteria for creating your NRMP Rank Order List:'
  },
  17: {
    takeaways: [
      'Timing: Send within 24 to 48 hours of interview.',
      'Personalization: Reference a specific clinical discussion or shared topic from your conversation.',
      'Brevity: Keep thank-you notes concise (2-3 paragraphs maximum).'
    ],
    details: 'A personalized thank-you note reinforces your professionalism and positive impression. Ensure each note is tailored to the specific interviewer.',
    practicePrompt: 'Draft a template thank-you note for a Program Director following an interview:'
  },
  18: {
    takeaways: [
      'Full Internal Medicine Mock Case Breakdown: Watch real candidate performance.',
      'Faculty Critique: Detailed feedback on answer timing, STAR structure, and tone.',
      'Common IM Questions: In-depth analysis of inpatient floor management responses.'
    ],
    details: 'Review this full 25-minute mock interview for Internal Medicine. Study the candidate\'s delivery, faculty critiques, and strategic model responses.',
    practicePrompt: 'Take notes on candidate strengths and areas for improvement from Mock Interview #1:'
  },
  19: {
    takeaways: [
      'Full Surgery Mock Case Breakdown: General surgery applicant interview breakdown.',
      'OR & Trauma Questions: Review intraoperative conflict and surgical M&M scenario answers.',
      'Faculty Scoring: Evaluation of confidence, surgical passion, and stamina.'
    ],
    details: 'Review this 22-minute mock interview for General Surgery. Observe how the applicant handles high-intensity surgical questions and faculty probing.',
    practicePrompt: 'Take notes on surgical answer formatting and faculty scoring from Mock Interview #2:'
  },
  20: {
    takeaways: [
      'Self-Video Recording Checklist: Record yourself answering 5 core questions on webcam.',
      'Review Metrics: Check fill-words ("um", "like"), eye contact, facial expressions, and pacing.',
      'Final Week Protocol: Mock practice with peers and mentors 3 days before interview day.'
    ],
    details: 'Self-video analysis is the fastest way to eliminate filler words, improve eye contact, and refine your delivery before your official interview dates.',
    practicePrompt: 'List 3 specific speech or delivery habits you want to monitor in your self-recordings:'
  }
};

export default function InterviewCourse() {
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeResource, setActiveResource] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewingDocContent, setViewingDocContent] = useState(null);
  const [lessonTab, setLessonTab] = useState('overview'); // 'overview' | 'takeaways' | 'practice'
  const [practiceNote, setPracticeNote] = useState('');

  const handleOpenLesson = (lesson) => {
    setActiveLesson(lesson);
    setIsPlaying(false);
    setLessonTab('overview');
    try {
      const saved = localStorage.getItem(`matchamd_lesson_note_${lesson.id}`) || '';
      setPracticeNote(saved);
    } catch (e) {
      setPracticeNote('');
    }
  };

  const handleSaveLessonNote = (lessonId) => {
    try {
      localStorage.setItem(`matchamd_lesson_note_${lessonId}`, practiceNote);
      toast.success('Practice response saved!');
    } catch (e) {
      toast.error('Failed to save response');
    }
  };

  const handleDownloadLessonHandout = (lesson) => {
    const detail = lessonDetails[lesson.id] || {};
    const content = `=====================================================
MATCHA MD INTERVIEW LESSON #${lesson.id}: ${lesson.title.toUpperCase()}
=====================================================
Duration: ${lesson.duration}

1. LESSON OVERVIEW & SUMMARY
-----------------------------------------------------
${lesson.summary}

${detail.details || ''}

2. KEY TAKEAWAYS & FRAMEWORKS
-----------------------------------------------------
${(detail.takeaways || []).map(t => '* ' + t).join('\n')}

3. PRACTICE PROMPT & ACTION STEPS
-----------------------------------------------------
${detail.practicePrompt || 'Practice your answer out loud and record yourself on webcam.'}
`;

    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MatchaMD_Lesson_${lesson.id}_${lesson.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded Handout for Lesson #${lesson.id}!`);
    } catch (e) {
      toast.error('Failed to download handout');
    }
  };

  const { user } = useAuth();

  const { data: purchases = [] } = useQuery({
    queryKey: ['purchases', user?.id],
    queryFn: async () => {
      let dbPurchases = [];
      if (user?.id) {
        try {
          const { data } = await supabase.from('purchased_content').select('*').eq('user_id', user?.id);
          if (data) dbPurchases = data;
        } catch (e) {
          console.warn('Failed to fetch from DB', e);
        }
      }
      let localPurchases = [];
      try {
        localPurchases = JSON.parse(localStorage.getItem('matchamd_purchased_content') || '[]');
      } catch (e) {}
      return [...dbPurchases, ...localPurchases];
    }
  });

  const hasPurchased = purchases.some(p => p.content_id === 'interview_premium');

  const totalLessons = courseModules.reduce((acc, module) => acc + module.lessons.length, 0);
  const completedLessons = 1;

  if (!hasPurchased) {
    return (
      <PremiumGate
        title="Interview Mastery Course"
        description="20+ comprehensive video lessons to ace your residency interviews"
        price={9.99}
        features={[
          '20+ video lessons (4+ hours)',
          'IMG-specific interview strategies',
          'Full mock interviews with analysis',
          'Practice questions for every scenario',
          'Downloadable cheat sheets & templates'
        ]}
        contentId="interview_premium"
      />
    );
  }

  const handleDownloadResource = (title) => {
    let content = '';
    let filename = 'MatchaMD_Resource.txt';

    if (title.includes('Cheat Sheet')) {
      filename = 'MatchaMD_Residency_Interview_Cheat_Sheet.txt';
      content = `=====================================================
MATCHA MD - RESIDENCY INTERVIEW DAY CHEAT SHEET
=====================================================

1. MORNING ROUTINE CHECKLIST
-----------------------------------------------------
[ ] Test webcam angle (lens at eye level, not looking up).
[ ] Double check lighting (soft front light, avoid bright windows behind).
[ ] Verify internet speeds (wired ethernet preferred, close background downloads).
[ ] Mute phone notifications & set to Do Not Disturb.
[ ] Keep a glass of water, pen, and blank notebook nearby.
[ ] Professional attire (full suit/jacket, plain background).
[ ] Have 3 specific faculty research notes prepared per interviewer.

2. HIGH-YIELD DELIVERY TIPS
-----------------------------------------------------
* Time Rules: Keep answers strictly between 90 and 120 seconds.
* Eye Contact: Look directly at the webcam lens, NOT at the screen image.
* Non-Verbal Cues: Smile naturally, nod while the interviewer speaks, maintain upright posture.
* STAR Method Framework:
  - Situation (15%): Set the clinical context concisely.
  - Task (15%): Define your clear responsibility.
  - Action (50%): Explain your exact steps and clinical reasoning.
  - Result (20%): Highlight positive outcomes, patient safety, and personal growth.

3. TOP 15 QUESTIONS TO ASK PROGRAM DIRECTORS & CHIEFS
-----------------------------------------------------
1. "How does the program support residents seeking competitive fellowship placements?"
2. "What pathways or structured tracks (e.g. global health, hospitalist, research) are available?"
3. "How has faculty mentorship evolved over the last 2-3 years based on resident feedback?"
4. "What subspecialty rotations or elective options are offered during PGY-2/PGY-3 years?"
5. "How does the program manage workload and resident wellness during busy ICU/floor months?"
6. "What percentage of graduates pass their board certification exams on the first attempt?"
7. "Are there dedicated research coordinators or biostatistician support for resident publications?"
8. "How are patient care handoffs structured between night float and day teams?"
9. "What opportunities exist for residents to participate in hospital safety committees?"
10. "Can you tell me about recent graduate placements in academic vs community practice?"
11. "How does the program foster camaraderie and team support among international medical graduates?"
12. "What changes or expansions is the leadership planning for the upcoming academic year?"
13. "How is feedback communicated between faculty and residents after clinical rotations?"
14. "What role do senior residents play in teaching junior medical students?"
15. "What qualities do residents who excel in your program typically possess?"

4. POST-INTERVIEW THANK YOU ETIQUETTE
-----------------------------------------------------
* Send individual personalized emails within 24-48 hours.
* Reference one specific conversation topic or shared interest discussed in your interview.
* Reiterate your strong alignment with the program's clinical mission.
`;
    } else {
      filename = 'MatchaMD_50_Residency_Interview_Question_Bank.txt';
      content = `=====================================================
MATCHA MD - 50+ RESIDENCY INTERVIEW QUESTION BANK & STRATEGIES
=====================================================

CATEGORY 1: BEHAVIORAL QUESTIONS (STAR METHOD)
-----------------------------------------------------
Q1: "Tell me about a time you had a conflict with a team member."
Strategy: Focus on patient safety, active listening, and collaborative resolution.
Situation: Disagreed with a nurse on timing of a post-op dressing change.
Task: Needed dressing done before morning rounds, but ward was short-staffed.
Action: Spoke privately, acknowledged her constraints, and assisted with setup to save time.
Result: Dressing changed cleanly, rounds proceeded on time, and built mutual respect.

Q2: "Describe a clinical mistake you made and what you learned."
Strategy: Take full responsibility, state immediate correction, outline systemic prevention.

Q3: "Tell me about a difficult patient encounter and how you resolved it."
Strategy: Highlight empathy, de-escalation techniques, and non-judgmental care.

Q4: "Give an example of when you went above and beyond for a patient."
Strategy: Show patient advocacy, compassion, and professional boundaries.

Q5: "Describe a situation where you had to work under extreme time pressure."
Strategy: Prioritization, rapid triage, clear communication under stress.

[Q6 - Q12: Teamwork, Leadership, Delegating, Ethical Dilemmas, Stress Management, Multi-tasking, Feedback implementation]

CATEGORY 2: IMG-SPECIFIC QUESTIONS
-----------------------------------------------------
Q13: "Why do you want to train in the United States?"
Strategy: Highlight standardized clinical training, structured mentorship, and evidence-based practice.

Q14: "What visa status do you require, and are you familiar with state licensing rules?"
Strategy: Be concise, clear, and confident regarding J-1 / H-1B requirements.

Q15: "How will you adapt to the US healthcare system hierarchy and EMR systems?"
Strategy: Detail USCE rotations, hands-on Epic/Cerner experience, and interprofessional teamwork.

Q16: "Can you explain any gaps in your CV or graduation timeline?"
Strategy: Frame gaps with active clinical observerships, USMLE study, research, or volunteer service.

Q17: "How has your international medical training prepared you for US residency?"
Strategy: Emphasize clinical autonomy, adaptability in diverse resource settings, and cultural competence.

[Q18 - Q25: Step score attempt explanations, YOG explanation, LOR context, USCE highlights, patient diversity]

CATEGORY 3: SPECIALTY-SPECIFIC QUESTIONS
-----------------------------------------------------
Q26: "Why did you choose Internal Medicine / Surgery / Pediatrics / Psychiatry?"
Strategy: Connect specific clinical encounters, diagnostic mystery solving, and career vision.

Q27: "What subspecialty or fellowship are you planning to pursue?"
Strategy: Show passion while expressing open-mindedness to general specialty foundations.

Q28: "How do you handle high mortality or emotionally heavy cases in this specialty?"
Strategy: Emotional resilience, debriefing with seniors, self-care routines.

[Q29 - Q38: Specialty procedures, subspecialty goals, academic vs community focus, call schedules, research interest]

CATEGORY 4: CLINICAL SCENARIOS & M&M
-----------------------------------------------------
Q39: "What would you do if an attending physician gave an order you believed was incorrect?"
Strategy: Verify patient safety first, double-check order, speak respectfully and privately with attending.

Q40: "How do you break bad news to a patient's family?"
Strategy: SPIKES protocol (Setting, Perception, Invitation, Knowledge, Empathy, Strategy).

[Q41 - Q45: Sign-out handoffs, impaired colleague, patient refusal of treatment, sign-out errors, order prioritization]

CATEGORY 5: TRICKY & HIGH-YIELD QUESTIONS
-----------------------------------------------------
Q46: "What is your biggest weakness?"
Strategy: Authentic non-fatal weakness paired with active self-improvement metrics.

Q47: "Why should we choose you over other qualified applicants?"
Strategy: Unique combination of clinical work ethic, resilience, adaptability, and culture fit.

Q48: "What other programs have you interviewed at?"
Strategy: Maintain privacy politely, affirm interest in programs matching geographic/clinical goals.

Q49: "Where do you see yourself in 5 to 10 years?"
Strategy: Board certified consultant, active clinical educator, research/community leadership.

Q50: "Tell me about yourself (2-minute elevator pitch)."
Strategy: Present (current role/USCE), Past (med school & key achievement), Future (residency vision).
`;
    }

    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${filename}!`);
    } catch (e) {
      toast.error('Failed to download file');
    }
  };

  const getDocMarkup = (title) => {
    if (title.includes('Bank')) {
      return (
        <div className="space-y-4 text-left text-slate-700 dark:text-slate-300 text-sm">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white border-b pb-1 mb-2">1. Behavioral Questions (STAR Method)</h4>
            <p className="font-semibold text-slate-800 dark:text-slate-200">Q1: "Tell me about a time you had a conflict with a team member."</p>
            <p className="italic text-xs text-slate-500 mb-1">Strategy: Focus on patient safety, active listening, and collaborative resolution.</p>
            <ul className="list-disc pl-5 space-y-1 text-xs mb-3">
              <li><strong>Situation:</strong> "During my surgery rotation, a nurse and I disagreed on the timing of a sterile dressing change."</li>
              <li><strong>Task:</strong> "I needed the dressing changed before morning rounds, but the ward was understaffed."</li>
              <li><strong>Action:</strong> "I discussed her constraints privately and offered to assist with the setup to save time."</li>
              <li><strong>Result:</strong> "The dressing was replaced cleanly, rounds proceeded on time, and we built strong mutual respect."</li>
            </ul>

            <p className="font-semibold text-slate-800 dark:text-slate-200">Q2: "Tell me about a clinical mistake you made."</p>
            <p className="italic text-xs text-slate-500 mb-2">Strategy: Take immediate responsibility, explain the correction, and outline what you learned.</p>

            <p className="font-semibold text-slate-800 dark:text-slate-200">Q3: "Describe a difficult patient encounter and how you resolved it."</p>
            <p className="italic text-xs text-slate-500 mb-2">Strategy: De-escalation, empathetic listening, and team safety.</p>
          </div>

          <div className="mt-4">
            <h4 className="font-bold text-slate-900 dark:text-white border-b pb-1 mb-2">2. IMG-Specific Questions</h4>
            <p className="font-semibold text-slate-800 dark:text-slate-200">Q13: "Why do you want to train in the United States?"</p>
            <p className="italic text-xs text-slate-500 mb-2">Strategy: Emphasize standardized training, structured clinical mentorship, and research opportunities.</p>

            <p className="font-semibold text-slate-800 dark:text-slate-200">Q14: "How will you handle state licensing and visa requirements?"</p>
            <p className="italic text-xs text-slate-500 mb-2">Strategy: Be clear, knowledgeable, and prepared regarding J-1 / H-1B documents.</p>
          </div>

          <div className="mt-4">
            <h4 className="font-bold text-slate-900 dark:text-white border-b pb-1 mb-2">3. Tricky & High-Yield Questions</h4>
            <p className="font-semibold text-slate-800 dark:text-slate-200">Q46: "What is your biggest weakness?"</p>
            <p className="italic text-xs text-slate-500 mb-2">Strategy: Share an authentic non-fatal weakness with concrete action metrics for improvement.</p>

            <p className="font-semibold text-slate-800 dark:text-slate-200">Q50: "Tell me about yourself."</p>
            <p className="italic text-xs text-slate-500 mb-1">Strategy: Present (USCE & current role), Past (med school achievement), Future (residency goals).</p>
          </div>

          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold text-center mt-3">
            Click "Download File" below to download the complete 50+ Question Bank text document!
          </p>
        </div>
      );
    } else {
      return (
        <div className="space-y-4 text-left text-slate-700 dark:text-slate-300 text-sm">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white border-b pb-1 mb-2">1. Morning Routine Checklist</h4>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>[ ] Test webcam angle (lens at eye level, not looking up).</li>
              <li>[ ] Double check lighting (soft front light, avoid bright windows behind).</li>
              <li>[ ] Verify internet speeds (wired ethernet preferred, mute phone).</li>
              <li>[ ] Keep a glass of water, pen, and notebook nearby.</li>
              <li>[ ] Professional attire (full business suit, plain backdrop).</li>
            </ul>
          </div>

          <div className="mt-4">
            <h4 className="font-bold text-slate-900 dark:text-white border-b pb-1 mb-2">2. High-Yield Delivery Tips</h4>
            <p className="text-xs leading-relaxed">
              Keep answers strictly between 90 and 120 seconds. Maintain direct eye contact with the camera lens. Nod actively while the interviewer is speaking. Use the STAR method for behavioral questions.
            </p>
          </div>

          <div className="mt-4">
            <h4 className="font-bold text-slate-900 dark:text-white border-b pb-1 mb-2">3. Top Questions to Ask the Program</h4>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>"How does the program support residents seeking fellowship placements?"</li>
              <li>"What pathways or structured tracks (e.g. global health, research) are available?"</li>
              <li>"How has faculty mentorship evolved over the last 2-3 years?"</li>
              <li>"What qualities do residents who excel in your program typically possess?"</li>
            </ul>
          </div>

          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold text-center mt-3">
            Click "Download File" below to download the complete 2-page Cheat Sheet text document!
          </p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Interview Mastery" logo={logo} showBack />

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-[rgba(var(--color-primary),0.05)] to-[rgba(var(--color-secondary),0.1)] dark:from-[rgba(var(--color-primary),0.1)] dark:to-[rgba(var(--color-secondary),0.2)] border-[rgba(var(--color-primary),0.2)] dark:border-[rgba(var(--color-primary),0.4)]">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] flex items-center justify-center shadow-lg">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    Your Course Progress
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {completedLessons}/{totalLessons} lessons completed
                  </p>
                </div>
              </div>

              <Progress value={(completedLessons / totalLessons) * 100} className="h-3 mb-4" />

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center border border-white/40 dark:border-slate-700/40">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{courseModules.length}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Modules</p>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center border border-white/40 dark:border-slate-700/40">
                  <p className="text-2xl font-bold text-[rgb(var(--color-primary))]">4h+</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Video Content</p>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center border border-white/40 dark:border-slate-700/40">
                  <p className="text-2xl font-bold text-[rgb(var(--color-secondary))]">12m</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Time Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Modules */}
        <div className="space-y-6">
          {courseModules.map((module, idx) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(var(--color-primary),0.1)] dark:bg-[rgba(var(--color-primary),0.2)] flex items-center justify-center">
                      <span className="text-lg font-bold text-[rgb(var(--color-primary))]">
                        {module.id}
                      </span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {module.lessons.length} lessons
                      </p>
                    </div>
                    <Badge variant="outline">
                      {module.id === 1 ? '1' : '0'}/{module.lessons.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-[rgba(var(--color-primary),0.1)] dark:group-hover:bg-[rgba(var(--color-primary),0.2)] transition-colors">
                        {lesson.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <PlayCircle className="w-5 h-5 text-slate-400 group-hover:text-[rgb(var(--color-primary))] transition-colors" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-[rgb(var(--color-primary))] transition-colors">
                          {lesson.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {lesson.duration}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-xs text-[rgb(var(--color-primary))]">
                        Watch
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bonus Resources */}
        <Card className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Bonus Resources Included
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div 
              onClick={() => setActiveResource({ title: 'Interview Question Bank', desc: '50+ curated questions categorized by Behavioral, Clinical, and IMG-specific themes with full sample response frameworks.' })}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all cursor-pointer border border-transparent hover:border-amber-200"
            >
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  Interview Question Bank
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  50+ common questions with sample answers
                </p>
              </div>
            </div>
            <div 
              onClick={() => setActiveResource({ title: 'Interview Cheat Sheet', desc: 'A 2-page rapid summary guide with last-minute high-yield reminders for interview day morning.' })}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all cursor-pointer border border-transparent hover:border-amber-200"
            >
              <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  Interview Cheat Sheet
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Quick reference guide for interview day
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Lesson Video Player Modal */}
      <AnimatePresence>
        {activeLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto flex flex-col"
            >
              <button
                onClick={() => {
                  setActiveLesson(null);
                  setIsPlaying(false);
                }}
                className="absolute top-5 right-5 z-10 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Lesson Video Viewer */}
              <div className="relative aspect-video rounded-2xl bg-slate-950 flex items-center justify-center mb-4 overflow-hidden border border-slate-800 shadow-inner flex-shrink-0">
                {isPlaying ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-200 p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 animate-pulse">
                      <Play className="w-6 h-6 fill-current" />
                    </div>
                    <p className="font-bold text-white mb-1">Playing Lesson #{activeLesson.id}: {activeLesson.title}</p>
                    <p className="text-xs text-slate-400 max-w-md">HD Video & Audio stream active ({activeLesson.duration})</p>
                    <Button 
                      size="sm" 
                      onClick={() => setIsPlaying(false)} 
                      variant="outline"
                      className="mt-4 border-slate-700 text-xs text-white hover:bg-slate-800"
                    >
                      Pause Video
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/60 to-purple-900/60 opacity-80" />
                    <div className="relative text-center p-6 z-10 flex flex-col items-center">
                      <div 
                        onClick={() => setIsPlaying(true)}
                        className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-2xl mb-3 cursor-pointer hover:scale-110 transition-transform"
                      >
                        <Play className="w-8 h-8 text-white ml-1 fill-white" />
                      </div>
                      <p className="text-white font-bold text-base">Lesson #{activeLesson.id}: {activeLesson.title}</p>
                      <p className="text-slate-300 text-xs mt-1">Duration: {activeLesson.duration} • Interactive Video & Guide</p>
                    </div>
                  </>
                )}
              </div>

              {/* Lesson Nav Tabs */}
              <div className="flex gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                <Button
                  size="sm"
                  variant={lessonTab === 'overview' ? 'default' : 'ghost'}
                  onClick={() => setLessonTab('overview')}
                  className="rounded-xl text-xs"
                >
                  Overview & Details
                </Button>
                <Button
                  size="sm"
                  variant={lessonTab === 'takeaways' ? 'default' : 'ghost'}
                  onClick={() => setLessonTab('takeaways')}
                  className="rounded-xl text-xs"
                >
                  Key Takeaways
                </Button>
                <Button
                  size="sm"
                  variant={lessonTab === 'practice' ? 'default' : 'ghost'}
                  onClick={() => setLessonTab('practice')}
                  className="rounded-xl text-xs"
                >
                  Practice & Notes
                </Button>
              </div>

              {/* Lesson Content Body */}
              <div className="space-y-4 mb-6 flex-1 text-sm text-slate-700 dark:text-slate-300">
                {lessonTab === 'overview' && (
                  <div className="space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">Summary</h4>
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{activeLesson.summary}</p>
                    </div>
                    {lessonDetails[activeLesson.id]?.details && (
                      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/40">
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-1">Clinical Framework & Strategy</h4>
                        <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                          {lessonDetails[activeLesson.id].details}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {lessonTab === 'takeaways' && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">High-Yield Takeaways</h4>
                    {(lessonDetails[activeLesson.id]?.takeaways || [
                      'Review the STAR response model for behavioral clinical vignettes.',
                      'Maintain clear, structured delivery within 90-120 seconds.'
                    ]).map((takeaway, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-slate-700 dark:text-slate-300">{takeaway}</span>
                      </div>
                    ))}
                  </div>
                )}

                {lessonTab === 'practice' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                      {lessonDetails[activeLesson.id]?.practicePrompt || 'Draft your practice response for this lesson:'}
                    </h4>
                    <Textarea
                      placeholder="Write your personal answer or notes here..."
                      value={practiceNote}
                      onChange={(e) => setPracticeNote(e.target.value)}
                      className="min-h-[120px] rounded-xl text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveLessonNote(activeLesson.id)}
                      className="bg-indigo-600 text-white rounded-xl text-xs"
                    >
                      Save Practice Response
                    </Button>
                  </div>
                )}
              </div>

              {/* Lesson Footer Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={() => handleDownloadLessonHandout(activeLesson)}
                  variant="outline"
                  className="rounded-xl text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download Handout
                </Button>

                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 text-xs">
                    ✓ Unlocked Lesson
                  </Badge>
                  <Button 
                    size="sm"
                    onClick={() => {
                      setActiveLesson(null);
                      setIsPlaying(false);
                    }} 
                    className="bg-[rgb(var(--color-primary))] text-white rounded-xl text-xs"
                  >
                    Close Lesson
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resource Modal */}
      <AnimatePresence>
        {activeResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col"
            >
              <button
                onClick={() => {
                  setActiveResource(null);
                  setViewingDocContent(null);
                }}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4 text-amber-600 flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex-shrink-0">
                {activeResource.title}
              </h3>
              
              <div className="overflow-y-auto pr-2 mb-6 flex-1 max-h-[45vh]">
                {viewingDocContent ? (
                  getDocMarkup(activeResource.title)
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeResource.desc}
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-auto flex-shrink-0">
                <Button 
                  onClick={() => {
                    setActiveResource(null);
                    setViewingDocContent(null);
                  }} 
                  variant="outline" 
                  className="flex-1"
                >
                  Close
                </Button>
                {viewingDocContent ? (
                  <Button 
                    onClick={() => {
                      handleDownloadResource(activeResource.title);
                      setActiveResource(null);
                      setViewingDocContent(null);
                    }} 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setViewingDocContent(true)} 
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Open Document
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}