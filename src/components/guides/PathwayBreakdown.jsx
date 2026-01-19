import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  Upload,
  Search,
  MessageCircle
} from 'lucide-react';
import { createPageUrl } from '@/utils';

const pathways = [
  {
    id: 1,
    title: 'Pathway 1: Medical License/Registration',
    eligibility: 'Holds or recently held unsupervised medical license/registration (on/after Jan 1, 2021)',
    description: 'Leverages prior licensure to demonstrate readiness for unsupervised practice. Verifies existing credentials rather than requiring new assessments.',
    requirements: [
      'Full, unrestricted license permitting independent patient care from any country',
      'License must have been valid at any point on or after January 1, 2021 (does not need to be current)',
      'No disciplinary actions against the license',
      'Met all local requirements for practice in the issuing country',
      'Passed USMLE Step 1 and Step 2 CK',
      'OET Medicine scores ≥350 in each sub-test (listening, reading, writing, speaking) from Jan 1, 2024 onwards',
      'Application fee: $925 (non-refundable)'
    ],
    warnings: [
      'CRITICAL: If you failed Step 2 CS one or more times, you MUST use Pathway 6 (not eligible for Pathway 1)',
      'Supervised, training, resident, or restricted licenses do NOT qualify',
      'Provisional licenses only qualify if they explicitly permit unsupervised practice',
      'ECFMG verifies disciplinary history directly with issuing authority - any issues lead to rejection',
      'Name discrepancies may require additional identity proofs',
      'Authority delays can impact verification - submit early (applications opened August 2025)',
      'Initial issuance date can be before 2021, but license must have been active during or after Jan 1, 2021'
    ],
    color: 'from-blue-500 to-indigo-500',
    documents: ['Certificate of Good Standing', 'Letter of Current Professional Status', 'License verification', 'Certified English translations (if needed)', 'Evidence of meeting local regulatory requirements (if requested)'],
    link: 'https://www.ecfmg.org/certification-pathways/pathway-1.html',
    applicationProcess: {
      portal: 'MyIntealth (https://myintealth.ecfmg.org)',
      deadline: 'January 31, 2026 (Eastern Time)',
      completionWindow: '5 days from starting application (or draft deleted)',
      processingTime: 'Initial review ~5 business days + verification time',
      steps: [
        'Log in to MyIntealth portal',
        'Complete general eligibility check',
        'Provide license details: country, authority, dates, status, disciplinary history',
        'Select documentation submission method',
        'Certify information accuracy',
        'Pay $925 non-refundable fee (major credit cards accepted)',
        'Submit application'
      ],
      postSubmission: 'ECFMG assigns case manager; status updates available in portal; may request clarifications'
    },
    documentationMethods: [
      {
        method: 'Direct from Authority (Preferred)',
        pros: 'Fastest verification; preferred for accuracy',
        cons: "Relies on authority's responsiveness",
        deadline: 'January 31, 2026',
        details: 'Sent to licensure@ecfmg.org; must be issued within 90 days of receipt by ECFMG if post-submission, or 90 days of issuance if pre-submission'
      },
      {
        method: 'Upload During Application',
        pros: 'Convenient for applicants',
        cons: 'Potential delays in ECFMG verification',
        deadline: 'Issued within 90 days of submission; verified by Jan 31, 2026',
        details: 'Upload during MyIntealth application; ECFMG conducts primary-source verification'
      },
      {
        method: 'Upload License Copy (Not Recommended)',
        pros: 'Minimal initial effort',
        cons: 'High risk of delays or incomplete verification',
        deadline: 'Authority response by Jan 31, 2026',
        details: 'ECFMG requests verification from authority; no guarantee of timely response'
      }
    ],
    translationService: {
      name: 'Straker Translations (ECFMG Recommended)',
      url: 'https://www.straker.ai/ecfmg',
      note: 'Non-English documents require certified English translations',
      email: 'Contact casemanager@ecfmg.org if your authority is not listed in the dropdown'
    },
    fees: {
      amount: '$925',
      refundable: false,
      note: 'Covers application processing; non-refundable even if ineligible or incomplete. Additional fees charged by authorities are applicant responsibility.'
    },
    timeline: {
      applicationOpened: 'August 2025',
      submissionDeadline: 'January 31, 2026',
      documentDeadline: 'January 31, 2026',
      nrmpRankDeadline: 'Typically March (for 2026 Match)',
      note: 'For 2026 NRMP Match, pathway approval + USMLE passing scores must be finalized and reported to NRMP by rank order list certification deadline'
    },
    integration: {
      ecfmgRequirements: 'Pathway 1 + USMLE Step 1 + Step 2 CK + OET Medicine = ECFMG Certificate',
      certificateValidity: 'Valid until December 31, 2028 (for 2026 pathways)',
      revalidation: 'Same process applies for revalidation of expired pathways',
      nextSteps: 'Enables USMLE Step 3 eligibility and NRMP Match participation',
      matchStats: 'IMGs face ~58% match rate for non-U.S. citizens (NRMP data)'
    },
    expirationNote: 'ECFMG Certificate expires with the pathway (December 31, 2028 for 2026 applicants) unless made indefinite through revalidation',
    keyCitations: [
      { title: 'Requirements for 2026 Pathways for ECFMG Certification', url: 'https://www.ecfmg.org/certification-pathways/' },
      { title: 'ECFMG 2026 Information Booklet', url: 'https://www.ecfmg.org' },
      { title: 'Pathway 1 Official Page', url: 'https://www.ecfmg.org/certification-pathways/pathway-1.html' }
    ]
  },
  {
    id: 2,
    title: 'Pathway 2: Medical School OSCE',
    eligibility: 'School-administered OSCE required by Medical Regulatory Authority (MRA) for licensure',
    description: 'Verifies clinical competence through existing OSCE from your medical school, mandated by your home country\'s MRA for licensure.',
    requirements: [
      'OSCE must be mandatory for ALL students/graduates seeking licensure (not just graduation)',
      'Medical school must be accredited by the MRA or its designated agency',
      'School must be in a country/region WITHOUT WFME-recognized or NCFMEA-comparable accrediting agencies',
      'OSCE mandate must predate 2020 (established before 2020 by MRA)',
      'Graduated on or after January 1, 2023',
      'No Step 2 CS failures (one or more failures redirect to Pathway 6)',
      'Passed USMLE Step 1 and Step 2 CK',
      'OET Medicine scores ≥350 in each sub-test (listening, reading, writing, speaking) from Jan 1, 2024 onwards',
      'Application fee: $925 (non-refundable)'
    ],
    warnings: [
      'CRITICAL: If you failed Step 2 CS one or more times, you MUST use Pathway 6 (not eligible for Pathway 2)',
      'Graduates before January 1, 2023 are NOT eligible',
      'OSCE for graduation purposes only does NOT qualify - must be required for MRA licensure',
      'Schools in WFME/NCFMEA recognized regions are NOT eligible for this pathway',
      'OSCE mandate established after 2019 disqualifies the school',
      'Verify your school is on ECFMG\'s eligible list before applying',
      'Name discrepancies between diploma and application may require additional identity proofs',
      'School response delays can impact verification - coordinate with your institution early'
    ],
    color: 'from-emerald-500 to-teal-500',
    documents: ['Final diploma (for graduates)', 'OSCE Attestation form (for students/non-diploma holders)', 'Certified English translations (if needed)'],
    link: 'https://www.ecfmg.org/certification-pathways/pathway-2.html',
    applicationProcess: {
      portal: 'MyIntealth (https://myintealth.ecfmg.org)',
      deadline: 'January 31, 2026 (Eastern Time)',
      completionWindow: '5 days from starting application (or draft deleted)',
      processingTime: 'Initial review ~5 business days per stage + verification time',
      steps: [
        'Log in to MyIntealth portal',
        'Complete initial eligibility quiz',
        'Proceed to Pathway 2 specific questions',
        'Upload final diploma (graduates) OR coordinate OSCE Attestation form submission from school',
        'Certify information accuracy',
        'Pay $925 non-refundable fee (credit cards only)',
        'Submit application'
      ],
      postSubmission: 'ECFMG assigns case manager for review; status trackable online; may request additional information'
    },
    documentationMethods: [
      {
        method: 'Diploma Upload (For Graduates)',
        pros: 'Direct submission by applicant',
        cons: 'Potential verification delays',
        deadline: 'By January 31, 2026',
        details: 'Upload final diploma with certified English translation if non-English. ECFMG conducts primary-source verification with issuing institution.'
      },
      {
        method: 'OSCE Attestation Form (For Students/Non-Diploma Holders)',
        pros: 'School handles official documentation',
        cons: 'Relies on school timeliness and responsiveness',
        deadline: 'Received by ECFMG by January 31, 2026',
        details: 'Downloadable form completed by school official and sent directly to ECFMG. Applicant coordinates with medical school to ensure timely submission.'
      }
    ],
    translationService: {
      name: 'Straker Translations (ECFMG Recommended)',
      url: 'https://www.straker.ai/ecfmg',
      note: 'Non-English documents require certified English translations',
      email: 'Contact ECFMG if your school is not on the eligible list - additions possible if vetted'
    },
    fees: {
      amount: '$925',
      refundable: false,
      note: 'Covers application processing; non-refundable even if rejected or incomplete. Applicants responsible for any fees charged by institutions.'
    },
    timeline: {
      applicationOpened: 'August 2025',
      submissionDeadline: 'January 31, 2026',
      documentDeadline: 'All docs/verifications received by January 31, 2026',
      nrmpRankDeadline: 'Typically March (for 2026 Match)',
      note: 'For 2026 NRMP Match, full certification (Pathway 2 + USMLE + OET) must be reported to NRMP by rank order list certification deadline'
    },
    integration: {
      ecfmgRequirements: 'Pathway 2 (OSCE) + OET Medicine + USMLE Step 1 + Step 2 CK = ECFMG Certificate',
      certificateValidity: 'Valid until December 31, 2028 (for 2026 pathways)',
      revalidation: 'For expired pathways, similar revalidation process applies',
      nextSteps: 'Enables USMLE Step 3 eligibility and NRMP Match participation',
      matchStats: 'IMGs face ~58% match rate for non-U.S. citizens (NRMP data)'
    },
    schoolEligibility: {
      requirement: 'School must be in non-WFME/NCFMEA regions and MRA-accredited',
      checker: 'Confirm school eligibility via ECFMG\'s official list',
      note: 'Schools can be added if they meet criteria and pass ECFMG vetting process'
    },
    expirationNote: 'ECFMG Certificate expires December 31, 2028 for 2026 applicants unless made indefinite through revalidation',
    keyCitations: [
      { title: 'Requirements for 2026 Pathways for ECFMG Certification', url: 'https://www.ecfmg.org/certification-pathways/' },
      { title: 'ECFMG 2026 Information Booklet', url: 'https://www.ecfmg.org' },
      { title: 'Pathway 2 Official Page', url: 'https://www.ecfmg.org/certification-pathways/pathway-2.html' }
    ]
  },
  {
    id: 3,
    title: 'Pathway 3: WFME-Accredited School',
    eligibility: 'Medical school accredited by WFME-recognized agency',
    description: 'Leverages WFME-recognized accreditation to demonstrate clinical competence through school attestation. Takes precedence over Pathway 4 for dual-eligible schools.',
    requirements: [
      'School must have current accreditation by WFME-recognized agency',
      'Graduated on or after January 1, 2023',
      'Clinical Skills Attestation from authorized school official',
      'No Step 2 CS failures (one or more failures redirect to Pathway 6)',
      'Passed USMLE Step 1 and Step 2 CK',
      'OET Medicine scores ≥350 in each sub-test (listening, reading, writing, speaking) from Jan 1, 2024 onwards',
      'Full compliance with general ECFMG eligibility (no disciplinary history)',
      'Application fee: $925 (non-refundable)'
    ],
    warnings: [
      'CRITICAL: If you failed Step 2 CS one or more times, you MUST use Pathway 6 (not eligible for Pathway 3)',
      'Graduates before January 1, 2023 are NOT eligible',
      'School must be accredited at time of application - verify current status regularly',
      'Timing matters: school must have been accredited when you graduated',
      'Provisional accreditation may not qualify - confirm with ECFMG',
      'Some schools lost/gained accreditation - check WFME Directory frequently',
      'Application auto-deletes if not completed within 5 calendar days of initiation',
      'You are responsible for ensuring school submits attestation on time - ECFMG will not approve without it',
      'Name discrepancies between attestation and ECFMG records may require identity confirmation'
    ],
    color: 'from-purple-500 to-pink-500',
    documents: ['Clinical Skills Attestation (electronic via portal OR paper form)', 'Certified English translations (if needed)', 'Identity confirmation documents (if name discrepancies)'],
    link: 'https://www.ecfmg.org/certification-pathways/pathway-3.html',
    checker: 'https://www.wfme.org/accreditation/accrediting-agencies-status/',
    applicationProcess: {
      portal: 'MyIntealth (https://pathways.myintealth.app/)',
      deadline: 'January 31, 2026 (Eastern Time)',
      completionWindow: '5 calendar days from initiation (or application auto-deletes)',
      processingTime: 'Initial review ~5 business days + document incorporation ~5 days + final evaluation ~5 days (total depends on verification)',
      steps: [
        'Log in to MyIntealth account (or create/claim account)',
        'Complete initial eligibility screening',
        'System confirms school eligibility and routes to Pathway 3',
        'Complete application within 5 calendar days',
        'ECFMG automatically notifies participating schools via Clinical Skills Evaluation Portal',
        'For non-participating schools: download Clinical Skills Attestation form and coordinate with school',
        'Pay $925 non-refundable fee (Visa, MasterCard, Discover, American Express)',
        'Submit application'
      ],
      postSubmission: 'Case manager reviews materials and may request clarifications. Track status via online portal. Ensure school submits attestation by deadline.'
    },
    attestationMethods: [
      {
        method: 'Electronic Attestation (Participating Schools)',
        pros: 'Automated, faster processing, integrated system',
        cons: 'Only for schools in MyIntealth Entity Portal',
        deadline: 'February 15, 2026',
        details: 'ECFMG automatically notifies school after application submission. School submits electronically via Clinical Skills Evaluation and Attestation Portal.'
      },
      {
        method: 'Paper Form Attestation (Non-Participating Schools)',
        pros: 'Available for all WFME-accredited schools',
        cons: 'Manual process, relies on school timeliness, potential delays',
        deadline: 'January 31, 2026',
        details: 'Applicant downloads Clinical Skills Attestation form. School official completes and sends directly to ECFMG. Applicant responsible for ensuring timely submission.'
      }
    ],
    translationService: {
      name: 'Straker Translations (ECFMG Recommended)',
      url: 'https://www.straker.ai/ecfmg',
      note: 'Non-English documents require certified English translations',
      email: 'Contact ECFMG support for unlisted schools or issues'
    },
    fees: {
      amount: '$925',
      refundable: false,
      note: 'Covers application processing; non-refundable even if rejected, withdrawn, or incomplete. Applicants responsible for any school or translation fees.'
    },
    timeline: {
      applicationOpened: 'August 2025',
      submissionDeadline: 'January 31, 2026 (Eastern Time)',
      documentDeadline: 'All documentation by Jan 31, 2026 (or Feb 15 for electronic attestations)',
      nrmpRankDeadline: 'Typically March (for 2026 Match)',
      note: 'For 2026 NRMP Match, ECFMG must finalize pathway outcome, confirm USMLE passing, and report certification to NRMP by rank order list deadline',
      lastRevised: 'August 18, 2025 (subject to change - monitor ECFMG website)'
    },
    integration: {
      ecfmgRequirements: 'Pathway 3 (Clinical Attestation) + OET Medicine + USMLE Step 1 + Step 2 CK = ECFMG Certificate',
      certificateValidity: 'Valid until December 31, 2028 (for 2026 pathways)',
      revalidation: 'For expired pathways, similar application process applies for revalidation',
      nextSteps: 'Enables USMLE Step 3 eligibility, NRMP Match participation, and program interviews',
      matchStats: 'IMGs face ~58% match rate for non-U.S. citizens (NRMP data)'
    },
    schoolEligibility: {
      requirement: 'Current accreditation by WFME-recognized agency',
      checker: 'Check WFME World Directory regularly - new schools may be added throughout season',
      note: 'For dual-eligible schools (Pathway 3 and 4), Pathway 3 takes precedence',
      verification: 'ECFMG performs primary-source verification on all attestations'
    },
    expirationNote: 'ECFMG Certificate expires December 31, 2028 for 2026 applicants unless made indefinite through revalidation',
    keyCitations: [
      { title: 'Requirements for 2026 Pathways for ECFMG Certification', url: 'https://www.ecfmg.org/certification-pathways/' },
      { title: 'ECFMG 2026 Information Booklet', url: 'https://www.ecfmg.org' },
      { title: 'Pathway 3 Official Page', url: 'https://www.ecfmg.org/certification-pathways/pathway-3.html' },
      { title: 'WFME Accreditation Directory', url: 'https://www.wfme.org/accreditation/accrediting-agencies-status/' }
    ]
  },
  {
    id: 4,
    title: 'Pathway 4: NCFMEA-Comparable Accreditation',
    eligibility: 'School accredited by agency comparable to NCFMEA standards',
    requirements: [
      'Similar to Pathway 3 but focuses on comparability determination',
      'ECFMG determines comparability based on specific criteria',
      'Agency must use standards comparable to NCFMEA',
      'Limited to specific accreditation bodies'
    ],
    warnings: [
      'More restrictive than Pathway 3',
      'Not all WFME-recognized agencies qualify',
      'Verify with ECFMG before assuming eligibility'
    ],
    color: 'from-amber-500 to-orange-500',
    documents: ['Accreditation verification', 'School credentials'],
    link: 'https://www.ecfmg.org/certification-pathways/pathway-4.html'
  },
  {
    id: 5,
    title: 'Pathway 5: Joint MD/DO Program',
    eligibility: 'Degree issued jointly with US MD/DO school (LCME/COCA accredited)',
    requirements: [
      'Must be a formal joint degree program',
      'US partner school must be LCME or COCA accredited',
      'Both institutions issue degree jointly',
      'Rare - limited to specific international partnerships'
    ],
    warnings: [
      'Very few programs qualify globally',
      'Affiliate or clinical rotation programs do NOT qualify',
      'Must be true joint degree, not just partnership'
    ],
    color: 'from-rose-500 to-red-500',
    documents: ['Joint degree certificate', 'Both school transcripts'],
    link: 'https://www.ecfmg.org/certification-pathways/pathway-5.html',
    examples: [
      'NYU/Manipal joint program (discontinued)',
      'Limited active programs - verify current status'
    ]
  },
  {
    id: 6,
    title: 'Pathway 6: Mini-CEX Assessments',
    eligibility: 'For those who failed Step 2 CS or ineligible for other pathways',
    requirements: [
      'Minimum 6 Mini-CEX clinical encounters required',
      'Evaluators must be US-licensed physicians',
      'Evaluators must have recent direct patient care experience',
      'Encounters must cover diverse clinical scenarios',
      'All assessments rated satisfactory or better'
    ],
    warnings: [
      'Most documentation-intensive pathway',
      'Finding eligible evaluators can be challenging',
      'All 6 encounters must meet strict criteria',
      'Common reasons for rejection: evaluator not US-licensed, outdated patient care'
    ],
    color: 'from-cyan-500 to-blue-500',
    documents: ['Mini-CEX forms (6)', 'Evaluator credentials', 'Practice setting verification'],
    link: 'https://www.ecfmg.org/certification-pathways/pathway-6.html',
    evaluatorRequirements: [
      'Must hold unrestricted US medical license',
      'Must have direct patient care within past 12 months',
      'Cannot be family member or close personal friend',
      'Must complete official Mini-CEX forms'
    ]
  }
];

