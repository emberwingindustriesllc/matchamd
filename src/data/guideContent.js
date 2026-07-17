/**
 * Guide body content for every pathway step id.
 * Shape: { title, overview, deadline?, checklist, tips, resources }
 */

export const guideContent = {
  // ─── Residency ─────────────────────────────────────────────
  ecfmg_pathways: {
    title: 'ECFMG Certification Pathways',
    overview:
      'ECFMG certification is REQUIRED for IMGs to enter US residency programs. The 2026 Pathways fulfill the clinical/communication skills component of certification. IMPORTANT: You MUST also pass USMLE Step 1 and Step 2 CK - pathways do NOT substitute for these exams. Apply via MyIntealth portal (launched Aug 2025).',
    deadline: 'January 31, 2026 (Certification Deadline)',
    checklist: [
      { id: 1, text: '✅ Pass USMLE Step 1 (REQUIRED - not part of pathways)' },
      { id: 2, text: '✅ Pass USMLE Step 2 CK (REQUIRED - not part of pathways)' },
      { id: 3, text: 'Pass OET Medicine (min. 350 ALL skills, test Jan 1, 2024+)' },
      { id: 4, text: 'Complete ONE of the 6 Pathways (clinical/communication skills)' },
      { id: 5, text: 'Submit application via MyIntealth portal' },
      { id: 6, text: 'Receive ECFMG certification by Jan 31, 2026 for Match' },
    ],
    tips: [
      'CRITICAL: USMLE Step 1 & Step 2 CK are SEPARATE requirements - must pass both',
      'Pathways only fulfill clinical/communication component - not full certification',
      'OET test date MUST be Jan 1, 2024 or later (older scores not accepted)',
      'Apply early via MyIntealth - verification can take weeks',
      'For 2026 Match: ERAS opens Sept 24, 2025; certification due Jan 31, 2026',
      '2026 Pathways expire Dec 31, 2028 - revalidation needed beyond this date',
      'Pathway 6 is fallback option for those who failed Step 2 CS or ineligible for others',
    ],
    resources: [
      { title: 'ECFMG Official - Pathways Info', url: 'https://www.ecfmg.org/certification-pathways', type: 'website' },
      { title: 'MyIntealth Application Portal', url: 'https://www.ecfmg.org/certification-pathways/myintealth.html', type: 'website' },
      { title: 'OET Medicine Registration', url: 'https://www.occupationalenglishtest.org', type: 'website' },
      { title: 'USMLE Step 1 Info', url: 'https://www.usmle.org/step-1', type: 'website' },
      { title: 'USMLE Step 2 CK Info', url: 'https://www.usmle.org/step-2-ck', type: 'website' },
    ],
  },

  usmle_step1: {
    title: 'USMLE Step 1',
    overview:
      'Step 1 assesses whether you understand and can apply important concepts of the basic sciences to the practice of medicine. Now reported as Pass/Fail. IMGs still need a solid foundation because Step 2 CK scores carry more weight in applications.',
    checklist: [
      { id: 1, text: 'Create USMLE / ECFMG account and obtain ECFMG ID' },
      { id: 2, text: 'Complete content review (First Aid, Pathoma, Sketchy as needed)' },
      { id: 3, text: 'Complete a full Qbank (UWorld or equivalent) with review' },
      { id: 4, text: 'Take practice exams (NBME, UWorld Self-Assessments)' },
      { id: 5, text: 'Schedule exam date with adequate buffer before applications' },
      { id: 6, text: 'Pass Step 1 and save score report' },
    ],
    tips: [
      'Dedicated study period of 2–3 months is common',
      'First Aid + UWorld remains a high-yield combo for many IMGs',
      'Practice timed blocks to build exam stamina',
      'Do not schedule Step 1 so late that a fail blocks Step 2 CK timing',
      'Join study groups for accountability if self-study stalls',
    ],
    resources: [
      { title: 'USMLE Official', url: 'https://www.usmle.org', type: 'website' },
      { title: 'First Aid Team', url: 'https://www.firstaidteam.com', type: 'document' },
      { title: 'UWorld Qbank', url: 'https://www.uworld.com', type: 'website' },
    ],
  },

  usmle_step2: {
    title: 'USMLE Step 2 CK',
    overview:
      'Step 2 CK assesses clinical knowledge through multiple-choice questions. A competitive numeric score is crucial for IMG applications—especially for competitive specialties and university programs.',
    checklist: [
      { id: 1, text: 'Finish Step 1 (or plan dual study carefully if still pending)' },
      { id: 2, text: 'Complete a full Step 2 CK Qbank with thorough review' },
      { id: 3, text: 'Master high-yield clinical algorithms (IM, Surgery, OB, Peds, Psych)' },
      { id: 4, text: 'Take self-assessments and track predicted score range' },
      { id: 5, text: 'Schedule and pass exam with score release before rank season if possible' },
    ],
    tips: [
      'Many IMGs find Step 2 more predictive of interview chances than Step 1 (Pass/Fail)',
      'Clinical rotations and case practice help significantly',
      'Aim above specialty averages published in Charting Outcomes',
      'Leave buffer time for a retake if needed—do not cut it too close to ERAS',
      'Review biostatistics and ethics; they are easy points if practiced',
    ],
    resources: [
      { title: 'USMLE Step 2 CK', url: 'https://www.usmle.org/step-2-ck', type: 'website' },
      { title: 'UWorld Step 2', url: 'https://www.uworld.com', type: 'website' },
      { title: 'Amboss', url: 'https://www.amboss.com', type: 'website' },
      { title: 'NRMP Charting Outcomes', url: 'https://www.nrmp.org/main-residency-match-data', type: 'document' },
    ],
  },

  oet_medicine: {
    title: 'OET Medicine',
    overview:
      'Occupational English Test (Medicine) is required for ECFMG 2026 Pathways communication skills. You need a minimum score of 350 in Listening, Reading, Writing, and Speaking. Test date must be on or after January 1, 2024. Results are used with your pathway application—not as a substitute for USMLE.',
    deadline: 'Plan ahead of Jan 31, 2026 certification deadline (often by late 2025)',
    checklist: [
      { id: 1, text: 'Create OET account and select Medicine profession' },
      { id: 2, text: 'Book a test date on/after Jan 1, 2024 with score-release buffer' },
      { id: 3, text: 'Complete official practice materials for all four skills' },
      { id: 4, text: 'Achieve ≥350 in ALL four sub-tests' },
      { id: 5, text: 'Request official scores be available to ECFMG / MyIntealth' },
      { id: 6, text: 'Save score report for personal and ERAS records' },
    ],
    tips: [
      'Writing and Speaking are the most common fail points—practice referral letters and clinical role-play',
      'You need 350 in every skill; one weak sub-test fails the whole requirement',
      'Schedule early: retakes and score release can take weeks',
      'Align OET timing with your MyIntealth pathway application',
      'Use free OET practice tests before investing in expensive courses',
    ],
    resources: [
      { title: 'OET Official', url: 'https://www.occupationalenglishtest.org', type: 'website' },
      { title: 'OET Practice Tests', url: 'https://www.occupationalenglishtest.org/prepare/practice-tests/', type: 'website' },
      { title: 'ECFMG Pathways', url: 'https://www.ecfmg.org/certification-pathways', type: 'document' },
    ],
  },

  clinical_experience: {
    title: 'US Clinical Experience',
    overview:
      'US Clinical Experience (USCE) demonstrates your ability to work in the US healthcare system and often yields the strongest letters of recommendation. Hands-on externships/sub-internships are typically valued more than pure observerships, especially for competitive specialties.',
    checklist: [
      { id: 1, text: 'Decide observership vs hands-on externship needs for your specialty' },
      { id: 2, text: 'Apply to multiple programs 6–12 months in advance' },
      { id: 3, text: 'Secure at least 2–3 rotations, ideally in your target specialty' },
      { id: 4, text: 'Prioritize sites that write detailed LoRs' },
      { id: 5, text: 'Network professionally with attendings and residents' },
      { id: 6, text: 'Document experiences accurately for ERAS' },
    ],
    tips: [
      'For Surgery and other competitive fields: aim for at least one university/academic rotation',
      'Target programs in geographic regions where you will apply',
      'Be proactive—volunteer for cases, notes (if allowed), and presentations',
      'Ask for letters while the experience is fresh',
      'Beware of scams: verify hospital affiliation and payment policies',
    ],
    resources: [
      { title: 'AMOpportunities', url: 'https://www.amopportunities.org', type: 'website' },
      { title: 'VSLO (AAMC)', url: 'https://students-residents.aamc.org/vslo', type: 'website' },
      { title: 'AMA International Medical Education', url: 'https://www.ama-assn.org/education/international-medical-education', type: 'document' },
    ],
  },

  research: {
    title: 'Research Experience',
    overview:
      'Research strengthens competitive applications. Publications, posters, and ongoing projects show scholarly engagement. Quality and relevance to your specialty usually matter more than raw volume.',
    checklist: [
      { id: 1, text: 'Identify research opportunities in your target specialty' },
      { id: 2, text: 'Join a project (local, remote, or during USCE)' },
      { id: 3, text: 'Aim for tangible outputs (abstract, poster, manuscript)' },
      { id: 4, text: 'Present at conferences when possible' },
      { id: 5, text: 'List research on ERAS with accurate citations and your role' },
    ],
    tips: [
      'One first-author paper often outweighs many low-quality abstracts',
      'Case reports and systematic reviews are realistic entry points',
      'Network with researchers at programs you hope to match into',
      'Be honest about your contribution—interviewers will probe',
      'Join specialty societies for mentorship and project leads',
    ],
    resources: [
      { title: 'ResearchMatch', url: 'https://www.researchmatch.org', type: 'website' },
      { title: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov', type: 'website' },
      { title: 'ACS Resources', url: 'https://www.facs.org', type: 'website' },
    ],
  },

  eras_registration: {
    title: 'ERAS Application',
    overview:
      'The Electronic Residency Application Service (ERAS) is the centralized application system for most residency programs. IMGs typically access MyERAS through ECFMG. Applications are released to programs in September—prepare documents early.',
    deadline: 'September application season (verify yearly AAMC/ECFMG calendar)',
    checklist: [
      { id: 1, text: 'Create/access MyERAS through ECFMG token' },
      { id: 2, text: 'Complete MyERAS application sections carefully' },
      { id: 3, text: 'Upload personal statement(s)' },
      { id: 4, text: 'Request and assign letters of recommendation' },
      { id: 5, text: 'Upload/request USMLE transcript and photo' },
      { id: 6, text: 'Certify and submit application' },
      { id: 7, text: 'Assign documents and programs; track signals if used in your specialty' },
    ],
    tips: [
      'Apply broadly for non-US IMGs—list size varies by specialty competitiveness',
      'Submit as early as practical when programs begin reviewing',
      'Have 3–4 strong letters ready before peak season',
      'Double-check specialty filters, visa, and geographic preferences',
      'Budget application fees with MatchaMD cost tools',
    ],
    resources: [
      { title: 'ERAS for Applicants', url: 'https://students-residents.aamc.org/eras', type: 'website' },
      { title: 'Residency Explorer', url: 'https://www.residencyexplorer.org', type: 'website' },
      { title: 'FREIDA', url: 'https://freida.ama-assn.org', type: 'website' },
    ],
  },

  personal_statement: {
    title: 'Personal Statement',
    overview:
      'Your ERAS personal statement explains why you chose your specialty and why you will succeed in US training. IMGs should show clinical readiness, meaningful experiences (including USCE when available), and a clear narrative—without excuses or negativity about prior systems.',
    checklist: [
      { id: 1, text: 'Define specialty theme and 2–3 supporting stories' },
      { id: 2, text: 'Draft within ERAS character limits (typically ~750–800 words target)' },
      { id: 3, text: 'Highlight US clinical / research experiences that show fit' },
      { id: 4, text: 'Get feedback from a mentor or US physician' },
      { id: 5, text: 'Proofread for grammar, clarity, and tone' },
      { id: 6, text: 'Upload final version to MyERAS and assign to programs' },
    ],
    tips: [
      'Lead with motivation and evidence, not a full life chronology',
      'Avoid repeating your entire CV—highlight insight and growth',
      'One strong statement beats many weak specialty variants',
      'Have a strong English editor review if possible',
      'Do not over-explain visa needs or criticize your home system',
    ],
    resources: [
      { title: 'AAMC Personal Statement Guidance', url: 'https://students-residents.aamc.org/applying-residencies-eras/personal-statement', type: 'website' },
      { title: 'ERAS for Applicants', url: 'https://students-residents.aamc.org/eras', type: 'website' },
    ],
  },

  lors: {
    title: 'Letters of Recommendation',
    overview:
      'Strong LoRs—especially from US physicians in your target specialty—are critical for IMGs. Aim for 3–4 letters. Letters are uploaded confidentially through the ERAS LoR Portal.',
    checklist: [
      { id: 1, text: 'Identify 3–4 letter writers early (ideally during USCE)' },
      { id: 2, text: 'Provide CV, personal statement draft, and talking points' },
      { id: 3, text: 'Request letters in ERAS LoR Portal with correct author details' },
      { id: 4, text: 'Confirm writers submit before programs review applications' },
      { id: 5, text: 'Assign letters to programs (specialty-specific as needed)' },
      { id: 6, text: 'Track which programs received which letters' },
    ],
    tips: [
      'A detailed US letter often outweighs a generic home-country letter',
      'Ask: "Can you write a strong letter?"—accept a soft no gracefully',
      'Chair/PD letters help when authentic, not forced',
      'Never open or edit confidential letters',
      'Start requests 6–8 weeks before you need them submitted',
    ],
    resources: [
      { title: 'ERAS LoR Information', url: 'https://students-residents.aamc.org/eras-tools-and-worksheets-residency-applicants/letters-recommendation', type: 'website' },
      { title: 'AAMC ERAS', url: 'https://students-residents.aamc.org/eras', type: 'website' },
    ],
  },

  program_research: {
    title: 'Program Research',
    overview:
      'IMG-friendly programs vary by specialty, visa sponsorship (J-1/H-1B), score filters, and USCE expectations. Use FREIDA, Residency Explorer, NRMP Charting Outcomes, and MatchaMD program search to build a realistic list with reach, target, and safety tiers.',
    checklist: [
      { id: 1, text: 'Define specialty and geographic preferences' },
      { id: 2, text: 'Filter for J-1 / H-1B sponsorship and historical IMG presence' },
      { id: 3, text: 'Check Step 2 CK expectations and USCE preferences' },
      { id: 4, text: 'Build tiers: reach / target / safety' },
      { id: 5, text: 'Note signaling / geographic preference strategies if applicable' },
      { id: 6, text: 'Export final list for ERAS and track in MatchaMD favorites' },
    ],
    tips: [
      'Prioritize programs with a history of interviewing non-US IMGs',
      'Do not apply only to brand-name university programs',
      'Track application fees vs expected interview yield',
      'Verify visa policies yearly—they change',
      'Use MatchaMD Directory fit scores as a starting point, not the only signal',
    ],
    resources: [
      { title: 'FREIDA', url: 'https://freida.ama-assn.org', type: 'website' },
      { title: 'Residency Explorer', url: 'https://www.residencyexplorer.org', type: 'website' },
      { title: 'NRMP Charting Outcomes', url: 'https://www.nrmp.org/main-residency-match-data', type: 'document' },
    ],
  },

  interviews: {
    title: 'Interview Preparation',
    overview:
      'Interview season typically runs fall through winter. Prepare behavioral stories (STAR), specialty knowledge, visa logistics, and program-specific questions. Virtual interviews remain common—practice tech, lighting, and eye contact.',
    checklist: [
      { id: 1, text: 'Build a story bank for common behavioral questions' },
      { id: 2, text: 'Research each program (mission, strengths, faculty)' },
      { id: 3, text: 'Complete mock interviews with a mentor or course' },
      { id: 4, text: 'Prepare thoughtful questions for interviewers' },
      { id: 5, text: 'Plan logistics (timezone, backup internet, attire)' },
      { id: 6, text: 'Send professional thank-you notes when appropriate' },
    ],
    tips: [
      'Be ready for "Why US?" and "Why this specialty?" with concrete answers',
      'Never badmouth prior schools, colleagues, or countries',
      'Know your application cold—gaps and research will be probed',
      'Rank based on true fit after interviews, not prestige alone',
      'Have a SOAP contingency plan early',
    ],
    resources: [
      { title: 'NRMP', url: 'https://www.nrmp.org', type: 'website' },
      { title: 'AAMC Students & Residents', url: 'https://students-residents.aamc.org', type: 'website' },
    ],
  },

  nrmp_match: {
    title: 'NRMP Match',
    overview:
      'The National Resident Matching Program pairs applicants with residency programs through a computerized algorithm based on rank order lists. Rank your true preferences; the algorithm is applicant-proposing.',
    deadline: 'March Match Week (verify yearly NRMP calendar)',
    checklist: [
      { id: 1, text: 'Register for the NRMP Main Residency Match' },
      { id: 2, text: 'Complete interview season and take notes after each interview' },
      { id: 3, text: 'Build your rank order list honestly' },
      { id: 4, text: 'Certify rank list by the deadline' },
      { id: 5, text: 'Prepare for Match Week / SOAP if needed' },
    ],
    tips: [
      'Rank programs by true preference—not perceived chance',
      'The algorithm favors applicants when both sides rank each other',
      'Have a SOAP backup plan and documents ready',
      'Do not rank a program you would not attend',
      'Join peer support groups for Match Week stress',
    ],
    resources: [
      { title: 'NRMP Official', url: 'https://www.nrmp.org', type: 'website' },
      { title: 'Match Process', url: 'https://www.nrmp.org/match-process', type: 'document' },
      { title: 'Charting Outcomes', url: 'https://www.nrmp.org/main-residency-match-data', type: 'document' },
    ],
  },

  visa: {
    title: 'Visa Planning',
    overview:
      'Most non-US IMGs train on J-1 (ECFMG-sponsored) or, less often, H-1B (program-sponsored). Visa type affects which programs you can apply to, moonlighting rules, and post-training options (including the J-1 two-year home-country requirement and waivers). This is educational guidance—not legal advice.',
    checklist: [
      { id: 1, text: 'Decide J-1 vs H-1B target based on career goals' },
      { id: 2, text: 'Filter programs by published visa sponsorship' },
      { id: 3, text: 'Confirm passport validity and document readiness' },
      { id: 4, text: 'Understand J-1 two-year home residence / waiver paths if relevant' },
      { id: 5, text: 'Coordinate with program GME after Match for DS-2019 / petition' },
      { id: 6, text: 'Budget visa fees, SEVIS, and travel timelines' },
    ],
    tips: [
      'H-1B is limited; many programs only offer J-1',
      'Do not assume "visa sponsored" means H-1B',
      'Ask programs clearly during interviews about historical sponsorship',
      'Start document collection early after Match',
      'Always verify on official ECFMG / State Department / USCIS sources',
    ],
    resources: [
      { title: 'ECFMG J-1 / EVSP', url: 'https://www.ecfmg.org/evsp/', type: 'website' },
      { title: 'US Dept of State J-1', url: 'https://j1visa.state.gov/', type: 'website' },
      { title: 'USCIS H-1B', url: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations', type: 'website' },
    ],
  },

  // ─── Fellowship ────────────────────────────────────────────
  ecfmg_certification: {
    title: 'ECFMG Certification for Fellowship',
    overview:
      'ECFMG certification (or equivalent eligibility documentation) is typically required for IMGs entering ACGME fellowship. Confirm your certificate is current, USMLE requirements for your specialty, and how GME offices verify status before start date.',
    checklist: [
      { id: 1, text: 'Confirm current ECFMG certificate status in the official portal' },
      { id: 2, text: 'Verify USMLE Step requirements for target fellowship' },
      { id: 3, text: 'Ensure medical school credentials remain primary-source verified' },
      { id: 4, text: 'Coordinate certificate reporting with fellowship GME office' },
      { id: 5, text: 'Resolve any name/document discrepancies early' },
    ],
    tips: [
      'Expired pathways or certificates may need revalidation—check dates',
      'Fellowship programs will not finalize onboarding without credentials',
      'Keep PDFs of verification emails and certificate copies',
      'Name mismatches between passport and certificate cause delays',
    ],
    resources: [
      { title: 'ECFMG Certification', url: 'https://www.ecfmg.org/certification/', type: 'website' },
      { title: 'MyIntealth / ECFMG Portals', url: 'https://www.ecfmg.org', type: 'website' },
    ],
  },

  residency_completion: {
    title: 'Residency Completion',
    overview:
      'Most fellowships require successful completion (or near-completion) of an accredited residency in a related specialty. Document training, milestones, and board-eligibility track for applications and verification.',
    checklist: [
      { id: 1, text: 'Confirm ACGME (or equivalent) residency completion timeline' },
      { id: 2, text: 'Request training verification and PD letter' },
      { id: 3, text: 'Collect procedure/case logs if specialty-relevant' },
      { id: 4, text: 'Update CV with residency roles, awards, and research' },
      { id: 5, text: 'Align application year with expected graduation' },
    ],
    tips: [
      'Apply in final year with PD support when common for your specialty',
      'Address any remediation or training gaps proactively',
      'International residency may limit some ACGME fellowship eligibility—verify per specialty',
      'Keep evaluations organized for credentialing',
    ],
    resources: [
      { title: 'ACGME', url: 'https://www.acgme.org', type: 'website' },
      { title: 'NRMP Fellowship Applicants', url: 'https://www.nrmp.org/fellowship-applicants/', type: 'website' },
    ],
  },

  board_eligibility: {
    title: 'Board Eligibility',
    overview:
      'Fellowships and employers expect a clear path to specialty board certification. Know your ABMS member board requirements, exam windows, and how fellowship training affects eligibility.',
    checklist: [
      { id: 1, text: 'Identify your specialty board (ABIM, ABS, ABP, etc.)' },
      { id: 2, text: 'Confirm residency training meets board eligibility rules' },
      { id: 3, text: 'Register for board exams per board timeline if applicable' },
      { id: 4, text: 'Document any international training credit policies' },
      { id: 5, text: 'Discuss board plan with residency/fellowship PD' },
    ],
    tips: [
      'Board rules differ by specialty—do not generalize from peers in other fields',
      'Some fellowships require board-eligible status by start date',
      'Keep exam receipts and eligibility letters organized',
      'Plan study time around fellowship interview season',
    ],
    resources: [
      { title: 'ABMS', url: 'https://www.abms.org', type: 'website' },
      { title: 'ABMS Member Boards', url: 'https://www.abms.org/member-boards/', type: 'website' },
    ],
  },

  fellowship_eras: {
    title: 'Fellowship Application',
    overview:
      'Many fellowships use ERAS; others use SF Match, specialty portals, or Fellowship Council systems. Deadlines and document sets differ by specialty—map your field early and prepare LoRs, personal statement, and program list accordingly.',
    checklist: [
      { id: 1, text: 'Identify match system for your specialty (ERAS/SMS, SF Match, other)' },
      { id: 2, text: 'Create/update application account for the correct cycle' },
      { id: 3, text: 'Request 3–4 specialty LoRs (including PD when appropriate)' },
      { id: 4, text: 'Write fellowship personal statement' },
      { id: 5, text: 'Submit applications by specialty deadline' },
      { id: 6, text: 'Track invitations and interview calendar' },
    ],
    tips: [
      'Deadlines vary widely by specialty—build a calendar first',
      'Research productivity matters more for competitive fellowships',
      'Network at society meetings before application season',
      'Confirm which programs use which match system',
    ],
    resources: [
      { title: 'ERAS', url: 'https://students-residents.aamc.org/eras', type: 'website' },
      { title: 'NRMP SMS', url: 'https://www.nrmp.org/fellowship-applicants/', type: 'website' },
      { title: 'SF Match', url: 'https://www.sfmatch.org', type: 'website' },
    ],
  },

  fellowship_interview: {
    title: 'Fellowship Interviews',
    overview:
      'Fellowship interviews probe clinical maturity, research agenda, career plans, and fit with division culture. Expect discussions of cases, publications, and how you will contribute to the program.',
    checklist: [
      { id: 1, text: 'Prepare research and clinical elevator pitches' },
      { id: 2, text: 'Review faculty research for each program' },
      { id: 3, text: 'Practice case-based and behavioral questions' },
      { id: 4, text: 'Clarify visa and start-date constraints' },
      { id: 5, text: 'Send thank-you notes and update rank notes' },
    ],
    tips: [
      'Have a 5-year career plan that matches the program’s strengths',
      'Know your papers deeply—methods and limitations',
      'Ask about call, research time, and alumni job placement',
      'Be ready to discuss teaching and quality-improvement work',
    ],
    resources: [
      { title: 'NRMP Fellowship Applicants', url: 'https://www.nrmp.org/fellowship-applicants/', type: 'website' },
    ],
  },

  fellowship_match: {
    title: 'Fellowship Match',
    overview:
      'NRMP Specialties Matching Service (SMS) and other systems pair applicants and programs via rank lists. Rank true preference order; understand contingency options if your specialty has them.',
    checklist: [
      { id: 1, text: 'Register for the correct match (NRMP SMS / SF Match / other)' },
      { id: 2, text: 'Complete interviews before finalizing ranks' },
      { id: 3, text: 'Build and certify rank order list by deadline' },
      { id: 4, text: 'Prepare unmatched contingency plan' },
      { id: 5, text: 'Complete post-match onboarding tasks promptly' },
    ],
    tips: [
      'Algorithm favors applicant preference—rank honestly',
      'Confirm program participation in the match you registered for',
      'Track specialty-specific rank deadlines carefully',
      'Do not rank programs you would not attend',
    ],
    resources: [
      { title: 'NRMP SMS', url: 'https://www.nrmp.org/fellowship-applicants/', type: 'website' },
      { title: 'Match Calendars', url: 'https://www.nrmp.org/match-calendars/', type: 'document' },
    ],
  },

  // ─── Med school ────────────────────────────────────────────
  prerequisites: {
    title: 'Prerequisites',
    overview:
      'US MD/DO programs require specific undergraduate coursework (biology, chemistry, organic chemistry, physics, often biochemistry/English/math). International applicants must map home credentials to US expectations and plan transcripts/evaluations carefully.',
    checklist: [
      { id: 1, text: 'List target school prerequisite courses' },
      { id: 2, text: 'Complete or plan missing coursework (US/online if accepted)' },
      { id: 3, text: 'Obtain official transcripts and evaluations if needed' },
      { id: 4, text: 'Plan clinical volunteering / shadowing hours' },
      { id: 5, text: 'Confirm English proficiency requirements per school' },
    ],
    tips: [
      'Requirements vary—build a spreadsheet per school',
      'Some schools do not accept international applicants at all',
      'Lab components for sciences are often mandatory',
      'Start early if you need US post-bacc coursework',
    ],
    resources: [
      { title: 'AAMC Students & Residents', url: 'https://students-residents.aamc.org', type: 'website' },
      { title: 'AACOM (DO)', url: 'https://www.aacom.org', type: 'website' },
    ],
  },

  mcat: {
    title: 'MCAT Exam',
    overview:
      'The MCAT is required by nearly all US MD/DO schools. Competitive scores matter even more for international applicants. Plan 3–6 months of prep and leave buffer for a retake.',
    checklist: [
      { id: 1, text: 'Create AAMC account and learn exam structure' },
      { id: 2, text: 'Take a diagnostic practice exam' },
      { id: 3, text: 'Complete content review + practice questions' },
      { id: 4, text: 'Take official AAMC full-length exams' },
      { id: 5, text: 'Sit exam with score release before your application cycle' },
    ],
    tips: [
      'Aim above school median scores for internationals',
      'CARS is often limiting for non-native English speakers—practice daily',
      'Official AAMC materials are highest yield',
      'Do not sit the exam until practice scores are stable',
    ],
    resources: [
      { title: 'AAMC MCAT', url: 'https://students-residents.aamc.org/mcat', type: 'website' },
      { title: 'MCAT Prep', url: 'https://students-residents.aamc.org/mcat-prep', type: 'website' },
    ],
  },

  amcas: {
    title: 'AMCAS Application',
    overview:
      'AMCAS is the primary application for most US MD schools. Work and activities, coursework entry, personal statement, and letters are core. International applicants should start early for transcript processing. DO schools use AACOMAS; Texas uses TMDSAS.',
    deadline: 'Varies by school (submit early in the cycle)',
    checklist: [
      { id: 1, text: 'Create AMCAS account for the correct cycle year' },
      { id: 2, text: 'Enter coursework and request transcripts' },
      { id: 3, text: 'Complete Work & Activities (including most meaningful)' },
      { id: 4, text: 'Write personal statement' },
      { id: 5, text: 'Assign letter writers' },
      { id: 6, text: 'Submit and monitor verification status' },
    ],
    tips: [
      'Verification can take weeks at peak—submit early',
      'Be precise with international coursework entries',
      'Confirm whether each target school uses AMCAS, AACOMAS, or TMDSAS',
      'Keep copies of all submitted materials',
    ],
    resources: [
      { title: 'AMCAS', url: 'https://students-residents.aamc.org/applying-medical-school-amcas', type: 'website' },
    ],
  },

  secondaries: {
    title: 'Secondary Applications',
    overview:
      'After primary verification, schools send secondary essays. Turnaround speed and quality matter. Pre-write common themes: diversity, adversity, why this school, and future goals.',
    checklist: [
      { id: 1, text: 'Track secondaries in a spreadsheet with deadlines' },
      { id: 2, text: 'Pre-write common essay themes' },
      { id: 3, text: 'Customize each school’s mission fit' },
      { id: 4, text: 'Submit within 1–2 weeks of receipt when possible' },
      { id: 5, text: 'Budget secondary fees strategically' },
    ],
    tips: [
      'Do not copy-paste without school-specific edits',
      'Answer only what is asked; respect word limits',
      'Quality still beats same-day rushed essays',
      'Track fee waivers if eligible',
    ],
    resources: [
      { title: 'AAMC Applying to Medical School', url: 'https://students-residents.aamc.org/applying-medical-school', type: 'website' },
    ],
  },

  med_interviews: {
    title: 'Medical School Interviews',
    overview:
      'Schools use traditional interviews, MMI, or hybrid formats. International applicants should prepare to discuss their path to US training, funding, and cultural adaptability professionally.',
    checklist: [
      { id: 1, text: 'Learn interview format for each school (MMI vs traditional)' },
      { id: 2, text: 'Practice ethics and scenario stations' },
      { id: 3, text: 'Prepare personal journey and "why medicine" narratives' },
      { id: 4, text: 'Plan travel or virtual setup' },
      { id: 5, text: 'Send thank-you notes if appropriate' },
    ],
    tips: [
      'MMI rewards clear structure under time pressure',
      'Know your application experiences in depth',
      'Be ready for funding and visa logistics questions',
      'Practice calm, professional answers about being an international applicant',
    ],
    resources: [
      { title: 'AAMC Students & Residents', url: 'https://students-residents.aamc.org', type: 'website' },
    ],
  },

  financial_proof: {
    title: 'Financial Documentation',
    overview:
      'Many US medical schools require internationals to show ability to fund all years of tuition and living expenses (bank letters, sponsors, or scholarships). This can be a hard gate even with strong academics. US federal loans are generally unavailable to non-citizens.',
    checklist: [
      { id: 1, text: 'Estimate 4-year cost of attendance per school' },
      { id: 2, text: 'Gather bank statements / sponsor affidavits as required' },
      { id: 3, text: 'Research scholarships open to internationals' },
      { id: 4, text: 'Prepare documents for I-20 / visa after acceptance' },
      { id: 5, text: 'Confirm school financial aid policies for non-citizens' },
    ],
    tips: [
      'Start paperwork early—bank letters can take time',
      'Ask admissions for the exact proof-of-funds format',
      'Do not assume aid packages match US citizen options',
      'Keep certified translations when documents are not in English',
    ],
    resources: [
      { title: 'EducationUSA', url: 'https://educationusa.state.gov/', type: 'website' },
      { title: 'AAMC Financial Aid', url: 'https://students-residents.aamc.org/financial-aid', type: 'website' },
    ],
  },

  school_selection: {
    title: 'School Selection',
    overview:
      'Only a subset of MD/DO schools accept international applicants, and seats are limited. Prioritize schools with a history of admitting non-US citizens, clear financial policies, and realistic MCAT/GPA ranges.',
    checklist: [
      { id: 1, text: 'Filter MSAR/school lists for international eligibility' },
      { id: 2, text: 'Check historical international class sizes when available' },
      { id: 3, text: 'Compare total cost and proof-of-funds rules' },
      { id: 4, text: 'Balance reach / target / safety schools' },
      { id: 5, text: 'Confirm state residency restrictions if any' },
    ],
    tips: [
      'MSAR is essential for MD school research',
      'Caribbean/off-shore paths are a separate strategy from US MD/DO',
      'Contact admissions offices for the latest international policies',
      'Track application costs carefully across many schools',
    ],
    resources: [
      { title: 'AAMC MSAR', url: 'https://students-residents.aamc.org/msar', type: 'website' },
      { title: 'AACOM Choose DO', url: 'https://choosedo.org', type: 'website' },
    ],
  },
};

const RICH_GUIDE_IDS = [
  'ecfmg-certification',
  'usmle-step-1',
  'usmle-step-2-ck',
  'research',
  'eras-application',
  'residency-application',
];

const RICH_GUIDE_ALIASES = {
  ecfmg_certification: 'ecfmg-certification',
  ecfmg_pathways: 'ecfmg-certification',
  usmle_step1: 'usmle-step-1',
  usmle_step_1: 'usmle-step-1',
  step1: 'usmle-step-1',
  usmle_step2_ck: 'usmle-step-2-ck',
  usmle_step2: 'usmle-step-2-ck',
  step2: 'usmle-step-2-ck',
  step_2_ck: 'usmle-step-2-ck',
  program_research: 'research',
  research: 'research',
  eras_registration: 'eras-application',
  eras: 'eras-application',
  eras_application: 'eras-application',
  residency_application: 'residency-application',
  match_guide: 'residency-application',
};

let richGuidesData = null;

function getRichGuidesData() {
  if (richGuidesData) return richGuidesData;
  try {
    richGuidesData = require('@/guides/guidesData').guidesData || {};
  } catch (e) {
    console.warn('Rich guide data unavailable:', e);
    richGuidesData = {};
  }
  return richGuidesData;
}

export function getGuideContent(guideId) {
  if (!guideId) return null;
  if (guideContent[guideId]) return guideContent[guideId];
  const richId = RICH_GUIDE_ALIASES[guideId];
  if (richId) {
    const rich = getRichGuidesData()[richId];
    if (rich) {
      const overview = rich.subtitle
        ? `${rich.title}\n\n${rich.subtitle}`
        : rich.title || 'Guide content.';
      const checklist = (rich.sections || [])
        .slice(0, 6)
        .map((section, idx) => ({
          id: idx + 1,
          text: section.heading || `Section ${idx + 1}`,
          completed: false,
        }));
      const tips = (rich.sections || [])
        .slice(0, 5)
        .map(section => `${section.heading}: ${section.content}`)
        .filter(Boolean);
      const resources = (rich.sections || [])
        .slice(-4)
        .map(section => ({
          title: section.heading,
          url: '',
          type: 'guide-section',
        }));
      return { title: rich.title, overview, checklist, tips, resources };
    }
  }
  return null;
}

export function hasGuideContent(guideId) {
  if (!guideId) return false;
  if (guideContent[guideId]) return true;
  return Boolean(RICH_GUIDE_ALIASES[guideId]);
}
