/**
 * Comprehensive Guide Content Database for MatchaMD
 * Contains in-depth, structured guides for all USMLE exams and IMG Match steps.
 */

export const guideContent = {
  // ─── USMLE STEP 2 CK ──────────────────────────────────────────────────
  usmle_step2: {
    title: 'USMLE Step 2 CK Guide for IMGs',
    overview:
      'The most important scored exam for IMGs in the pass/fail era — everything you need to know to register, prepare, and score competitively.\n\nStep 2 CK is now the single most important numeric metric program directors use to compare applicants. With Step 1 being Pass/Fail, your Step 2 CK score is the primary proof of your clinical knowledge.',
    deadline: 'Score release before Sept 24 (ERAS submission)',
    sections: [
      {
        title: '1. What is USMLE Step 2 CK?',
        content:
          'USMLE Step 2 CK (Clinical Knowledge) is a one-day exam that evaluates your clinical knowledge and ability to apply medical concepts in patient care scenarios. It focuses on what a physician should know to provide safe, competent care under supervision.\n\nStep 2 CK is now the single most important scored exam for IMGs applying to US residency programs. According to the 2024 NRMP Program Director Survey, 83% of program directors consider Step 2 CK scores when evaluating applicants, and roughly 30% of programs use a minimum score for interview screening.\n\nFor IMGs specifically, Step 2 CK carries even more weight. With no Step 1 numeric score to offset concerns about foreign medical education, your Step 2 CK score becomes the primary proof of your clinical knowledge and competitiveness.'
      },
      {
        title: '2. Eligibility and Registration for IMGs',
        content:
          'How IMGs Register:\nLike Step 1, IMGs register through FSMB/ECFMG:\n• Log into your ECFMG/MyIntealth account\n• Apply through FSMB at fsmb.org\n• Pay the exam fee — $695 (2026–2027) + $235 region fee if testing outside US/Canada\n• Receive your scheduling permit with a three-month eligibility period\n• Schedule at Prometric via prometric.com\n\nPrerequisites:\n• You must have passed Step 1 before taking Step 2 CK\n• You must be enrolled in or graduated from a WDOMS-listed medical school meeting ECFMG requirements\n\nEligibility Period:\nYou will receive a 3-month window in which you must sit for the exam. A one-time extension is available for a fee.'
      },
      {
        title: '3. Exam Format and Content',
        content:
          'Exam Structure:\nStep 2 CK is a one-day examination divided into eight 60-minute blocks, administered in a single 9-hour testing session. Each block contains up to 40 questions, with a maximum of 318 total questions across the exam.\nBreak time: minimum 45 minutes (increased by finishing blocks early), plus a 15-minute optional tutorial.\n\nContent Breakdown:\n• Cardiovascular (14–16%)\n• Respiratory (10–12%)\n• Gastrointestinal (10–12%)\n• Renal/Urinary (7–9%)\n• Nervous/Special Senses (9–11%)\n• Musculoskeletal/Skin (7–9%)\n• Endocrine (7–9%)\n• Reproductive (7–9%)\n• Hematology/Oncology (6–8%)\n• Immune System (4–6%)\n• Behavioral Health (6–8%)\n\nThe content is overwhelmingly clinical vignette-based — you will read a patient scenario and answer questions about diagnosis, next best step, management, or complications.'
      },
      {
        title: '4. Scoring & Percentile Reference (2026)',
        content:
          'Three-Digit Score:\nStep 2 CK is scored on a three-digit scale from 1 to 300.\n• Current passing score: 218 (raised from 214, effective July 1, 2025)\n• National mean: ~250 for first-time US MD test-takers\n• Standard error of measurement: ~6 points\n\nScore Percentile Table (2026 Norms):\n• 270+ : 94th Percentile — Elite (top competitive specialties)\n• 265 : 85th Percentile — Excellent (highly competitive)\n• 260 : 74th Percentile — Very strong (competitive for any specialty)\n• 255 : 60th Percentile — Above average (good for most specialties)\n• 250 : 47th Percentile — Near mean (solid baseline)\n• 245 : 34th Percentile — Below mean (review specialty targets)\n• 240 : 24th Percentile — Lower quarter (limited competitive options)\n• 235 : 16th Percentile — Low (strategic planning needed)\n• 230 : 10th Percentile — Very low (broad application required)\n• 218 : 2nd Percentile — Minimum passing score'
      },
      {
        title: '5. What Score Do I Need? (IMG-Specific Targets)',
        content:
          'General Rule for IMGs:\nIMGs should target 5–15 points above specialty averages. The IMG gap is real — it reflects higher competition for non-US positions.\n\nIMG Specialty Target Benchmarks:\n• Dermatology: 260+ (US Senior Mean: 258)\n• Orthopedics / Plastics / Neurosurgery: 258+ (US Senior Mean: 256)\n• Otolaryngology (ENT): 255+\n• Radiology: 253+\n• Anesthesiology / General Surgery / EM: 250+\n• Internal Medicine / OB-GYN: 248+\n• Psychiatry / Pediatrics: 245+\n• Family Medicine: 242+\n\nIMG Category Target Minimums:\n• US-citizen IMG (Primary Care): 240–245 (Target: 248+)\n• Non-US-citizen IMG (Primary Care): 245–250 (Target: 252+)\n• Non-US-citizen IMG (Competitive Specialties): 250–255 (Target: 258+)'
      },
      {
        title: '6. Study Strategy and Timeline',
        content:
          'Recommended Study Period:\n• 4–8 weeks dedicated for recent clinical graduates\n• 3–6 months for IMGs who have been out of clinical practice\n\nPhases of Study:\nPhase 1: Content Foundation (Weeks 1–3) — 1–2 UWorld blocks/day + Step-Up to Medicine / First Aid CK.\nPhase 2: Intensive QBank (Weeks 4–6) — 3–4 UWorld blocks/day (120-160 questions) + thorough explanation review.\nPhase 3: Self-Assessment (Weeks 7–8) — NBME self-assessments every 3–4 days + target weak areas.\nPhase 4: Final Push (Last Week) — Rapid review of ethics, biostats, quality improvement, and high-yield algorithms.'
      },
      {
        title: '7. Test Day & Preparation Best Practices',
        content:
          'What Makes Step 2 CK Different from Step 1:\n• Clinical reasoning over mechanisms — Step 1 asks "why" (mechanism); Step 2 CK asks "what next" (management).\n• Next best step questions — Learn the algorithm: when to order imaging, when to biopsy, when to treat empirically.\n• Management & contraindications — Know first-line vs second-line drugs.\n• Ethics & Communication — A significant portion covers shared decision-making, informed consent, and difficult patient encounters.'
      }
    ],
    checklist: [
      { id: 1, text: 'Pass USMLE Step 1 and confirm passing status' },
      { id: 2, text: 'Register via FSMB and obtain 3-month eligibility permit' },
      { id: 3, text: 'Complete 100% of UWorld Step 2 CK Qbank' },
      { id: 4, text: 'Review Divine Interventions podcasts (Biostats, Ethics, QI, Risk Factors)' },
      { id: 5, text: 'Take at least 3 NBME practice exams (target score >245+)' },
      { id: 6, text: 'Complete UWorld Self-Assessments (UWSA 1 & 2)' },
      { id: 7, text: 'Sit for Step 2 CK with score release prior to Sept 24 ERAS opening' }
    ],
    tips: [
      'Step 2 CK is the single most important numeric filter for IMGs in 2026',
      'Target 5–15 points above published US MD senior averages',
      'Ethics, Biostatistics, and Quality Improvement are high-yield easy points — do NOT skip them',
      'Read the last sentence of long clinical vignettes first to identify the question core',
      'Once passed, Step 2 CK CANNOT be retaken for a higher score — make your first attempt count'
    ],
    resources: [
      { title: 'USMLE Official Step 2 CK', url: 'https://www.usmle.org/step-2-ck', type: 'website' },
      { title: 'UWorld Step 2 CK QBank', url: 'https://www.uworld.com', type: 'website' },
      { title: 'Divine Interventions Podcast', url: 'https://divineinterventionspodcasts.com', type: 'website' },
      { title: 'AMBOSS Step 2 Library', url: 'https://www.amboss.com', type: 'website' },
      { title: 'NRMP Charting Outcomes 2024', url: 'https://www.nrmp.org/main-residency-match-data', type: 'document' }
    ],
    faq: [
      {
        question: 'Is Step 2 CK required for ECFMG Certification?',
        answer: 'Yes. Passing Step 2 CK is mandatory for ECFMG Certification. It replaced Step 2 CS as part of the pathway requirements.'
      },
      {
        question: 'What is a good Step 2 CK score for an IMG?',
        answer: 'For primary care (IM, FM, Peds, Psych), aim for 248+ as an IMG. For surgical or mid-competitive fields (Anesthesia, Surgery, EM), aim for 252+. For highly competitive fields (Derm, Ortho, Plastics), aim for 258+.'
      },
      {
        question: 'Can I retake Step 2 CK if I pass but want a higher score?',
        answer: 'No. Once you pass a USMLE Step exam, you cannot retake it for score improvement. Make sure you are hitting your target in NBMEs before sitting for the exam.'
      },
      {
        question: 'Should I take Step 2 CK before applying in ERAS?',
        answer: 'Yes! Having your Step 2 CK score available by September 24 when ERAS opens is essential. Many programs filter out IMG applications that lack a Step 2 CK score.'
      },
      {
        question: 'How long should an IMG study for Step 2 CK?',
        answer: 'If you recently completed clinical rotations: 4–8 weeks. If you have been out of clinical training for over a year: 3–6 months.'
      },
      {
        question: 'Does Step 2 CK include CCS (Clinical Case Simulations)?',
        answer: 'No. CCS is only tested on USMLE Step 3. Step 2 CK is 100% multiple-choice vignette questions.'
      },
      {
        question: 'How much does Step 2 CK cost for IMGs?',
        answer: 'The 2026–2027 fee is $695 plus a $235 international surcharge if testing outside the US/Canada.'
      }
    ]
  },

  // ─── USMLE STEP 1 ─────────────────────────────────────────────────────
  usmle_step1: {
    title: 'USMLE Step 1 Guide for IMGs',
    overview:
      'Step 1 evaluates your understanding of basic science concepts fundamental to medicine. Now reported as Pass/Fail, but passing on your first attempt is essential for IMG credibility.',
    sections: [
      {
        title: '1. What is USMLE Step 1?',
        content:
          'USMLE Step 1 assesses whether you understand and can apply important concepts of the basic sciences to the practice of medicine, with special emphasis on principles and mechanisms underlying health, disease, and modes of therapy.\n\nSince January 2022, Step 1 is scored as Pass/Fail. While it no longer provides a 3-digit score to differentiate applicants, a FIRST-ATTEMPT PASS is crucial for IMGs. A fail on Step 1 is a major red flag that can disqualify your application at many programs.'
      },
      {
        title: '2. Registration & Prerequisites for IMGs',
        content:
          '• Obtain an ECFMG ID via MyIntealth / ECFMG portal.\n• Complete Form 186 (NotaryCam online identity verification).\n• Submit Step 1 application on fsmb.org ($695 + $235 international regional surcharge if outside US/Canada).\n• Medical School Certification: Your medical school must verify your student/graduate status electronically via EMMAP or paper Form 183.\n• Scheduling Permit: Pick a 3-month eligibility window and book a Prometric test seat.'
      },
      {
        title: '3. Exam Format & Content Breakdown',
        content:
          '• Structure: 8-hour single-day exam divided into seven 60-minute blocks (up to 40 questions per block, max 280 total questions).\n• Break Time: 45 minutes total (plus 15 min optional tutorial).\n• Content Topics:\n  - Pathology & Pathophysiology (45–52%)\n  - Pharmacology & Biochemistry (15–22%)\n  - Physiology (12–18%)\n  - Microbiology & Immunology (10–15%)\n  - Anatomy & Embryology (6–10%)\n  - Behavioral Science, Biostatistics & Ethics (7–12%)'
      },
      {
        title: '4. Preparation Strategy & Core Resources',
        content:
          'Gold Standard Resources:\n1. First Aid for the USMLE Step 1 (The bible — read & annotate 2–3 times).\n2. Pathoma (Dr. Sattar — Chapters 1–3 are mandatory for high-yield pathology).\n3. UWorld Step 1 QBank (Complete 100% of questions in random, timed mode).\n4. SketchyMicro & SketchyPharm (Visual memory hooks for microbiology & drugs).\n5. Boards & Beyond (Comprehensive video lectures for weak foundational topics).\n\nStudy Timeline:\n• Pre-Dedicated Phase (2–4 months): 1 block UWorld/day + Pathoma/Sketchy video review.\n• Dedicated Phase (4–8 weeks): 2–3 blocks UWorld/day + NBME practice exams every 7–10 days.\n• Passing Benchmark: Aim for >65% on NBME self-assessments (which correlates to >99% pass probability).'
      }
    ],
    checklist: [
      { id: 1, text: 'Obtain ECFMG ID and complete Form 186 identity verification' },
      { id: 2, text: 'Submit Step 1 application on FSMB and secure Prometric permit' },
      { id: 3, text: 'Complete Pathoma Chapters 1–3 and SketchyMicro/Pharm' },
      { id: 4, text: 'Finish 100% of UWorld Step 1 Qbank' },
      { id: 5, text: 'Score >65% consistently on NBME Practice Exams (Forms 26–31)' },
      { id: 6, text: 'Pass Step 1 on first attempt' }
    ],
    tips: [
      'Do NOT schedule your exam until you are scoring >65% on NBMEs (Forms 28, 29, 30, 31)',
      'Pathoma Chapters 1–3 cover general pathology principles tested in almost every block',
      'First-attempt pass is essential — a fail on Step 1 creates a severe hurdle for ERAS',
      'Focus on concepts over rote memorization: Step 1 vignettes ask for underlying pathophysiology'
    ],
    resources: [
      { title: 'USMLE Step 1 Official', url: 'https://www.usmle.org/step-1', type: 'website' },
      { title: 'UWorld Step 1 QBank', url: 'https://www.uworld.com', type: 'website' },
      { title: 'Pathoma Pathology', url: 'https://www.pathoma.com', type: 'website' },
      { title: 'SketchyMedical', url: 'https://www.sketchy.com', type: 'website' }
    ],
    faq: [
      {
        question: 'Does Step 1 score matter now that it is Pass/Fail?',
        answer: 'There is no numeric score reported, only Pass or Fail. However, passing on your FIRST attempt is critical. A fail attempt is permanently visible on your USMLE transcript.'
      },
      {
        question: 'What NBME score means I am ready to pass?',
        answer: 'An NBME score of 65% or higher (Equated Percent Correct) corresponds to a >99% probability of passing the actual Step 1 exam.'
      }
    ]
  },

  // ─── USMLE STEP 3 ─────────────────────────────────────────────────────
  usmle_step3: {
    title: 'USMLE Step 3 Guide for IMGs',
    overview:
      'Step 3 tests independent clinical management. Passing Step 3 before the Match makes you eligible for an H-1B visa and demonstrates clinical maturity to program directors.',
    sections: [
      {
        title: '1. Why Take Step 3 Before the Match?',
        content:
          'Taking and passing Step 3 prior to residency application/ranking offers massive advantages for IMGs:\n1. H-1B Visa Eligibility: Programs can ONLY sponsor H-1B visas for applicants who have passed Step 3 before rank order list deadline.\n2. Overcoming Red Flags: If you have low Step 1/2 scores or a YOG gap, a strong Step 3 score proves current clinical competence.\n3. Program Director Confidence: Shows you will not fail Step 3 during intern year, freeing you to focus on patient care.'
      },
      {
        title: '2. Exam Format & Two-Day Structure',
        content:
          'Day 1: Foundations of Independent Practice (FIP)\n• 7 hours total | 233 multiple-choice questions (divided into six 60-minute blocks).\n• Focus: Basic science, pathophysiology, biostatistics, epidemiology, medical ethics, and diagnostic reasoning.\n\nDay 2: Advanced Clinical Medicine (ACM)\n• 9 hours total | 180 multiple-choice questions (divided into six 45-minute blocks).\n• 13 Computer-Based Case Simulations (CCS): Real-time interactive patient management cases (10-minute or 20-minute cases).'
      },
      {
        title: '3. Mastering CCS (Computer-Based Case Simulations)',
        content:
          'CCS accounts for ~25–30% of your Step 3 score!\n• Software Behavior: You type orders (labs, imaging, meds, consults) into a simulated EMR.\n• Key Practice Tool: CCSCases.com (Complete all 140+ interactive practice cases).\n• High-Yield Rules:\n  - Always order emergency vitals & IV access first for unstable patients.\n  - Move patients to ICU/CCU if unstable, or outpatient clinic if stable.\n  - Order follow-up appointments, patient counseling, and preventative screening before ending case.'
      },
      {
        title: '4. Scoring & High-Yield Preparation',
        content:
          '• Passing Score: 198 (3-digit scale).\n• National Mean: ~228.\n• Recommended Resources:\n  - UWorld Step 3 QBank (1,800+ questions)\n  - CCSCases.com (Mandatory interactive case practice)\n  - Master the Boards Step 3 (Conrad Fischer)\n  - First Aid for Step 3\n• Study Duration: 3–6 weeks dedicated.'
      }
    ],
    checklist: [
      { id: 1, text: 'Obtain ECFMG Certification (Prerequisite for Step 3 registration)' },
      { id: 2, text: 'Apply for Step 3 at FSMB.org ($925 registration fee)' },
      { id: 3, text: 'Select a US state board for registration (Connecticut/Texas/Federation)' },
      { id: 4, text: 'Complete UWorld Step 3 Qbank (focus on outpatient & inpatient management)' },
      { id: 5, text: 'Practice 100+ cases on CCSCases.com until average score is >75%' },
      { id: 6, text: 'Pass Step 3 and update your ERAS profile for H-1B visa eligibility' }
    ],
    tips: [
      'Pass Step 3 before January of your application season if seeking H-1B visa sponsorship',
      'CCSCases.com is significantly better for case software practice than UWorld interactive cases',
      'Day 1 tests heavy biostatistics and ethics — review Divine Interventions biostats lectures',
      'Do not neglect health maintenance orders (e.g. mammogram, colonoscopy, flu vaccine) in CCS cases'
    ],
    resources: [
      { title: 'FSMB Step 3 Registration', url: 'https://www.fsmb.org/step-3', type: 'website' },
      { title: 'CCSCases.com Interactive Prep', url: 'https://www.ccscases.com', type: 'website' },
      { title: 'UWorld Step 3 QBank', url: 'https://www.uworld.com', type: 'website' }
    ],
    faq: [
      {
        question: 'Do I need ECFMG certification to register for Step 3?',
        answer: 'Yes! IMGs must be officially ECFMG certified before FSMB allows Step 3 registration.'
      },
      {
        question: 'Can I take Step 3 in my home country?',
        answer: 'No. Step 3 is administered EXCLUSIVELY at Prometric centers inside the United States and US territories (e.g., Puerto Rico, Guam).'
      }
    ]
  },

  // ─── ECFMG PATHWAYS 2026 ──────────────────────────────────────────────
  ecfmg_pathways: {
    title: 'ECFMG Certification & 2026 Pathways Guide',
    overview:
      'ECFMG certification is REQUIRED for IMGs to enter US residency programs. The 2026 Pathways fulfill the clinical/communication skills component of certification via MyIntealth.',
    sections: [
      {
        title: '1. What Are ECFMG Pathways?',
        content:
          'Pathways were established by ECFMG to evaluate clinical and communication skills after the permanent cancellation of Step 2 CS. Candidates must meet requirements under ONE of the 6 Pathways to earn ECFMG certification.'
      },
      {
        title: '2. Summary of the 6 ECFMG Pathways',
        content:
          '• Pathway 1: Already Licensed to Practice Medicine in Another Country.\n• Pathway 2: Already Passed an OSCA (Objective Structured Clinical Assessment) for Licensure.\n• Pathway 3: Medical School Accredited by an Agency Recognized by WFME.\n• Pathway 4: Medical School Authorized for Attestation of Clinical Skills.\n• Pathway 5: Graduation from a Joint U.S. Degree Program.\n• Pathway 6: Evaluation of Clinical Skills by Licensed Physicians (Mini-CEX evaluations).'
      },
      {
        title: '3. Communication Skills & OET Requirement',
        content:
          'All pathway applicants must demonstrate English language proficiency by passing the Occupational English Test (OET) Medicine with a minimum score of 350 in Listening, Reading, Writing, and Speaking.'
      }
    ],
    checklist: [
      { id: 1, text: 'Pass USMLE Step 1' },
      { id: 2, text: 'Pass USMLE Step 2 CK' },
      { id: 3, text: 'Achieve ≥350 in all 4 sections of OET Medicine' },
      { id: 4, text: 'Determine eligible ECFMG Pathway (1–6)' },
      { id: 5, text: 'Submit MyIntealth Pathway Application' },
      { id: 6, text: 'Receive ECFMG Certificate by Jan 31, 2026 deadline' }
    ],
    tips: [
      'Apply as early as MyIntealth opens (August) to prevent processing delays',
      'Pathways certification expires after 3 years unless you enter an ACGME residency'
    ],
    resources: [
      { title: 'ECFMG Pathways Official', url: 'https://www.ecfmg.org/certification-pathways', type: 'website' }
    ]
  },

  // ─── OET MEDICINE ─────────────────────────────────────────────────────
  oet_medicine: {
    title: 'OET Medicine Mastery Guide',
    overview:
      'Detailed strategy to achieve ≥350 in Listening, Reading, Writing, and Speaking for ECFMG Certification.',
    sections: [
      {
        title: '1. OET Score Requirements',
        content:
          'ECFMG requires a minimum grade of B (score 350 out of 500) in all four sub-tests:\n• Listening: ≥350\n• Reading: ≥350\n• Writing: ≥350 (Referral Letter focus)\n• Speaking: ≥350 (Clinical Consultation roleplay)'
      },
      {
        title: '2. Preparation & Common Pitfalls',
        content:
          'Writing: Use standard clinical referral letter format (salutation, patient background, history, current presentation, plan).\nSpeaking: Demonstrate empathy, active listening, and clear communication techniques.'
      }
    ],
    checklist: [
      { id: 1, text: 'Book OET Medicine test date' },
      { id: 2, text: 'Practice 10+ official referral writing samples' },
      { id: 3, text: 'Conduct mock clinical speaking roleplays with a partner' },
      { id: 4, text: 'Achieve ≥350 in all 4 sub-tests' },
      { id: 5, text: 'Release scores to ECFMG via OET portal' }
    ],
    tips: [
      'Writing is the most common failed sub-test — keep referral letters under 200 words and stick to relevant clinical facts'
    ],
    resources: [
      { title: 'OET Official Website', url: 'https://www.occupationalenglishtest.org', type: 'website' }
    ]
  },

  // ─── US CLINICAL EXPERIENCE (USCE) ────────────────────────────────────
  clinical_experience: {
    title: 'US Clinical Experience (USCE) Master Strategy',
    overview:
      'How to secure hands-on electives, externships, and clinical rotations at US teaching hospitals to earn strong hospital-letterhead LORs.',
    sections: [
      {
        title: '1. Types of USCE',
        content:
          '• Hands-On Elective: Best quality (for medical students). Direct patient management under attending supervision.\n• Hands-On Externship: Excellent for graduates. Clinical management in outpatient/inpatient settings.\n• Observership: Shadowing only (no patient contact/EMR access). Useful for networking but weighted lower by program directors.'
      },
      {
        title: '2. How to Secure USCE',
        content:
          '• VSLO / VSAS for medical students.\n• Direct university hospital application (FIU, Cleveland Clinic, Cook County, Mayo, Harvard).\n• Cold emailing department chairs, program directors, and alumni.\n• Vetted clinical placement agencies (AmerClerkships, USMLE Mind, Chicago Clerkships).'
      }
    ],
    checklist: [
      { id: 1, text: 'Secure 3+ months of US Clinical Experience (at least 2 months hands-on)' },
      { id: 2, text: 'Obtain 3 specialty-specific LORs on US hospital letterhead' },
      { id: 3, text: 'Request LOR writers to comment directly on your clinical competence and team communication' }
    ],
    tips: [
      'Hands-on rotations carry 3x more weight than shadowing observerships',
      'Always request your LOR in person during the final week of your rotation'
    ],
    resources: [
      { title: 'MatchaMD Observerships Directory', url: '/IMGPrograms?tab=observerships', type: 'website' }
    ]
  },

  // ─── MEDICAL RESEARCH ─────────────────────────────────────────────────
  research: {
    title: 'Medical Research & Publication Guide for IMGs',
    overview:
      'Strategy for publishing papers, securing post-doc research fellowships, and building a competitive academic portfolio for US Match.',
    sections: [
      {
        title: '1. Why Research Matters for IMGs',
        content:
          'Research publications demonstrate academic productivity, critical thinking, and commitment to specialty advancement — particularly vital for competitive specialties (Surgery, Neuro, Cardio, Radiology) and university programs.'
      },
      {
        title: '2. Types of Feasible Research Projects',
        content:
          '• Systematic Reviews & Meta-Analyses (Can be written remotely with software like RevMan / Covidence).\n• Case Reports & Case Series (Fastest turnaround to PubMed indexing).\n• Clinical Retrospective Studies & Database Analysis (HCUP / NIS datasets).'
      }
    ],
    checklist: [
      { id: 1, text: 'Publish at least 2–5 peer-reviewed PubMed-indexed papers' },
      { id: 2, text: 'Present abstracts or posters at national US conferences (ACP, AHA, ACC, RSNA)' },
      { id: 3, text: 'Build ResearchGate and Google Scholar profiles' }
    ],
    tips: [
      'Ensure your articles are indexed in PubMed/MEDLINE for ERAS verification',
      'Cold email PIs with specific ideas and a CV highlighting data analysis skills'
    ],
    resources: [
      { title: 'PubMed Central', url: 'https://pubmed.ncbi.nlm.nih.gov', type: 'website' }
    ]
  },

  // ─── ERAS APPLICATION ────────────────────────────────────────────────
  eras_registration: {
    title: 'ERAS Application & Program Signaling Strategy',
    overview:
      'Everything you need to master MyERAS CV sections, geographic preferences, program signaling, and submission deadlines.',
    sections: [
      {
        title: '1. Key Components of MyERAS Application',
        content:
          '• 10 Experiences Section (3 Key Experiences marked as Most Meaningful).\n• Geographic Preferences (Select up to 3 Census Regions + setting preference: urban, suburban, rural).\n• Program Signals (Gold and Silver signals to express high interest to target programs).'
      },
      {
        title: '2. Program Signaling Master Rules',
        content:
          'Signals double or triple your interview invitation rate! Signal programs where your Step 2 score and visa status align with historical IMG intake.'
      }
    ],
    checklist: [
      { id: 1, text: 'Purchase ERAS Token via MyIntealth' },
      { id: 2, text: 'Complete 10 Experiences section with bulleted impact statements' },
      { id: 3, text: 'Allocate Gold and Silver Program Signals strategically' },
      { id: 4, text: 'Submit ERAS application by September 24' }
    ],
    tips: [
      'Never waste signals on safety programs that do not sponsor visas',
      'Submit ERAS on day 1 (Sept 24) — late applications miss initial interview waves'
    ],
    resources: [
      { title: 'AAMC MyERAS Portal', url: 'https://students-residents.aamc.org/applying-residencies-eras', type: 'website' }
    ]
  },

  // ─── PERSONAL STATEMENT ───────────────────────────────────────────────
  personal_statement: {
    title: 'Personal Statement Writing Guide for IMGs',
    overview:
      'How to craft a compelling, 1-page personal statement that hooks program directors and highlights your unique journey as an IMG.',
    sections: [
      {
        title: '1. Recommended Structure (1 Page, 500–700 words)',
        content:
          '• Paragraph 1: The Hook — An engaging clinical vignette or formative moment that sparked your interest.\n• Paragraph 2: Clinical & Academic Development — Highlight specific clinical achievements, USCE, and problem-solving skills.\n• Paragraph 3: Research & Resilience — Discuss scholarly work, overcoming challenges, or adaptiveness.\n• Paragraph 4: Why This Specialty & Future Goals — Clear vision of your career aspirations (academic clinician, global health leader).\n• Paragraph 5: What You Bring to the Residency — Cultural competence, work ethic, and teamwork.'
      }
    ],
    checklist: [
      { id: 1, text: 'Draft 1-page statement (under 750 words)' },
      { id: 2, text: 'Proofread for native English grammar, spelling, and tone' },
      { id: 3, text: 'Tailor custom versions for specific program signals if applicable' }
    ],
    tips: [
      'Avoid cliché openings ("Ever since I was 5 years old...")',
      'Show, don\'t tell: describe specific patient interactions'
    ],
    resources: [
      { title: 'AAMC Personal Statement Tips', url: 'https://students-residents.aamc.org', type: 'website' }
    ]
  },

  // ─── LETTERS OF RECOMMENDATION (LORS) ──────────────────────────────────
  lors: {
    title: 'Letters of Recommendation (LoR) Strategy',
    overview:
      'How to secure 3–4 strong, waived US hospital-letterhead LORs that convince program directors of your clinical competence.',
    sections: [
      {
        title: '1. LOR Requirements',
        content:
          'Programs require 3 to 4 LORs. At least 2 should come from US clinical attendings in your specialty of choice. Always WAIVE your right to view the letter — non-waived letters carry significantly less weight.'
      }
    ],
    checklist: [
      { id: 1, text: 'Request 4 waived LORs from US attending physicians' },
      { id: 2, text: 'Provide writers with your CV, Personal Statement, and ERAS Letter Request Form' },
      { id: 3, text: 'Confirm letters uploaded to ERAS LoRP prior to Sept 15' }
    ],
    tips: [
      'Waived letters are trusted by program directors; non-waived letters are heavily discounted'
    ],
    resources: [
      { title: 'ERAS Letter of Recommendation Portal (LoRP)', url: 'https://students-residents.aamc.org', type: 'website' }
    ]
  },

  // ─── PROGRAM RESEARCH & SIGNALING ─────────────────────────────────────
  program_research: {
    title: 'Program Selection & Signaling Strategy',
    overview:
      'Methodology to filter IMG-friendly programs, evaluate Step cutoffs and visa sponsorship, and maximize interview yield.',
    sections: [
      {
        title: '1. Filtering Criteria for IMGs',
        content:
          '• Visa Sponsorship: J-1 vs H-1B vs Green Card/US Citizen.\n• IMG Percentage: Look for programs with >40% IMG residents.\n• Step 2 CK Minimum Cutoffs: Ensure your score is above their published threshold.\n• YOG Cutoff: Ensure your graduation year meets their 3–5 year rule.'
      }
    ],
    checklist: [
      { id: 1, text: 'Filter programs on MatchaMD Directory by visa and Step score fit' },
      { id: 2, text: 'Build target list of 80–150 programs' },
      { id: 3, text: 'Assign Gold and Silver Program Signals' }
    ],
    tips: [
      'Use MatchaMD Directory to instantly filter programs matching your visa and Step 2 CK score'
    ],
    resources: [
      { title: 'MatchaMD Program Directory', url: '/IMGPrograms', type: 'website' }
    ]
  },

  // ─── INTERVIEW PREPARATION ───────────────────────────────────────────
  interviews: {
    title: 'Residency Interview Mastery for IMGs',
    overview:
      'Comprehensive guide to virtual interview technology, common questions, behavioral answers (STAR method), and post-interview etiquette.',
    sections: [
      {
        title: '1. Virtual Setup Checklist',
        content:
          '1080p webcam at eye level, ring light illumination, clean backdrop, ethernet connection, external microphone, professional suit.'
      },
      {
        title: '2. Top 5 Questions You MUST Master',
        content:
          '1. "Tell me about yourself." (2-minute elevator pitch).\n2. "Why our program?" (Specific faculty, clinical tracks, patient population).\n3. "Tell me about a difficult patient or clinical mistake." (STAR method).\n4. "Why should we choose you over a US graduate?" (Adaptability, work ethic, high volume clinical experience).\n5. "Where do you see yourself in 5–10 years?"'
      }
    ],
    checklist: [
      { id: 1, text: 'Set up high-definition camera, lighting, and audio' },
      { id: 2, text: 'Conduct 3+ mock interviews with mentors or peers' },
      { id: 3, text: 'Prepare 5 specific questions to ask interviewers at each program' },
      { id: 4, text: 'Send concise thank you emails within 24–48 hours of interview' }
    ],
    tips: [
      'Structure behavioral answers using STAR: Situation, Task, Action, Result'
    ],
    resources: [
      { title: 'MatchaMD Mentors Mock Interview', url: '/Mentors', type: 'website' }
    ]
  },

  // ─── NRMP MATCH & SOAP ────────────────────────────────────────────────
  nrmp_match: {
    title: 'NRMP Match & SOAP Survival Guide',
    overview:
      'Rank Order List strategy, algorithm mechanics, and step-by-step preparation for SOAP (Supplemental Offer and Acceptance Program).',
    sections: [
      {
        title: '1. Golden Rule of Ranking',
        content:
          'Rank programs in order of your TRUE preference — NOT where you think you have the highest chance. The NRMP algorithm is applicant-proposing and mathematically favors your preferred choices.'
      },
      {
        title: '2. SOAP Preparation for Unmatched Applicants',
        content:
          'If unmatched on Match Monday, SOAP allows you to apply for unfilled residency positions in 4 rapid rounds.'
      }
    ],
    checklist: [
      { id: 1, text: 'Register for NRMP Match ($90 fee)' },
      { id: 2, text: 'Submit Rank Order List (ROL) before March deadline' },
      { id: 3, text: 'Prepare SOAP documents in advance just in case' }
    ],
    tips: [
      'Never rank a program you would not be willing to train at for 3–5 years'
    ],
    resources: [
      { title: 'NRMP Official Match Website', url: 'https://www.nrmp.org', type: 'website' }
    ]
  },

  // ─── VISA GUIDE (J-1 VS H-1B) ──────────────────────────────────────────
  visa: {
    title: 'J-1 vs H-1B Visa Guide for IMGs',
    overview:
      'Detailed breakdown of ECFMG J-1 Exchange Visitor vs H-1B Specialty Worker visas, Step 3 requirements, and Conrad 30 waivers.',
    sections: [
      {
        title: '1. J-1 Exchange Visitor Visa (ECFMG Sponsored)',
        content:
          '• Sponsor: ECFMG.\n• Requirements: Passed Step 1, Step 2 CK, Statement of Need from home country Ministry of Health.\n• 212(e) Rule: Requires returning to home country for 2 years after residency OR obtaining a Conrad 30 waiver.'
      },
      {
        title: '2. H-1B Specialty Occupation Visa',
        content:
          '• Sponsor: Individual hospital/institution.\n• Requirements: Passed Step 1, Step 2 CK, AND USMLE Step 3 before Match.\n• Benefits: No 2-year home country requirement, direct path to permanent residency (Green Card).'
      }
    ],
    checklist: [
      { id: 1, text: 'Determine home country Statement of Need eligibility for J-1' },
      { id: 2, text: 'If targeting H-1B, pass USMLE Step 3 prior to ROL deadline' },
      { id: 3, text: 'Verify program visa sponsorship on MatchaMD directory' }
    ],
    tips: [
      'H-1B requires Step 3 passed BEFORE program rank lists are finalized'
    ],
    resources: [
      { title: 'ECFMG EVSP (J-1 Visa Portal)', url: 'https://www.ecfmg.org/evsp', type: 'website' },
      { title: 'USCIS H-1B Info', url: 'https://www.uscis.gov', type: 'website' }
    ]
  }
};

/**
 * Get guide content object by ID with fallback.
 */
export function getGuideContent(guideId) {
  if (!guideId) return guideContent.ecfmg_pathways;
  return guideContent[guideId] || {
    title: guideId.replace(/_/g, ' ').toUpperCase(),
    overview: 'Comprehensive guidance and checklist for this match step.',
    checklist: [
      { id: 1, text: 'Review step requirements and official guidelines' },
      { id: 2, text: 'Complete required documentation and score milestones' },
      { id: 3, text: 'Save progress and update your MatchaMD profile' }
    ],
    tips: ['Keep your records updated', 'Check official source websites for deadline shifts'],
    resources: [{ title: 'MatchaMD Directory', url: '/IMGPrograms', type: 'website' }]
  };
}