export default function PathwayBreakdown() {
  const [expandedPathway, setExpandedPathway] = useState(null);

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          Choose Your Pathway
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Select one of the 6 pathways based on your qualifications
        </p>
      </div>

      {pathways.map((pathway) => (
        <Card key={pathway.id} className="overflow-hidden border-2 border-slate-200 dark:border-slate-700 rounded-2xl">
          <button
            onClick={() => setExpandedPathway(expandedPathway === pathway.id ? null : pathway.id)}
            className="w-full text-left"
          >
            <div className={`bg-gradient-to-r ${pathway.color} p-4 text-white`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1">{pathway.title}</h4>
                  <p className="text-sm text-white/90">{pathway.eligibility}</p>
                </div>
                <motion.div
                  animate={{ rotate: expandedPathway === pathway.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </div>
            </div>
          </button>

          <AnimatePresence>
            {expandedPathway === pathway.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-4">
                  {/* Requirements */}
                  <div>
                    <h5 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Key Requirements
                    </h5>
                    <ul className="space-y-2">
                      {pathway.requirements.map((req, idx) => (
                        <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-600 mt-0.5">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Warnings */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                    <h5 className="font-semibold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Common Pitfalls
                    </h5>
                    <ul className="space-y-1.5">
                      {pathway.warnings.map((warning, idx) => (
                        <li key={idx} className="text-sm text-amber-700 dark:text-amber-300">
                          ⚠️ {warning}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Required Documents */}
                  <div>
                    <h5 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-indigo-600" />
                      Required Documents
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {pathway.documents.map((doc, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Documentation Methods (Pathway 1) */}
                  {pathway.documentationMethods && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <h5 className="font-semibold text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Documentation Submission Options
                      </h5>
                      <div className="space-y-3">
                        {pathway.documentationMethods.map((method, idx) => (
                          <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                            <div className="flex items-start justify-between mb-2">
                              <h6 className="font-semibold text-sm text-slate-800 dark:text-white">
                                {method.method}
                              </h6>
                              <Badge variant="outline" className="text-xs">
                                {method.deadline}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                              {method.details}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-emerald-600 dark:text-emerald-400">✓ Pros:</span>
                                <p className="text-slate-700 dark:text-slate-300">{method.pros}</p>
                              </div>
                              <div>
                                <span className="text-amber-600 dark:text-amber-400">⚠ Cons:</span>
                                <p className="text-slate-700 dark:text-slate-300">{method.cons}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Translation Service (Pathway 1) */}
                  {pathway.translationService && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800">
                      <h5 className="font-semibold text-purple-800 dark:text-purple-400 mb-2">
                        Translation Requirements
                      </h5>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                        {pathway.translationService.note}
                      </p>
                      <a
                        href={pathway.translationService.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300 hover:underline font-medium"
                      >
                        {pathway.translationService.name}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Fees & Expiration (Pathway 1) */}
                  {pathway.fees && (
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                        <h5 className="font-semibold text-amber-800 dark:text-amber-400 mb-1 text-sm">
                          Application Fee
                        </h5>
                        <div className="text-2xl font-bold text-amber-900 dark:text-amber-300 mb-1">
                          {pathway.fees.amount}
                        </div>
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          {pathway.fees.note}
                        </p>
                      </div>
                      <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-3 border border-rose-200 dark:border-rose-800">
                        <h5 className="font-semibold text-rose-800 dark:text-rose-400 mb-1 text-sm flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Certificate Expiration
                        </h5>
                        <p className="text-xs text-rose-700 dark:text-rose-400">
                          {pathway.expirationNote}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Application Process (Pathway 1) */}
                  {pathway.applicationProcess && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
                      <h5 className="font-semibold text-indigo-800 dark:text-indigo-400 mb-3">
                        Application Process & Timeline
                      </h5>
                      <div className="space-y-3">
                        <div className="grid md:grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="font-medium text-indigo-700 dark:text-indigo-300">Portal:</span>
                            <p className="text-indigo-600 dark:text-indigo-400">{pathway.applicationProcess.portal}</p>
                          </div>
                          <div>
                            <span className="font-medium text-indigo-700 dark:text-indigo-300">Deadline:</span>
                            <p className="text-indigo-600 dark:text-indigo-400">{pathway.applicationProcess.deadline}</p>
                          </div>
                          <div>
                            <span className="font-medium text-indigo-700 dark:text-indigo-300">Processing:</span>
                            <p className="text-indigo-600 dark:text-indigo-400">{pathway.applicationProcess.processingTime}</p>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                          <h6 className="font-medium text-xs text-slate-800 dark:text-white mb-2">Application Steps:</h6>
                          <ol className="space-y-1">
                            {pathway.applicationProcess.steps.map((step, idx) => (
                              <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex gap-2">
                                <span className="font-bold text-indigo-600">{idx + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2 border border-blue-300 dark:border-blue-700">
                          <p className="text-xs text-blue-800 dark:text-blue-300">
                            <strong>After Submission:</strong> {pathway.applicationProcess.postSubmission}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Integration & Timeline (Pathway 1) */}
                  {pathway.integration && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                      <h5 className="font-semibold text-green-800 dark:text-green-400 mb-3">
                        Integration with ECFMG Certification
                      </h5>
                      <div className="space-y-2 text-xs">
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-2">
                          <span className="font-medium text-green-700 dark:text-green-300">Complete Requirements:</span>
                          <p className="text-green-600 dark:text-green-400 mt-1">{pathway.integration.ecfmgRequirements}</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2">
                          <div className="bg-white dark:bg-slate-800 rounded-lg p-2">
                            <span className="font-medium text-green-700 dark:text-green-300">Certificate Validity:</span>
                            <p className="text-green-600 dark:text-green-400 mt-1">{pathway.integration.certificateValidity}</p>
                          </div>
                          <div className="bg-white dark:bg-slate-800 rounded-lg p-2">
                            <span className="font-medium text-green-700 dark:text-green-300">Next Steps:</span>
                            <p className="text-green-600 dark:text-green-400 mt-1">{pathway.integration.nextSteps}</p>
                          </div>
                        </div>
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-2 border border-yellow-300 dark:border-yellow-700">
                          <p className="text-yellow-800 dark:text-yellow-300">
                            <strong>Match Stats:</strong> {pathway.integration.matchStats}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key Citations (Pathway 1) */}
                  {pathway.keyCitations && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                      <h5 className="font-semibold text-slate-800 dark:text-white mb-2 text-sm">
                        Official Resources
                      </h5>
                      <div className="space-y-1.5">
                        {pathway.keyCitations.map((citation, idx) => (
                          <a
                            key={idx}
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow text-xs"
                          >
                            <span className="text-slate-700 dark:text-slate-300">{citation.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* School Eligibility (Pathway 2) */}
                  {pathway.schoolEligibility && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800">
                      <h5 className="font-semibold text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        School Eligibility Requirements
                      </h5>
                      <div className="space-y-2 text-xs">
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-2">
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">Geographic Requirement:</span>
                          <p className="text-emerald-600 dark:text-emerald-400 mt-1">{pathway.schoolEligibility.requirement}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-2">
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">Verification:</span>
                          <p className="text-emerald-600 dark:text-emerald-400 mt-1">{pathway.schoolEligibility.checker}</p>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2 border border-blue-300 dark:border-blue-700">
                          <p className="text-blue-800 dark:text-blue-300">
                            📝 {pathway.schoolEligibility.note}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* School Checker (Pathway 3) */}
                  {pathway.checker && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800">
                      <h5 className="font-semibold text-purple-800 dark:text-purple-400 mb-2 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Verify Your School
                      </h5>
                      <a
                        href={pathway.checker}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300 hover:underline font-medium"
                      >
                        Check WFME Accreditation Status
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {pathway.schoolEligibility && (
                        <div className="mt-3 space-y-2 text-xs">
                          <div className="bg-white dark:bg-slate-800 rounded-lg p-2">
                            <p className="text-purple-700 dark:text-purple-300">{pathway.schoolEligibility.note}</p>
                          </div>
                          <div className="bg-white dark:bg-slate-800 rounded-lg p-2">
                            <span className="font-medium text-purple-700 dark:text-purple-300">Verification:</span>
                            <p className="text-purple-600 dark:text-purple-400 mt-1">{pathway.schoolEligibility.verification}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Attestation Methods (Pathway 3) */}
                  {pathway.attestationMethods && (
                    <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4 border border-pink-200 dark:border-pink-800">
                      <h5 className="font-semibold text-pink-800 dark:text-pink-400 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Clinical Skills Attestation Options
                      </h5>
                      <div className="space-y-3">
                        {pathway.attestationMethods.map((method, idx) => (
                          <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-pink-200 dark:border-pink-700">
                            <div className="flex items-start justify-between mb-2">
                              <h6 className="font-semibold text-sm text-slate-800 dark:text-white">
                                {method.method}
                              </h6>
                              <Badge variant="outline" className="text-xs">
                                {method.deadline}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                              {method.details}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-emerald-600 dark:text-emerald-400">✓ Pros:</span>
                                <p className="text-slate-700 dark:text-slate-300">{method.pros}</p>
                              </div>
                              <div>
                                <span className="text-amber-600 dark:text-amber-400">⚠ Cons:</span>
                                <p className="text-slate-700 dark:text-slate-300">{method.cons}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 bg-rose-100 dark:bg-rose-900/30 rounded-lg p-2 border border-rose-300 dark:border-rose-700">
                        <p className="text-xs text-rose-800 dark:text-rose-300">
                          <strong>⚠️ Critical:</strong> You are responsible for ensuring your school submits the attestation on time. ECFMG will not approve your application without it.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Examples (Pathway 5) */}
                  {pathway.examples && (
                    <div>
                      <h5 className="font-semibold text-slate-800 dark:text-white mb-2">
                        Examples of Joint Programs
                      </h5>
                      <ul className="space-y-1">
                        {pathway.examples.map((example, idx) => (
                          <li key={idx} className="text-sm text-slate-600 dark:text-slate-400">
                            • {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Evaluator Requirements (Pathway 6) */}
                  {pathway.evaluatorRequirements && (
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-3">
                      <h5 className="font-semibold text-cyan-800 dark:text-cyan-400 mb-2">
                        Evaluator Requirements
                      </h5>
                      <ul className="space-y-1.5">
                        {pathway.evaluatorRequirements.map((req, idx) => (
                          <li key={idx} className="text-sm text-cyan-700 dark:text-cyan-300">
                            ✓ {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Community Link */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-indigo-600" />
                      <span className="font-semibold text-sm text-indigo-800 dark:text-indigo-300">
                        Share Your Experience
                      </span>
                    </div>
                    <p className="text-xs text-indigo-700 dark:text-indigo-400 mb-2">
                      Connect with others who used Pathway {pathway.id}
                    </p>
                    <Button
                      asChild
                      size="sm"
                      className="w-full rounded-lg"
                      variant="outline"
                    >
                      <a href={createPageUrl('Community')}>
                        Join Community Discussion →
                      </a>
                    </Button>
                  </div>

                  {/* Official Link */}
                  <Button
                    asChild
                    className="w-full rounded-xl"
                    variant="outline"
                  >
                    <a href={pathway.link} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4 mr-2" />
                      View Official Pathway {pathway.id} Details
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      ))}
    </div>
  );
}