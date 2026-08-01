import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Scissors,
  Users,
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
    title: 'General Surgery Residency IMG Roadmap',
    content: 'General surgery is one of the most rigorous and rewarding paths for International Medical Graduates. To stand out, applicants need a strategic mix of high Step 2 CK scores, hands-on surgical USCE, strong letters of recommendation from US surgeons, and a clear understanding of Categorical vs. Preliminary positions.',
    stats: [
      { label: 'Categorical IMG Match', value: '38%', trend: 'down' },
      { label: 'Target Step 2 CK', value: '248+', trend: 'up' },
      { label: 'Positions (Cat + Prelim)', value: '1,600+', trend: 'neutral' },
      { label: 'Surgical Programs', value: '290+', trend: 'neutral' }
    ]
  },
  sections: [
    {
      id: 'requirements',
      title: 'Requirements & Competitive Profile',
      icon: Target,
      content: [
        {
          subtitle: 'USMLE Score Targets & Thresholds',
          items: [
            'Step 2 CK Target: 248+ is strongly recommended for Categorical General Surgery. Scores below 240 often require applying to Preliminary PGY-1 positions or completing a surgical research fellowship.',
            'Step 1: Pass on first attempt is mandatory. Multiple attempts on Step 1 or Step 2 CK are significant red flags for surgical program directors.',
            'Step 3 Advantage: Passing Step 3 before September 15 is a major asset—it proves clinical readiness and qualifies you for H-1B visa sponsorship at participating programs.'
          ]
        },
        {
          subtitle: 'Categorical vs. Preliminary General Surgery Strategy',
          items: [
            'Categorical Positions: Full 5-year residency leading directly to board eligibility. Highly competitive for IMGs, requiring 245+ Step 2 CK and strong US surgeon LORs.',
            'Preliminary PGY-1 Positions: 1-year non-renewable positions. Prelim spots give IMGs valuable US surgical experience, operating room exposure, and an opportunity to prove clinical excellence.',
            'Prelim-to-Categorical Transition: Over 40% of dedicated preliminary PGY-1 surgery residents successfully transition into open Categorical PGY-2 or PGY-1 spots by demonstrating exceptional work ethic, scrub skills, and team leadership during their prelim year.'
          ]
        },
        {
          subtitle: 'Operating Room (OR) Etiquette & USCE Protocol for IMGs',
          items: [
            'Scrub Nurse Rapport: Introduce yourself to the scrub nurse and circulator BEFORE scrubbing in. Offer your glove size and write your name clearly on the board.',
            'Sterility Standards: Keep hands above waist level and below chest at all times after scrubbing. Never reach across a sterile field without permission.',
            'Pre-Op Patient Preparation: Know your patient inside out—read the pre-op note, imaging findings, lab results (labs, coagulation panel), and indication for surgery before entering the OR.',
            'Knot Tying & Suture Mastery: Practice two-handed, one-handed, and instrument ties until seamless before starting your surgical rotation.'
          ]
        }
      ]
    },
    {
      id: 'application',
      title: 'Application & Personal Statement Strategy',
      icon: FileText,
      content: [
        {
          subtitle: 'Program Selection & Broad Applying',
          items: [
            'Targeting Strategy: Apply to 90–130 programs. Focus on community hospital programs and university-affiliated community centers that historically sponsor J-1 or H-1B visas.',
            'Geographic Flexibility: Be willing to train anywhere in the US. Midwestern, Southern, and Upstate New York programs frequently offer strong preliminary and categorical IMG opportunities.',
            'Letters of Recommendation (LORs): Secure 3-4 letters from US board-certified general surgeons who can attest to your technical aptitude, clinical judgment, and stamina in the OR.'
          ]
        },
        {
          subtitle: 'Surgical Personal Statement Framework',
          items: [
            'The Hook: Begin with a vivid, specific clinical case in the OR that sparked your passion for general surgery—focus on surgical decision-making rather than simple fascination with procedures.',
            'Demonstrating Stamina & Teamwork: Highlight experiences that prove physical endurance, emotional resilience, and effective communication with nurses, anesthesiologists, and floor teams.',
            'Addressing Setbacks: If you have graduation gaps or non-traditional training paths, frame them around continuous learning, surgical research, or volunteer emergency medicine work.',
            'Exemplar Opening Paragraph: "Standing at the operating table during an emergency laparotomy for a ruptured appendicitis, I witnessed the immediate, transformative power of surgical intervention. As the attending guided my hands to achieve suction and exposure, I realized general surgery demands both technical precision and calm composure under extreme pressure."'
          ]
        }
      ]
    },
    {
      id: 'interviews',
      title: 'Surgical Interview Scenarios & M&M',
      icon: Users,
      content: [
        {
          subtitle: 'High-Yield Surgical Interview Questions',
          items: [
            '"Why General Surgery instead of a surgical subspecialty?" - Focus on broad abdominal pathology, emergency general surgery, and comprehensive perioperative care.',
            '"How do you handle high mortality or surgical complications?" - Discuss Morbidity & Mortality (M&M) principles: objective case analysis, root-cause identification, and zero personal defensive bias.',
            '"Describe a time when an intraoperative complication occurred." - Highlight immediate calm communication with attending, patient stabilization, and post-op transparent disclosure.'
          ]
        },
        {
          subtitle: 'Post-Op Fever Triage Scenario (The 5 Ws)',
          items: [
            'Wind (Day 1-2): Atelectasis / pneumonia — encourage incentive spirometry and chest physiotherapy.',
            'Water (Day 3-5): Urinary tract infection (UTI) — check Foley catheter, urinalysis, and urine culture.',
            'Wound (Day 5-7): Surgical site infection — inspect wound site, check for erythema, purulence, or dehiscence.',
            'Walking (Day 7+): Deep vein thrombosis (DVT) / PE — evaluate lower extremity edema, ultrasound, start anticoagulation.',
            'Wonder Drugs (Anytime): Drug fever, IV line infection, or transfusion reaction.'
          ]
        }
      ]
    },
    {
      id: 'img-friendly',
      title: 'Surgical Research & Academic Growth',
      icon: Award,
      content: [
        {
          subtitle: 'Publishing Surgical Research as an IMG',
          items: [
            'Case Reports & Case Series: Partner with US attending surgeons to write up rare surgical presentations, innovative operative techniques, or unusual post-op complications.',
            'Surgical Conferences: Submit abstracts to major surgical meetings including the American College of Surgeons (ACS Clinical Congress), SAGES, and regional surgical societies.',
            'Systematic Reviews & Meta-Analyses: Conduct high-yield reviews on surgical outcomes, minimally invasive laparoscopic vs robotic techniques, or perioperative bundle interventions.'
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