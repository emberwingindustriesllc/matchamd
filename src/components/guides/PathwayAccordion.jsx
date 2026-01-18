import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const officialLinks = {
  ecfmg: { title: 'ECFMG Official', url: 'https://www.ecfmg.org', description: 'Educational Commission for Foreign Medical Graduates' },
  usmle: { title: 'USMLE Official', url: 'https://www.usmle.org', description: 'United States Medical Licensing Examination' },
  eras: { title: 'ERAS for IMGs', url: 'https://students-residents.aamc.org/eras', description: 'Electronic Residency Application Service' },
  nrmp: { title: 'NRMP Official', url: 'https://www.nrmp.org', description: 'National Resident Matching Program' },
  oet: { title: 'OET Medicine', url: 'https://www.occupationalenglishtest.org', description: 'Occupational English Test' },
  amcas: { title: 'AMCAS', url: 'https://students-residents.aamc.org/applying-medical-school-amcas', description: 'American Medical College Application Service' },
  myintrhealth: { title: 'MyIntrHealth', url: 'https://www.myintrhealth.com', description: 'Occupational health requirements for medical professionals' }
};

export default function PathwayAccordion({ pathway, steps, progressList, icon: Icon, color }) {
  const [expandedStep, setExpandedStep] = useState(null);
  const navigate = useNavigate();

  const getStepStatus = (stepId) => {
    const progress = progressList.find(p => p.module_id === stepId);
    return progress?.status || 'not_started';
  };

  const getStepProgress = (stepId) => {
    const progress = progressList.find(p => p.module_id === stepId);
    return progress?.completion_percentage || 0;
  };

  const completedCount = steps.filter(s => getStepStatus(s.id) === 'completed').length;
  const overallProgress = (completedCount / steps.length) * 100;

  const getRelevantLinks = (stepId) => {
    if (stepId.includes('ecfmg')) return [officialLinks.ecfmg, officialLinks.myintrhealth];
    if (stepId.includes('step1') || stepId.includes('step2')) return [officialLinks.usmle];
    if (stepId.includes('oet')) return [officialLinks.oet];
    if (stepId.includes('eras')) return [officialLinks.eras];
    if (stepId.includes('nrmp') || stepId.includes('match')) return [officialLinks.nrmp];
    if (stepId.includes('amcas')) return [officialLinks.amcas];
    return [];
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-br ${color} p-5 text-white`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{pathway} Pathway</h3>
            <p className="text-white/80 text-sm">
              {completedCount} of {steps.length} steps completed
            </p>
          </div>
        </div>
        <Progress value={overallProgress} className="h-2 bg-white/20" />
      </div>

      {/* Steps */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {steps.map((step, idx) => {
          const status = getStepStatus(step.id);
          const progress = getStepProgress(step.id);
          const isExpanded = expandedStep === step.id;
          const links = getRelevantLinks(step.id);

          return (
            <div key={step.id}>
              <button
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                className="w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : status === 'in_progress' ? (
                      <Clock className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-800 dark:text-white">
                        {idx + 1}. {step.title}
                      </h4>
                      {step.deadline && (
                        <Badge variant="outline" className="text-xs">
                          {step.deadline}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {step.description}
                    </p>
                    {status === 'in_progress' && (
                      <div className="mt-2">
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    )}
                  </div>

                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      {/* Official Resources */}
                      {links.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                          <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">
                            📚 Official Resources
                          </p>
                          <div className="space-y-2">
                            {links.map((link, i) => (
                              <a
                                key={i}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                <ExternalLink className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <div>
                                  <div className="font-medium">{link.title}</div>
                                  <div className="text-xs text-slate-600 dark:text-slate-400">
                                    {link.description}
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(createPageUrl(`GuideDetail?id=${step.id}&pathway=${pathway.toLowerCase()}`))}
                          className="flex-1 rounded-xl"
                        >
                          View Guide
                        </Button>
                        {status === 'not_started' && (
                          <Button
                            onClick={() => navigate(createPageUrl(`GuideDetail?id=${step.id}&pathway=${pathway.toLowerCase()}`))}
                            variant="outline"
                            className="flex-1 rounded-xl"
                          >
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}