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
    requirements: [
      'License must be unsupervised (training/supervised licenses are NOT eligible)',
      'License can be from any country',
      'License must have been active on or after January 1, 2021',
      'Application fee: $925 (non-refundable)'
    ],
    warnings: [
      'Training licenses or supervised practice permits are commonly rejected',
      'Ensure license is for independent/unsupervised practice',
      'Name discrepancies may require additional identity proofs',
      'Authority delays can impact verification - start early'
    ],
    color: 'from-blue-500 to-indigo-500',
    documents: ['Certificate of Good Standing', 'Letter of Current Professional Status', 'License verification', 'Certified English translations (if needed)'],
    link: 'https://www.ecfmg.org/certification-pathways/pathway-1.html',
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
      note: 'Non-English documents require certified English translations'
    },
    fees: {
      amount: '$925',
      refundable: false,
      note: 'Covers application processing; non-refundable even if ineligible or incomplete'
    },
    expirationNote: 'ECFMG Certificate expires with the pathway (December 31, 2028 for 2026 applicants) unless made indefinite through revalidation'
  },
  {
    id: 2,
    title: 'Pathway 2: Clinical Skills Exam',
    eligibility: 'Passed a standardized clinical skills exam for medical licensure',
    requirements: [
      'Exam must be required for medical licensure (not just graduation)',
      'Accepted exams include: PLAB 2 (UK), AMC CAT (Australia), MCCQE Part II (Canada)',
      'Must be taken for licensure purposes',
      'Score report or certificate required'
    ],
    warnings: [
      'Clinical exams for graduation only do NOT qualify',
      'Verify your exam is on ECFMG accepted list before applying',
      'Some countries have multiple exams - ensure you take the licensure one'
    ],
    color: 'from-emerald-500 to-teal-500',
    documents: ['Exam score report', 'Licensure board confirmation'],
    link: 'https://www.ecfmg.org/certification-pathways/pathway-2.html',
    acceptedExams: [
      { name: 'PLAB Part 2', country: 'United Kingdom', url: 'https://www.gmc-uk.org/registration-and-licensing/join-the-register/plab' },
      { name: 'AMC Clinical Exam', country: 'Australia', url: 'https://www.amc.org.au' },
      { name: 'MCCQE Part II', country: 'Canada', url: 'https://mcc.ca/examinations/mccqe-part-ii/' },
      { name: 'LMCC', country: 'Canada', url: 'https://mcc.ca/examinations/lmcc/' }
    ]
  },
  {
    id: 3,
    title: 'Pathway 3: WFME-Accredited School',
    eligibility: 'Medical school accredited by WFME-recognized agency',
    requirements: [
      'School must have current WFME recognition',
      'For recent graduates: graduated after 2023 if school accredited post-2023',
      'Accreditation must be active at time of application',
      'Check WFME World Directory for your school'
    ],
    warnings: [
      'Timing matters: school must be accredited when you graduated',
      'Some schools lost/gained accreditation - verify current status',
      'Provisional accreditation may not qualify'
    ],
    color: 'from-purple-500 to-pink-500',
    documents: ['Medical school diploma', 'Transcript', 'WFME verification'],
    link: 'https://www.ecfmg.org/certification-pathways/pathway-3.html',
    checker: 'https://www.wfme.org/accreditation/accrediting-agencies-status/'
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

                  {/* Accepted Exams (Pathway 2) */}
                  {pathway.acceptedExams && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                      <h5 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">
                        Accepted Clinical Exams
                      </h5>
                      <div className="space-y-2">
                        {pathway.acceptedExams.map((exam, idx) => (
                          <a
                            key={idx}
                            href={exam.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div>
                              <div className="font-medium text-sm text-slate-800 dark:text-white">
                                {exam.name}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                {exam.country}
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* School Checker (Pathway 3) */}
                  {pathway.checker && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
                      <h5 className="font-semibold text-purple-800 dark:text-purple-400 mb-2 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Verify Your School
                      </h5>
                      <a
                        href={pathway.checker}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300 hover:underline"
                      >
                        Check WFME Accreditation Status
                        <ExternalLink className="w-3 h-3" />
                      </a>
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