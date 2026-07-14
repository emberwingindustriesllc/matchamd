import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import ResourceLink from '@/components/common/ResourceLink';
import ProgressMountain from '@/components/gamification/ProgressMountain';
import ProgressTree from '@/components/gamification/ProgressTree';
import ProgressRocket from '@/components/gamification/ProgressRocket';
import ShareMilestone from '@/components/gamification/ShareMilestone';
import PathwayBreakdown from '@/components/guides/PathwayBreakdown';
import OETRequirements from '@/components/guides/OETRequirements';
import ApplicationTimeline from '@/components/guides/ApplicationTimeline';
import PathwayEligibilityQuiz from '@/components/guides/PathwayEligibilityQuiz';
import PathwayTimeline from '@/components/guides/PathwayTimeline';
import OfficialReferences from '@/components/guides/OfficialReferences';
import MatchProcessFlowchart from '@/components/guides/MatchProcessFlowchart';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import PathwayEligibilityChat from '@/components/ai/PathwayEligibilityChat';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  Check, 
  Clock, 
  ExternalLink,
  AlertCircle,
  Lightbulb,
  FileText,
  Zap,
  Share2,
  HelpCircle,
  Copy
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

const guideContent = {
  ecfmg_pathways: {
    title: 'ECFMG Certification Pathways',
    overview: 'ECFMG certification is REQUIRED for IMGs to enter US residency programs. The 2026 Pathways fulfill the clinical/communication skills component of certification. IMPORTANT: You MUST also pass USMLE Step 1 and Step 2 CK - pathways do NOT substitute for these exams. Apply via MyIntealth portal (launched Aug 2025).',
    deadline: 'January 31, 2026 (Certification Deadline)',
    checklist: [
      { id: 1, text: '✅ Pass USMLE Step 1 (REQUIRED - not part of pathways)' },
      { id: 2, text: '✅ Pass USMLE Step 2 CK (REQUIRED - not part of pathways)' },
      { id: 3, text: 'Pass OET Medicine (min. 350 ALL skills, test Jan 1, 2024+)' },
      { id: 4, text: 'Complete ONE of the 6 Pathways (clinical/communication skills)' },
      { id: 5, text: 'Submit application via MyIntealth portal' },
      { id: 6, text: 'Receive ECFMG certification by Jan 31, 2026 for Match' }
    ],
    tips: [
      'CRITICAL: USMLE Step 1 & Step 2 CK are SEPARATE requirements - must pass both',
      'Pathways only fulfill clinical/communication component - not full certification',
      'OET test date MUST be Jan 1, 2024 or later (older scores not accepted)',
      'Apply early via MyIntealth - verification can take weeks',
      'For 2026 Match: ERAS opens Sept 24, 2025; certification due Jan 31, 2026',
      '2026 Pathways expire Dec 31, 2028 - revalidation needed beyond this date',
      'Pathway 6 is fallback option for those who failed Step 2 CS or ineligible for others'
    ],
    resources: [
      { title: 'ECFMG Official - Pathways Info', url: 'https://www.ecfmg.org/certification-pathways', type: 'website' },
      { title: 'MyIntealth Application Portal', url: 'https://www.ecfmg.org/certification-pathways/myintealth.html', type: 'website' },
      { title: 'OET Medicine Registration', url: 'https://www.occupationalenglishtest.org', type: 'website' },
      { title: 'USMLE Step 1 Info', url: 'https://www.usmle.org/step-1', type: 'website' },
      { title: 'USMLE Step 2 CK Info', url: 'https://www.usmle.org/step-2-ck', type: 'website' }
    ]
  },
  usmle_step1: {
    title: 'USMLE Step 1',
    overview: 'Step 1 assesses whether you understand and can apply important concepts of the basic sciences to the practice of medicine. Now reported as Pass/Fail.',
    checklist: [
      { id: 1, text: 'Create USMLE account' },
      { id: 2, text: 'Get ECFMG ID' },
      { id: 3, text: 'Complete study resources (First Aid, UWorld, Pathoma)' },
      { id: 4, text: 'Take practice exams (NBME, UWorld Self-Assessments)' },
      { id: 5, text: 'Schedule exam date' },
      { id: 6, text: 'Pass Step 1' }
    ],
    tips: [
      'Dedicated study period of 2-3 months recommended',
      'First Aid + UWorld is the gold standard combo',
      'Practice with timed blocks to build stamina',
      'Join study groups for accountability'
    ],
    resources: [
      { title: 'USMLE Official', url: 'https://www.usmle.org', type: 'website' },
      { title: 'First Aid Book', url: 'https://www.firstaidteam.com', type: 'document' },
      { title: 'UWorld Qbank', url: 'https://www.uworld.com', type: 'website' }
    ]
  },
  clinical_experience: {
    title: 'US Clinical Experience',
    overview: 'US Clinical Experience (USCE) is crucial for competitive specialties like Surgery. It demonstrates your ability to work in the US healthcare system and provides valuable letters of recommendation.',
    checklist: [
      { id: 1, text: 'Research observership vs externship programs' },
      { id: 2, text: 'Apply to multiple programs (start 6-12 months early)' },
      { id: 3, text: 'Secure at least 2-3 rotations in your specialty' },
      { id: 4, text: 'Focus on programs that write strong LORs' },
      { id: 5, text: 'Network with attending physicians' },
      { id: 6, text: 'Document all experiences for ERAS' }
    ],
    tips: [
      'FOR SURGERY: Aim for at least one rotation at a university program',
      'Hands-on externships are valued more than observerships',
      'Target programs in your desired geographic location',
      'Be proactive - volunteer for cases and research opportunities',
      'Ask for letters from program directors or division chiefs'
    ],
    resources: [
      { title: 'AMOpportunities', url: 'https://www.amopportunities.org', type: 'website' },
      { title: 'VSLO (AAMC)', url: 'https://students-residents.aamc.org/vslo', type: 'website' },
      { title: 'IMG Clinical Experience Guide', url: 'https://www.ama-assn.org/education/international-medical-education', type: 'document' }
    ]
  },
  research: {
    title: 'Research Experience',
    overview: 'Research experience is especially important for competitive specialties like Surgery. Publications and presentations strengthen your application significantly.',
    checklist: [
      { id: 1, text: 'Identify research opportunities in your target specialty' },
      { id: 2, text: 'Join research projects remotely if needed' },
      { id: 3, text: 'Aim for at least 1-2 publications' },
      { id: 4, text: 'Present at conferences if possible' },
      { id: 5, text: 'List all research on ERAS with proper citations' }
    ],
    tips: [
      'FOR SURGERY: Research is highly valued - aim for surgical outcomes or education research',
      'Quality over quantity - one first-author paper is better than multiple abstracts',
      'Network with researchers at programs you want to match at',
      'Case reports and systematic reviews are good starting points',
      'Join surgical societies (e.g., SAGES, ACS) for networking'
    ],
    resources: [
      { title: 'Research Match', url: 'https://www.researchmatch.org', type: 'website' },
      { title: 'ACS Research Resources', url: 'https://www.facs.org', type: 'website' },
      { title: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov', type: 'website' }
    ]
  },
  usmle_step2: {
    title: 'USMLE Step 2 CK',
    overview: 'Step 2 CK assesses clinical knowledge through multiple-choice questions. A high score is crucial for competitive specialties.',
    checklist: [
      { id: 1, text: 'Complete Step 2 CK study resources' },
      { id: 2, text: 'Master clinical algorithms' },
      { id: 3, text: 'Complete UWorld Step 2' },
      { id: 4, text: 'Take self-assessments' },
      { id: 5, text: 'Schedule and pass exam' }
    ],
    tips: [
      'Many find Step 2 easier than Step 1',
      'Clinical rotations help significantly',
      'Focus on IM, Surgery, OB, Peds, Psych',
      'Aim for the highest score possible - it matters!'
    ],
    resources: [
      { title: 'USMLE Step 2 CK', url: 'https://www.usmle.org/step-2-ck', type: 'website' },
      { title: 'UWorld Step 2', url: 'https://www.uworld.com', type: 'website' },
      { title: 'Amboss', url: 'https://www.amboss.com', type: 'website' }
    ]
  },
  eras_registration: {
    title: 'ERAS Application',
    overview: 'The Electronic Residency Application Service (ERAS) is the centralized application system for residency programs. Your application opens to programs in September.',
    deadline: 'September 2025',
    checklist: [
      { id: 1, text: 'Create ERAS account through ECFMG' },
      { id: 2, text: 'Complete MyERAS application' },
      { id: 3, text: 'Upload personal statement' },
      { id: 4, text: 'Request letters of recommendation' },
      { id: 5, text: 'Upload USMLE transcript' },
      { id: 6, text: 'Certify and submit application' },
      { id: 7, text: 'Assign programs to documents' }
    ],
    tips: [
      'Apply broadly - 100+ programs for competitive specialties',
      'Apply early on September 3rd when applications open',
      'Have 3-4 strong letters of recommendation',
      'Research IMG-friendly programs'
    ],
    resources: [
      { title: 'ERAS for IMGs', url: 'https://students-residents.aamc.org/eras', type: 'website' },
      { title: 'Residency Explorer', url: 'https://www.residencyexplorer.org', type: 'website' },
      { title: 'FREIDA', url: 'https://freida.ama-assn.org', type: 'website' }
    ]
  },
  nrmp_match: {
    title: 'NRMP Match',
    overview: 'The National Resident Matching Program pairs applicants with residency programs through a computerized algorithm based on ranked lists.',
    deadline: 'March 2026',
    checklist: [
      { id: 1, text: 'Register for NRMP Main Match' },
      { id: 2, text: 'Complete interview season' },
      { id: 3, text: 'Create rank order list' },
      { id: 4, text: 'Certify rank list by deadline' },
      { id: 5, text: 'Match Day!' }
    ],
    tips: [
      'Rank programs by your TRUE preference order',
      'The algorithm favors applicants - be honest',
      'Have a SOAP backup plan',
      'Join Match support groups for the wait'
    ],
    resources: [
      { title: 'NRMP Official', url: 'https://www.nrmp.org', type: 'website' },
      { title: 'Match Timeline', url: 'https://www.nrmp.org/match-process', type: 'document' },
      { title: 'Charting Outcomes', url: 'https://www.nrmp.org/main-residency-match-data', type: 'document' }
    ]
  },
  interviews: {
    title: 'Residency Interview Success',
    overview: 'The exact formulas and answer frameworks to master common clinical match panel questions like "Tell me about yourself" and "Why our program?".',
    checklist: [
      { id: 1, text: 'Master the 3-part formula for "Tell me about yourself" (Past, Present, Future)' },
      { id: 2, text: 'Research specific program features (advocacy, clinics, research) for "Why Us?"' },
      { id: 3, text: 'Prepare questions to ask the interviewers' },
      { id: 4, text: 'Do at least 2 full mock interviews with feedback' },
      { id: 5, text: 'Draft post-interview thank you notes' }
    ],
    tips: [
      'Keep your "Tell me about yourself" response to exactly 90-120 seconds. Focus on clinical journey and goals, not personal trivia.',
      'For "Why Us?", never give a generic answer. Mention specific department projects or patient demographic focus areas.',
      'Always have 3-4 thoughtful questions ready for the program director and coordinators.'
    ],
    resources: [
      { title: 'NRMP Interview Guidelines', url: 'https://www.nrmp.org', type: 'website' }
    ]
  },
  observerships: {
    title: 'Clinical Observership Blueprint',
    overview: 'High-yield strategies and pitch templates for international medical graduates (IMGs) to contact faculty and secure observerships.',
    checklist: [
      { id: 1, text: 'Identify 10-15 target attending physicians in your specialty' },
      { id: 2, text: 'Draft a customized warm cold-email pitch' },
      { id: 3, text: 'Attach clinical CV and score transcripts' },
      { id: 4, text: 'Send a polite follow-up after 10-14 days if no response' }
    ],
    tips: [
      'Attending physicians receive hundreds of generic emails. Referencing their papers or department highlights increases response rates.',
      'Explicitly state that you are self-funded and hold a valid visa so they know there is no visa sponsorship cost.',
      'Use a copyable pitch template in your drafts.'
    ],
    resources: [
      { title: 'AAMC Observership Listings', url: 'https://www.aamc.org', type: 'website' }
    ],
    template: `Subject: Inquiry Regarding Clinical Observership Opportunities - Dr. [Your Last Name]

Dear Dr. [Attending Last Name],

I hope this email finds you well.

I am an international medical graduate from [Medical School] with a strong interest in [Specialty, e.g., Pediatrics]. I recently read your publication regarding [insert paper topic] and was deeply impressed by your team's approach to clinical care.

I am writing to inquire if there might be an opportunity for me to participate in a clinical observership under your guidance at [Hospital/Institution Name] for 4 weeks during [Month/Year].

I have passed USMLE Step 1 and scored [Score] on Step 2 CK. I am fully self-funded, carry active health insurance, and hold a valid visa. I would be honored to shadow your team, attend clinical rounds, and contribute to your academic activities.

Attached is my CV for your review. Thank you very much for your time and consideration.

Sincerely,

[Your Name], MD`
  },
  pearls: {
    title: 'Pediatric High-Yield Pearls',
    overview: 'Essential pediatric clinical findings, differentials, and developmental milestones frequently tested during clinical match interviews and rounds.',
    checklist: [
      { id: 1, text: 'Review innocent vs pathologic murmurs features' },
      { id: 2, text: 'Memorize developmental milestones (2, 4, 6, 9, 12 months)' },
      { id: 3, text: 'Understand pediatric immunizations schedules' },
      { id: 4, text: 'Review core neonatal resuscitation guidelines' }
    ],
    tips: [
      'Innocent murmurs are typical systolic, soft (grade 1-2/6), and change intensity with position changes.',
      'Still\'s murmur is the most common innocent murmur in children - it has a musical or vibratory quality.',
      'Regression of developmental milestones is ALWAYS pathologic and requires immediate neurological workup.'
    ],
    resources: [
      { title: 'AAP Pediatric Care Online', url: 'https://www.aap.org', type: 'website' }
    ]
  },
  oet_medicine: {
    title: 'OET Medicine (Occupational English Test)',
    overview: 'The Occupational English Test (OET) is an English language test designed specifically for healthcare professionals. For IMGs, passing OET Medicine is required to satisfy the communication and English proficiency requirement for ECFMG Certification. You must score a minimum of 350 (Grade B) in each of the four sub-tests (Listening, Reading, Writing, Speaking) in a single test administration.',
    checklist: [
      { id: 1, text: 'Register for the OET Medicine exam (ensure it is the Medicine version).' },
      { id: 2, text: 'Study OET exam format (specifically the Speaking and Writing criteria).' },
      { id: 3, text: 'Complete official OET practice tests (Listening and Reading).' },
      { id: 4, text: 'Practice Speaking role-plays with a partner or tutor.' },
      { id: 5, text: 'Submit Writing letters for feedback based on medical templates.' },
      { id: 6, text: 'Take the OET exam and achieve a score of 350+ in all sections.' },
      { id: 7, text: 'Release OET scores to ECFMG via your OET portal.' }
    ],
    tips: [
      'The Writing section is the most common reason for failure. Focus on formatting, layout, and selectiveness of case notes.',
      'Ensure you register for OET Medicine, NOT OET nursing or any other version.',
      'Take the computer-based or paper-based test at a test center; OET @ Home is subject to specific ECFMG validation guidelines.',
      'Practice speaking role-plays under timed conditions (3 minutes prep, 5 minutes speaking).'
    ],
    resources: [
      { title: 'OET Official Website', url: 'https://www.occupationalenglishtest.org', type: 'website' },
      { title: 'ECFMG English Proficiency Requirements', url: 'https://www.ecfmg.org/certification-pathways/english-proficiency.html', type: 'website' }
    ]
  },
  personal_statement: {
    title: 'Personal Statement Mastery',
    overview: 'Your personal statement is your unique opportunity to speak directly to the residency selection committee. It should explain your journey as an IMG, highlight your clinical and research competencies, demonstrate your resilience, and outline your future goals in your chosen specialty. Keep it to one page (roughly 600-800 words).',
    checklist: [
      { id: 1, text: 'Brainstorm key themes (e.g., patient encounter, personal story, overcoming obstacles).' },
      { id: 2, text: 'Outline structure: Introduction (Hook), clinical/research journey, resilience/adaptability, and career goals.' },
      { id: 3, text: 'Draft the first version focusing on flow and narrative without self-censoring.' },
      { id: 4, text: 'Refine and edit: reduce wordiness, eliminate clichés, and ensure specialty alignment.' },
      { id: 5, text: 'Run the personal statement through the MatchApp Audit tool (under IMG Programs).' },
      { id: 6, text: 'Get feedback from at least 2 mentors, colleagues, or native English speakers.' },
      { id: 7, text: 'Finalize draft, proofread for grammar, and upload to ERAS.' }
    ],
    tips: [
      'Show, don\'t tell: instead of saying you are hard-working, describe a clinical scenario where you demonstrated dedication.',
      'Address your IMG status positively by highlighting adaptability, diverse perspectives, and clinical flexibility.',
      'Keep formatting clean: simple paragraphs, standard font, no bullet points or special characters.',
      'Ensure the document is under 800 words so it doesn\'t spill onto a second page on the ERAS PDF.'
    ],
    resources: [
      { title: 'AAMC Personal Statement Guide', url: 'https://students-residents.aamc.org/applying-residency/writing-personal-statement', type: 'document' },
      { title: 'IMG Personal Statement Examples', url: 'https://www.ama-assn.org/education/international-medical-education/writing-successful-eras-personal-statement', type: 'website' }
    ]
  },
  lors: {
    title: 'Letters of Recommendation (LORs)',
    overview: 'Letters of Recommendation are critical components of your application. You need 3 to 4 letters, preferably from US physicians who have observed your clinical skills firsthand (US Clinical Experience). A specialty-specific letter is highly recommended for your target field.',
    checklist: [
      { id: 1, text: 'Identify potential letter writers (US attendings, clinical supervisors, department chiefs).' },
      { id: 2, text: 'Request letters early (at least 6-8 weeks before application submission).' },
      { id: 3, text: 'Provide letter writers with your CV, Personal Statement draft, and USMLE score report.' },
      { id: 4, text: 'Create Letter Request Forms in ERAS and send them to your writers with instructions.' },
      { id: 5, text: 'Follow up politely 2-3 weeks before the submission deadline.' },
      { id: 6, text: 'Verify letters are uploaded and marked as \'Released\' in ERAS.' },
      { id: 7, text: 'Assign relevant letters to target programs in ERAS.' }
    ],
    tips: [
      'Waive your right to view the letters. Programs heavily discount \'unwaived\' letters because they assume they aren\'t fully candid.',
      'At least two letters should be from US clinical rotations (hands-on) in your specialty.',
      'A letter from a Program Director or Division Chief carries the highest weight.',
      'Confirm details: ensure the writer has your correct name, ERAS ID, and target specialty.'
    ],
    resources: [
      { title: 'AAMC ERAS LOR Portal Guide', url: 'https://students-residents.aamc.org/applying-residency/letters-recommendation-eras', type: 'website' },
      { title: 'How to Ask for a US LOR', url: 'https://www.ama-assn.org/residents-students/residency/4-tips-securing-strong-letters-recommendation', type: 'document' }
    ]
  },
  program_research: {
    title: 'Program Research & Targeting',
    overview: 'Applying to the right programs is crucial to maximize your match chances while controlling costs. Research programs to identify those that are IMG-friendly, sponsor the visa you need, and have historically matched graduates from your region/school.',
    checklist: [
      { id: 1, text: 'Identify your key parameters (specialty, visa needs, geographical preference).' },
      { id: 2, text: 'Compile a list of all accredited programs in your specialty using FREIDA or Residency Explorer.' },
      { id: 3, text: 'Filter programs based on minimum USMLE score cutoffs and visa sponsorship (J-1/H-1B).' },
      { id: 4, text: 'Cross-reference program websites to verify current percentage of IMG residents.' },
      { id: 5, text: 'Connect with current residents or alumni from your medical school at target programs.' },
      { id: 6, text: 'Classify programs into \'Reach\', \'Target\', and \'Safety\' categories.' },
      { id: 7, text: 'Finalize a list of 80-150 programs (depending on your competitiveness and specialty).' }
    ],
    tips: [
      'Do not apply to programs that explicitly state they do not accept international graduates or sponsor visas if you need one.',
      'Geographic filtering is real. Programs often prefer candidates with local connections or rotations in their region.',
      'Check the resident roster on program websites - if they have zero IMGs, matching there will be extremely difficult.'
    ],
    resources: [
      { title: 'Residency Explorer Tool', url: 'https://www.residencyexplorer.org', type: 'website' },
      { title: 'FREIDA Database', url: 'https://freida.ama-assn.org', type: 'website' }
    ]
  },
  visa: {
    title: 'Visa Planning & Requirements',
    overview: 'Securing the correct visa is the final step in transition to US training. Most IMGs match on either a J-1 (Exchange Visitor) visa sponsored by ECFMG, or an H-1B (Temporary Worker) visa sponsored directly by the matching hospital.',
    checklist: [
      { id: 1, text: 'Understand J-1 vs H-1B differences (J-1 requires home residency requirement; H-1B allows dual intent but requires Step 3).' },
      { id: 2, text: 'Check if target programs sponsor H-1B visas (many only offer J-1).' },
      { id: 3, text: 'Take USMLE Step 3 early if you are aiming for an H-1B visa (Step 3 must be passed before March).' },
      { id: 4, text: 'Upon matching, request your visa sponsorship packet from the program coordinator.' },
      { id: 5, text: '(For J-1) Obtain the Statement of Need from your home country\'s Ministry of Health.' },
      { id: 6, text: 'Pay the SEVIS fee and complete the DS-160 online visa application.' },
      { id: 7, text: 'Schedule and attend your visa interview at the US Embassy/Consulate.' }
    ],
    tips: [
      'To qualify for H-1B, you must pass USMLE Step 3 before the rank order list deadline in March so the program can file the petition.',
      'The J-1 visa carries a two-year home country physical presence requirement (Section 212e). You must return home or get a Conrad 30 waiver after training.',
      'Ensure all names on your passport, transcripts, and ECFMG certificate match exactly to avoid embassy processing delays.'
    ],
    resources: [
      { title: 'ECFMG EVSP (J-1 Visa Sponsorship)', url: 'https://www.ecfmg.org/evsp', type: 'website' },
      { title: 'USCIS H-1B Visa Information', url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations', type: 'website' },
      { title: 'State Department Visa Appointments', url: 'https://travel.state.gov', type: 'website' }
    ]
  }
};

export default function GuideDetail() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const guideId = searchParams.get('id') || 'ecfmg_pathways';
  const pathway = searchParams.get('pathway') || 'residency';
  
  const [notes, setNotes] = useState('');
  const [visualMode, setVisualMode] = useState('mountain'); // 'mountain', 'tree', 'rocket'
  const [showShareDialog, setShowShareDialog] = useState(false);
  const visualRef = React.useRef(null);
  
  const guide = guideContent[guideId] || guideContent.ecfmg_pathways;

  const { user } = useAuth();

  const { data: progressList = [] } = useQuery({
    queryKey: ['progress', guideId],
    queryFn: async () => {
      const { data, error } = await supabase.from('progress').select('*').eq('user_id', user?.id).eq('module_id', guideId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const progress = progressList[0];
  const [localChecklist, setLocalChecklist] = useState(
    guide.checklist.map(item => ({ ...item, completed: false }))
  );

  useEffect(() => {
    if (progress) {
      if (progress.checklist_items) {
        setLocalChecklist(progress.checklist_items);
      } else {
        setLocalChecklist(guide.checklist.map(item => ({ ...item, completed: false })));
      }
      setNotes(progress.notes || '');
    } else {
      setLocalChecklist(guide.checklist.map(item => ({ ...item, completed: false })));
      setNotes('');
    }
  }, [progress, guide]);

  const updateProgressMutation = useMutation({
    mutationFn: async (dataToUpdate) => {
      if (progress) {
        const { data, error } = await supabase.from('progress').update(dataToUpdate).eq('id', progress.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('progress').insert({
          user_id: user.id,
          pathway,
          module_id: guideId,
          module_name: guide.title,
          ...dataToUpdate
        }).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['progress'] })
  });

  const toggleChecklistItem = (itemId) => {
    const newChecklist = localChecklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setLocalChecklist(newChecklist);
    
    const completedCount = newChecklist.filter(i => i.completed).length;
    const total = newChecklist.length;
    const percentage = Math.round((completedCount / total) * 100);
    const wasComplete = localChecklist.filter(i => i.completed).length === total;
    
    // Celebration for completion
    if (percentage === 100 && !wasComplete) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    
    updateProgressMutation.mutate({
      checklist_items: newChecklist,
      completion_percentage: percentage,
      status: percentage === 100 ? 'completed' : percentage > 0 ? 'in_progress' : 'not_started'
    });
  };

  const completedCount = localChecklist.filter(i => i.completed).length;
  const progressPercentage = Math.round((completedCount / localChecklist.length) * 100);

  const breadcrumbItems = [
    { label: 'Guides', href: createPageUrl('Guides') },
    { label: guide.title }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header title={guide.title} showBack />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        {/* Visual Progress */}
        <motion.div
          ref={visualRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
        >
          {/* Header with Share Button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Your Progress</h2>
            <Button
              onClick={() => setShowShareDialog(true)}
              size="sm"
              variant="outline"
              className="rounded-xl"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2 mb-4 justify-center">
            <Button
              variant={visualMode === 'mountain' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisualMode('mountain')}
              className="rounded-xl"
            >
              🏔️ Mountain
            </Button>
            <Button
              variant={visualMode === 'tree' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisualMode('tree')}
              className="rounded-xl"
            >
              🌳 Tree
            </Button>
            <Button
              variant={visualMode === 'rocket' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisualMode('rocket')}
              className="rounded-xl"
            >
              🚀 Rocket
            </Button>
          </div>

          {/* Visual Display */}
          {visualMode === 'mountain' && (
            <ProgressMountain completedCount={completedCount} totalCount={localChecklist.length} />
          )}
          {visualMode === 'tree' && (
            <ProgressTree completedCount={completedCount} totalCount={localChecklist.length} />
          )}
          {visualMode === 'rocket' && (
            <ProgressRocket completedCount={completedCount} totalCount={localChecklist.length} />
          )}

          {/* Deadline */}
          {guide.deadline && (
            <div className="flex items-center justify-center gap-2 mt-4 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Due: {guide.deadline}</span>
            </div>
          )}
        </motion.div>

        {/* Overview */}
        <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            Overview
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{guide.overview}</p>
        </Card>

        {/* Copyable Template */}
        {guide.template && (
          <Card className="p-5 rounded-2xl border-indigo-200 dark:border-indigo-800 bg-indigo-50/20 dark:bg-indigo-950/10 space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center justify-between">
              <span className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <FileText className="w-5 h-5" />
                Warm Email Template
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(guide.template);
                  toast.success("Template copied to clipboard!");
                }}
                className="rounded-xl flex items-center gap-1.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
            </h3>
            <div className="relative">
              <pre className="text-[11px] p-3 rounded-xl bg-slate-950 text-slate-100 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[350px]">
                {guide.template}
              </pre>
            </div>
          </Card>
        )}

        {/* ECFMG-Specific Content */}
        {guideId === 'ecfmg_pathways' && (
          <>
            {/* Disclaimer */}
            <Card className="p-4 rounded-2xl border-2 border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/20">
              <p className="text-sm text-rose-800 dark:text-rose-300">
                ⚠️ <strong>DISCLAIMER:</strong> This information is for guidance only and may not reflect the latest updates. Always consult the official ECFMG website ({' '}
                <a href="https://www.ecfmg.org" target="_blank" rel="noopener noreferrer" className="underline">
                  ecfmg.org
                </a>
                ) for authoritative and current requirements. ECFMG certification requires BOTH passing USMLE exams AND completing a pathway.
              </p>
            </Card>

            {/* OET Requirements */}
            <OETRequirements />

            {/* Application Timeline */}
            <ApplicationTimeline />

            {/* Visual Process Timeline */}
            <PathwayTimeline pathway={pathway} />

            {/* Match Process Flowchart */}
            <MatchProcessFlowchart />

            {/* AI Pathway Assistant */}
            <PathwayEligibilityChat userProfile={user} />

            {/* Eligibility Quiz */}
            <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                Am I Eligible? Quick Assessment
              </h3>
              <PathwayEligibilityQuiz />
            </Card>

            {/* Pathway Breakdown */}
            <PathwayBreakdown />

            {/* Official References & Citations */}
            <OfficialReferences />
          </>
        )}

        {/* Checklist */}
        <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-500" />
            Checklist
          </h3>
          <div className="space-y-3">
            {localChecklist.map((item, idx) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => toggleChecklistItem(item.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all relative overflow-hidden ${
                  item.completed
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-300 dark:border-emerald-700'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                } border-2`}
              >
                {item.completed && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute top-2 right-2"
                  >
                    <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </motion.div>
                )}
                <Checkbox checked={item.completed} className="pointer-events-none" />
                <span className={`flex-1 text-left font-medium ${
                  item.completed 
                    ? 'text-emerald-700 dark:text-emerald-400' 
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {item.text}
                </span>
                {item.completed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-2xl"
                  >
                    ✨
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </Card>

        {/* Tips */}
        <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Pro Tips
          </h3>
          <div className="space-y-3">
            {guide.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 dark:text-slate-300">{tip}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Resources */}
        <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-blue-500" />
            Official Resources
          </h3>
          <div className="space-y-3">
            {guide.resources.map((resource, idx) => (
              <ResourceLink key={idx} {...resource} />
            ))}
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Your Notes</h3>
          <Textarea
            placeholder="Add your personal notes for this step..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px] rounded-xl"
          />
          <Button 
            onClick={() => updateProgressMutation.mutate({ notes })}
            className="mt-3 rounded-xl"
          >
            Save Notes
          </Button>
        </Card>
      </main>

      <ShareMilestone
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        guideTitle={guide.title}
        completionPercentage={progressPercentage}
        visualRef={visualRef}
      />

      <BottomNav />
    </div>
  );
}