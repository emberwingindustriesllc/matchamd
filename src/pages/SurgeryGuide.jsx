import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Scissors,
  Users,
  TrendingUp,
  BookOpen,
  Target,
  FileText,
  Award,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import PremiumGate from '@/components/premium/PremiumGate';

const surgeryContent = {
  overview: {
    title: 'Surgery Residency Overview',
    content: 'General surgery is one of the most competitive specialties for IMGs. Understanding the application process, program expectations, and IMG-friendly strategies is crucial for success.',
    stats: [
      { label: 'IMG Match Rate', value: '42%', trend: 'down' },
      { label: 'Avg Step 2 CK', value: '245', trend: 'up' },
      { label: 'Positions', value: '1,200+', trend: 'neutral' },
      { label: 'Programs', value: '270+', trend: 'neutral' }
    ]
  },
  sections: [
    {
      id: 'requirements',
      title: 'Requirements & Competitive Profile',
      icon: Target,
      content: [
        {
          subtitle: 'USMLE Score Targets',
          items: [
            'Step 1: Pass (if scored: 230+)',
            'Step 2 CK: 245+ highly recommended for IMGs',
            'Step 3: Not required for application, helpful if passed'
          ]
        },
        {
          subtitle: 'Clinical Experience',
          items: [
            'US clinical experience (USCE) - minimum 3 months strongly recommended',
            'Surgery observerships or externships',
            'Letters of recommendation from US surgeons (3-4 required)',
            'Research experience beneficial but not required'
          ]
        },
        {
          subtitle: 'Red Flags to Avoid',
          items: [
            'Multiple Step exam attempts',
            'Long gaps in training',
            'Lack of US clinical experience',
            'Weak letters of recommendation'
          ]
        }
      ]
    },
    {
      id: 'application',
      title: 'Application Strategy',
      icon: FileText,
      content: [
        {
          subtitle: 'Program Selection',
          items: [
            'Apply broadly: 80-120 programs recommended for IMGs',
            'Target community programs - often more IMG-friendly',
            'Research visa sponsorship (J-1 vs H-1B)',
            'Consider geographic preferences carefully',
            'Mix of reach, target, and safety programs'
          ]
        },
        {
          subtitle: 'ERAS Application Timeline',
          items: [
            'June-July: Finalize USCE, request letters',
            'September 15: ERAS opens for submission',
            'October: Interview invitations begin',
            'November-January: Interview season',
            'February: Rank order list submission',
            'March: Match Day'
          ]
        },
        {
          subtitle: 'Personal Statement Tips',
          items: [
            'Explain your journey to surgery clearly',
            'Highlight unique experiences and strengths',
            'Address any gaps or concerns proactively',
            'Show commitment to underserved communities',
            'Keep it concise: 1 page maximum'
          ]
        }
      ]
    },
    {
      id: 'interviews',
      title: 'Interview Preparation',
      icon: Users,
      content: [
        {
          subtitle: 'Common Interview Questions',
          items: [
            '"Why surgery?" - Have a compelling story',
            '"Why our program?" - Research thoroughly',
            '"Tell me about yourself" - 2-minute elevator pitch',
            '"Describe a challenging patient case"',
            '"What are your career goals?"',
            '"How do you handle stress?"'
          ]
        },
        {
          subtitle: 'Virtual Interview Tips',
          items: [
            'Test technology 30 minutes before',
            'Professional background and lighting',
            'Business professional attire',
            'Have questions prepared for the program',
            'Send thank-you emails within 24 hours'
          ]
        }
      ]
    },
    {
      id: 'img-friendly',
      title: 'IMG-Friendly Programs',
      icon: Award,
      content: [
        {
          subtitle: 'Characteristics to Look For',
          items: [
            'High percentage of IMG residents (>50%)',
            'History of matching IMGs',
            'J-1 and H-1B visa sponsorship',
            'Community-based programs',
            'Programs in underserved areas',
            'Newer or expanding programs'
          ]
        },
        {
          subtitle: 'Research Resources',
          items: [
            'FREIDA database (AMA)',
            'Program websites - resident roster',
            'IMG-friendly program lists (Reddit, SDN)',
            'Match data from NRMP',
            'Network with current IMG residents'
          ]
        }
      ]
    },
    {
      id: 'backup',
      title: 'Backup Plans & Alternative Pathways',
      icon: AlertCircle,
      content: [
        {
          subtitle: 'If You Don\'t Match',
          items: [
            'SOAP (Supplemental Offer and Acceptance Program)',
            'Consider preliminary surgery positions',
            'Research positions to strengthen application',
            'Additional USCE in surgery',
            'Retake Step exams if needed for higher scores',
            'Apply to less competitive specialties as backup'
          ]
        },
        {
          subtitle: 'Alternative Surgical Specialties',
          items: [
            'Preliminary Surgery (1 year) → Reapply',
            'General Surgery residency → Fellowship',
            'Consider: Urology, Orthopedics, ENT (all very competitive)',
            'Less competitive: Physical Medicine & Rehabilitation'
          ]
        }
      ]
    }
  ]
};

export default function SurgeryGuide() {
  const { user } = useAuth();


  const { data: purchases = [] } = useQuery({
    queryKey: ['purchases', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('purchased_content').select('*').eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const hasPurchased = purchases.some(p => p.content_id === 'specialty_surgery');

  if (!hasPurchased) {
    return (
      <PremiumGate
        title="Surgery Specialty Guide"
        description="Comprehensive guide for IMG applicants to surgical residency programs"
        price={3.99}
        features={[
          'IMG-specific application strategies',
          'List of IMG-friendly surgery programs',
          'Interview preparation & common questions',
          'USMLE score targets and requirements',
          'Backup plans and alternative pathways'
        ]}
        contentId="specialty_surgery"
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Surgery Specialty Guide" showBack />

      <main className="px-4 py-6 max-w-4xl mx-auto pb-safe">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-[rgba(var(--color-primary),0.05)] to-[rgba(var(--color-secondary),0.1)] dark:from-[rgba(var(--color-primary),0.1)] dark:to-[rgba(var(--color-secondary),0.2)] border-[rgba(var(--color-primary),0.2)] dark:border-[rgba(var(--color-primary),0.4)]">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] flex items-center justify-center shadow-lg">
                  <Scissors className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {surgeryContent.overview.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    IMG-focused application guide
                  </p>
                </div>
              </div>

              <p className="text-slate-700 dark:text-slate-300 mb-6">
                {surgeryContent.overview.content}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {surgeryContent.overview.stats.map((stat, idx) => (
                  <div key={idx} className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Sections */}
        <Accordion type="single" collapsible className="space-y-4">
          {surgeryContent.sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card>
                  <AccordionItem value={section.id} className="border-none">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[rgba(var(--color-primary),0.1)] dark:bg-[rgba(var(--color-primary),0.2)] flex items-center justify-center">
                          <Icon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white text-left">
                          {section.title}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <div className="space-y-6">
                        {section.content.map((subsection, subIdx) => (
                          <div key={subIdx}>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                              {subsection.subtitle}
                            </h4>
                            <ul className="space-y-2">
                              {subsection.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <span className="text-[rgb(var(--color-primary))] mt-1">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Card>
              </motion.div>
            );
          })}
        </Accordion>

        {/* Resources */}
        <Card className="mt-8 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              Additional Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>• AMA FREIDA: freida.ama-assn.org</p>
            <p>• NRMP Match Data: nrmp.org</p>
            <p>• Student Doctor Network Surgery Forums</p>
            <p>• Reddit: r/IMGreddit, r/surgery</p>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}