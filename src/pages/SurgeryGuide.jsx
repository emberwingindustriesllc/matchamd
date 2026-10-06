import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { isReviewerAccount } from '@/utils';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Scissors,
  Activity,
  FileText,
  Award,
  AlertTriangle,
  HeartPulse,
  BookOpen,
  Download,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Flame,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import PremiumGate from '@/components/premium/PremiumGate';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

export default function SurgeryGuide() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('match_strategy'); // 'match_strategy' | 'or_protocol' | 'floor_emergencies' | 'lor_statement' | 'interview_mm' | 'pocket_guide'
  const [selectedEmergency, setSelectedEmergency] = useState('oliguria');
  const [selectedVignette, setSelectedVignette] = useState('complication');

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

  const hasPurchased = isReviewerAccount(user) || purchases.some(p => p.content_id === 'specialty_surgery');

  const handleDownloadPocketGuidePDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const primaryColor = [20, 83, 45]; // Emerald 900
      const secondaryColor = [5, 150, 105]; // Emerald 600
      const textColor = [30, 41, 59];

      // Header Banner
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 55, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('MATCHA MD SURGERY GUIDE', margin, 34);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('General Surgery Sub-I & Resident Pocket Guide', pageWidth - margin, 34, { align: 'right' });

      y = 75;

      // Section 1: Pre-Rounding Checklist
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(margin, y, contentWidth, 24, 4, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.text('1. 04:30 AM SURGICAL PRE-ROUNDING CHECKLIST', margin + 10, y + 16);
      y += 34;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...textColor);

      const preRoundItems = [
        '• 04:30 AM: Review overnight vitals (T-max, MAP, pulse, SpO2) and nursing notes.',
        '• Ins & Outs: Total IV fluids infused, PO intake, and accurate urine output (goal > 0.5 mL/kg/hr).',
        '• Drain Outputs: JP/Blake drains volume, color (serous, serosanguinous, bilious, purulent, chylous).',
        '• Abdominal Exam: Soft vs rigid, peritoneal signs, active flatus, bowel movement, tenderness.',
        '• Incision Check: Clean, dry, intact vs erythema, induration, hematoma, or wound dehiscence.'
      ];

      for (const item of preRoundItems) {
        doc.text(item, margin + 8, y);
        y += 15;
      }
      y += 10;

      // Section 2: OR Scrub Protocol & Instrument Quick Reference
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(margin, y, contentWidth, 24, 4, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.text('2. OPERATING ROOM RULES & INSTRUMENT ESSENTIALS', margin + 10, y + 16);
      y += 34;

      const orItems = [
        '• Scrub Nurse Rapport: Introduce yourself before scrubbing, write name & glove size on board.',
        '• Sterile Field: Hands kept between nipples and waist. Never turn your back to the sterile tray.',
        '• Forceps: DeBakey = atraumatic tissue/bowel; Adson with teeth = skin closure; Ferris-Smith = heavy fascia.',
        '• Scissors: Metzenbaum = fine blunt/sharp tissue dissection; Mayo = heavy suture, mesh, and fascia.',
        '• Sutures: 4-0 Monocryl for subcuticular skin; 2-0/3-0 Vicryl for deep tissue; #1 PDS loop for abdominal wall.'
      ];

      for (const item of orItems) {
        doc.text(item, margin + 8, y);
        y += 15;
      }
      y += 10;

      // Section 3: Acute Floor Triage
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(margin, y, contentWidth, 24, 4, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.text('3. ACUTE POST-OP FLOOR EMERGENCY PROTOCOLS', margin + 10, y + 16);
      y += 34;

      const triageItems = [
        '• Oliguria (<0.5 mL/kg/hr x 2h): Flush Foley (rule out mechanical block) -> 500cc bolus -> stop NSAIDs/nephrotoxins.',
        '• Expanding Neck Hematoma: Cut bedside skin sutures immediately to relieve tracheal compression. Do not wait for OR.',
        '• Tachycardia + Hypotension: Hemorrhagic shock until proven otherwise. 2 large bore IVs, type & cross, call senior.',
        '• 5 Ws of Post-Op Fever: Wind (D1-2: atelectasis), Water (D3: UTI), Wound (D5-7: SSI), Walking (D7+: DVT/PE), Wonder Drugs.'
      ];

      for (const item of triageItems) {
        const splitText = doc.splitTextToSize(item, contentWidth - 16);
        doc.text(splitText, margin + 8, y);
        y += splitText.length * 14 + 3;
      }

      // Footer
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 35, pageWidth - margin, pageHeight - 35);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text('MatchaMD Surgery Specialty Guide • Clinical Pocket Card', margin, pageHeight - 20);
      doc.text('Page 1 of 1', pageWidth - margin, pageHeight - 20, { align: 'right' });

      doc.save('MatchaMD_Surgical_SubI_Pocket_Guide.pdf');
      toast.success('Downloaded Surgical Pocket Guide PDF!');
    } catch (err) {
      console.error('PDF error:', err);
      toast.error('Failed to generate PDF');
    }
  };

  if (!hasPurchased) {
    return (
      <PremiumGate
        title="Surgery Specialty Mastery Guide"
        description="Comprehensive clinical roadmap, OR protocol, and match playbook for surgical applicants"
        price={3.99}
        features={[
          'Categorical vs. Preliminary PGY-1 transition strategy',
          'Operating Room (OR) protocol, scrub nurse etiquette & instrument guide',
          'Surgical Sub-I pre-rounding workflows & 4:30 AM timeline',
          'Acute post-operative floor emergency triage protocols',
          'Surgical LOR strategy & annotated personal statement breakdown',
          'Morbidity & Mortality (M&M) interview questions & clinical vignettes',
          'Downloadable Surgical Sub-I Pocket Guide PDF'
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
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white border-emerald-800 shadow-xl overflow-hidden relative">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent)] pointer-events-none" />
            <CardContent className="p-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shadow-lg">
                    <Scissors className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-emerald-500/30 text-emerald-300 border-emerald-400/30 text-xs">
                        High-Yield Surgical Roadmap
                      </Badge>
                      <span className="text-xs text-slate-300">Updated 2026/2027</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      General Surgery Residency Guide
                    </h1>
                  </div>
                </div>

                <Button
                  onClick={handleDownloadPocketGuidePDF}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs flex items-center gap-2 shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Pocket Guide PDF</span>
                </Button>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl mb-5">
                General surgery requires exceptional clinical stamina, technical precision, and strategic application execution. Whether aiming directly for a Categorical spot or leveraging a Preliminary PGY-1 audition year, this comprehensive guide gives you the exact tools to stand out on rounds, in the OR, and during interviews.
              </p>

              {/* High-Yield Match Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
                  <p className="text-2xl font-extrabold text-emerald-400">38%</p>
                  <p className="text-[11px] text-slate-300">Categorical IMG Match</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
                  <p className="text-2xl font-extrabold text-white">64%</p>
                  <p className="text-[11px] text-slate-300">Prelim PGY-1 Match Rate</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
                  <p className="text-2xl font-extrabold text-emerald-400">248+</p>
                  <p className="text-[11px] text-slate-300">Target Step 2 CK</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
                  <p className="text-2xl font-extrabold text-white">1,600+</p>
                  <p className="text-[11px] text-slate-300">Total Positions (Cat + Prelim)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-850 rounded-2xl mb-6">
          {[
            { id: 'match_strategy', label: 'Match Strategy & Prelim Transition', icon: Award },
            { id: 'or_protocol', label: 'OR Protocol & Instruments', icon: Scissors },
            { id: 'floor_emergencies', label: 'Floor Care & Emergencies', icon: HeartPulse },
            { id: 'lor_statement', label: 'LOR & Personal Statement', icon: FileText },
            { id: 'interview_mm', label: 'M&M Interview Vignettes', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-900/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Match Strategy & Prelim Transition */}
        {activeTab === 'match_strategy' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                  <Award className="w-5 h-5 text-emerald-600" />
                  The Categorical vs. Preliminary Surgery Playbook
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-emerald-600 text-white text-[11px]">Categorical Track (5 Years)</Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                      Full 5-year residency leading directly to American Board of Surgery (ABS) board eligibility. Highly competitive for IMGs.
                    </p>
                    <ul className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                      <li>• <strong>Step 2 CK Target:</strong> 248+ (scores below 240 face heavy screening filters).</li>
                      <li>• <strong>LOR Requirement:</strong> 3-4 US board-certified general surgeon letters detailing real OR hands-on aptitude.</li>
                      <li>• <strong>Visa Reality:</strong> Community university-affiliated programs sponsor J-1; selective academic centers sponsor H-1B if Step 3 is completed.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-amber-600 text-white text-[11px]">Preliminary PGY-1 Track (1 Year)</Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                      1-year non-renewable appointment. Over 40% of dedicated prelims successfully transition into open Categorical PGY-2 or PGY-1 spots.
                    </p>
                    <ul className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                      <li>• <strong>Proven Springboard:</strong> Gives IMGs full ACGME operating room case logs and direct attending mentorship.</li>
                      <li>• <strong>Lower Screening Filter:</strong> Accessible with Step 2 CK 230–245.</li>
                      <li>• <strong>Crucial Distinction:</strong> Designate whether the program historically absorbs prelims into categorical spots.</li>
                    </ul>
                  </div>
                </div>

                {/* The 4-Stage Prelim-to-Categorical Roadmap */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    The 4-Stage Prelim-to-Categorical PGY-2 Transition Blueprint
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-xs">July - August: Uncompromising Floor Efficiency</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Pre-round early (04:30 AM), never miss drain outputs or morning labs, write concise notes, and show up to the OR prepared. Scrub nurses and chief residents will vouch for you.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-xs">September - October: Scout Unfilled PGY-2 Positions</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Monitor the APDS (Association of Program Directors in Surgery) Open Residency Positions list, FindAResident, and ACS job board. Openings appear due to specialty switches, research years, or attrition.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-xs">November - December: Secure the PD Recommendation Letter</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Meet with your current surgical Program Director. A single phone call or strong letter from your current PD stating "This resident works like a PGY-2" will secure your transfer.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        4
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-xs">January - March: Finalize Outside or In-House Transfer</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          If an in-house PGY-2 spot opens up, stellar prelims are almost always given first right of refusal before programs search outside.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tab 2: OR Protocol & Instruments */}
        {activeTab === 'or_protocol' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                  <Scissors className="w-5 h-5 text-emerald-600" />
                  Operating Room (OR) Protocol & Instrument Mastery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm text-slate-700 dark:text-slate-300">
                {/* Scrub Nurse Commandments */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    The 5 Cardinal Rules of OR Etiquette
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="font-semibold text-slate-900 dark:text-white mb-1">1. Greet the Scrub Tech & Circulator First</p>
                      <p className="text-slate-600 dark:text-slate-400">
                        Walk into the room 20 minutes before incision. Introduce yourself, hand your glove size (e.g. "Size 7.5 Biogel"), and write your name and level clearly on the board.
                      </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="font-semibold text-slate-900 dark:text-white mb-1">2. Sterility Box (Nipples to Waist)</p>
                      <p className="text-slate-600 dark:text-slate-400">
                        Once scrubbed, keep your hands clasped together strictly between your nipples and your waist. Never let hands drop below the operative table or drift above the chest.
                      </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="font-semibold text-slate-900 dark:text-white mb-1">3. Back-to-Back Movement</p>
                      <p className="text-slate-600 dark:text-slate-400">
                        When navigating around another scrubbed surgeon or nurse, always turn back-to-back. The back of the surgical gown is considered contaminated at all times.
                      </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="font-semibold text-slate-900 dark:text-white mb-1">4. Own Contamination Instantly</p>
                      <p className="text-slate-600 dark:text-slate-400">
                        If your glove touches an unsterile light handle or unsterile drape, speak up immediately: "I contaminated my glove." Step back, break scrub cleanly, and re-glove.
                      </p>
                    </div>
                  </div>
                </div>

                {/* High-Yield Surgical Instruments */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mb-3">
                    Essential Surgical Instrument Reference
                  </h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs mb-1">FORCEPS</p>
                      <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                        <li>• <strong>DeBakey:</strong> Atraumatic, fine longitudinal teeth; used for bowel, vascular, and soft tissue.</li>
                        <li>• <strong>Adson (toothed):</strong> Sharp 1x2 teeth; used exclusively for skin edges during closure.</li>
                        <li>• <strong>Ferris-Smith:</strong> Heavy grip teeth; used for grasping tough abdominal fascia (linea alba).</li>
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs mb-1">SCISSORS & CLAMPS</p>
                      <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                        <li>• <strong>Metzenbaum:</strong> Curved, blunt tip; used strictly for delicate dissection of tissue planes. Never cut suture with Metzenbaums!</li>
                        <li>• <strong>Mayo Scissors:</strong> Heavy straight/curved; used to cut suture, mesh, and tough fascia.</li>
                        <li>• <strong>Kelly / Crile:</strong> Hemostatic clamps for securing bleeders and vessel pedicles.</li>
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs mb-1">RETRACTORS & SUTURE</p>
                      <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                        <li>• <strong>Army-Navy:</strong> Handheld retractor for superficial wound margins and soft tissue.</li>
                        <li>• <strong>Richardson / Deaver:</strong> Deep abdominal wall and pelvic retraction.</li>
                        <li>• <strong>4-0 Monocryl:</strong> Monofilament absorbable running subcuticular skin closure.</li>
                        <li>• <strong>#1 PDS Loop:</strong> Long-acting monofilament for durable midline fascial closure.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tab 3: Floor Care & Emergencies */}
        {activeTab === 'floor_emergencies' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                  <HeartPulse className="w-5 h-5 text-rose-500" />
                  Acute Post-Operative Floor Emergency Triage
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select an acute complication scenario to review immediate diagnostic and therapeutic steps.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Emergency Scenario Selector */}
                <div className="flex flex-wrap gap-2 pb-2">
                  {[
                    { id: 'oliguria', label: '1. Oliguria (< 0.5 mL/kg/hr)' },
                    { id: 'bleeding', label: '2. Post-Op Shock & Bleeding' },
                    { id: 'neck_hematoma', label: '3. Neck Hematoma Airway' },
                    { id: 'fever_5w', label: '4. Post-Op Fever (5 Ws)' },
                    { id: 'ileus_sbo', label: '5. Ileus vs Mechanical SBO' }
                  ].map((scen) => (
                    <button
                      key={scen.id}
                      type="button"
                      onClick={() => setSelectedEmergency(scen.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedEmergency === scen.id
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {scen.label}
                    </button>
                  ))}
                </div>

                {/* Scenario Details Card */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4 text-xs leading-relaxed">
                  {selectedEmergency === 'oliguria' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Protocol: Post-Operative Oliguria (&lt; 0.5 mL/kg/hr for 2 consecutive hours)</span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="font-bold text-slate-900 dark:text-white mb-1">Step 1: Check Foley & Flush</p>
                          <p className="text-slate-600 dark:text-slate-400">
                            Never assume acute tubular necrosis before ruling out mechanical obstruction. Flush Foley catheter with 30-50 mL sterile normal saline to clear blood clots or sediment kinks.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="font-bold text-slate-900 dark:text-white mb-1">Step 2: Fluid Challenge</p>
                          <p className="text-slate-600 dark:text-slate-400">
                            Assess volume status (tachycardia, dry mucous membranes, low CVP). If no pulmonary edema, administer 500 mL IV lactated Ringer’s bolus over 30 minutes.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="font-bold text-slate-900 dark:text-white mb-1">Step 3: Medication Review</p>
                          <p className="text-slate-600 dark:text-slate-400">
                            Check chart for nephrotoxins: discontinue Toradol (ketorolac), check vancomycin trough, and hold ACE inhibitors. If unresponsive, obtain renal ultrasound.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedEmergency === 'bleeding' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                        <Flame className="w-4 h-4" />
                        <span>Protocol: Tachycardia, Hypotension & Hemorrhagic Shock</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">
                        In surgical patients, persistent tachycardia (HR &gt; 100 bpm) is internal hemorrhage until proven otherwise. Do not wait for blood pressure to drop before acting.
                      </p>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <p className="font-semibold text-slate-900 dark:text-white">• Immediate Actions:</p>
                        <p className="text-slate-600 dark:text-slate-400">1. Place 2 large-bore peripheral IV lines (16G or 18G).</p>
                        <p className="text-slate-600 dark:text-slate-400">2. Send STAT Type & Crossmatch for 4 units pRBCs, CBC, PT/INR, PTT, Fibrinogen, and Lactate.</p>
                        <p className="text-slate-600 dark:text-slate-400">3. Check surgical drain bulbs for sudden bright red sanguineous output or expanding wound hematoma.</p>
                        <p className="text-slate-600 dark:text-slate-400">4. Notify senior surgical resident and attending immediately for possible return to OR.</p>
                      </div>
                    </div>
                  )}

                  {selectedEmergency === 'neck_hematoma' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Protocol: Expanding Neck Hematoma Post-Thyroid / Carotid Endarterectomy</span>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-red-900 dark:text-red-300 font-medium">
                        ⚠️ LIFE-THREATENING AIRWAY COMPROMISE: If the patient develops stridor, neck swelling, or dyspnea, CUT BED-SIDE SUTURES IMMEDIATELY.
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">
                        Venous and lymphatic congestion causes rapid laryngeal edema that prevents standard endotracheal intubation. Opening the skin and platysma at the bedside decompresses the trachea and saves the patient’s life before transferring to the OR for formal re-exploration.
                      </p>
                    </div>
                  )}

                  {selectedEmergency === 'fever_5w' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        <Clock className="w-4 h-4" />
                        <span>The Modern 5 Ws of Post-Operative Fever Workup</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="font-bold text-slate-900 dark:text-white">Day 1–2: Wind (Pulmonary)</p>
                          <p className="text-slate-600 dark:text-slate-400">Atelectasis vs early aspiration pneumonia. Rx: Incentive spirometry, deep breathing, early ambulation.</p>
                        </div>
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="font-bold text-slate-900 dark:text-white">Day 3–5: Water (Urinary Tract)</p>
                          <p className="text-slate-600 dark:text-slate-400">Catheter-associated UTI. Rx: Remove Foley catheter, urinalysis, urine culture, targeted antibiotics.</p>
                        </div>
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="font-bold text-slate-900 dark:text-white">Day 5–7: Wound (Surgical Site Infection)</p>
                          <p className="text-slate-600 dark:text-slate-400">Superficial vs deep fascial SSI. Rx: Remove surgical staples, probe wound margins, irrigate and pack open.</p>
                        </div>
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="font-bold text-slate-900 dark:text-white">Day 7+: Walking (DVT / Pulmonary Embolism)</p>
                          <p className="text-slate-600 dark:text-slate-400">Lower extremity edema, pleuritic chest pain. Rx: Duplex ultrasound, CT PE protocol, therapeutic anticoagulation.</p>
                        </div>
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 md:col-span-2">
                          <p className="font-bold text-slate-900 dark:text-white">Anytime: Wonder Drugs</p>
                          <p className="text-slate-600 dark:text-slate-400">Drug-induced fever, Heparin-Induced Thrombocytopenia (HIT - 50% platelet drop), malignant hyperthermia (intraoperative).</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedEmergency === 'ileus_sbo' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                        <Activity className="w-4 h-4" />
                        <span>Differentiating Post-Operative Ileus vs Early Small Bowel Obstruction</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="font-bold text-slate-900 dark:text-white mb-1">Post-Op Ileus (Physiologic)</p>
                          <p className="text-slate-600 dark:text-slate-400 mb-1.5">• Hypoactive or absent bowel sounds.</p>
                          <p className="text-slate-600 dark:text-slate-400 mb-1.5">• Diffuse gas throughout stomach, small bowel, and colon on X-ray.</p>
                          <p className="text-slate-600 dark:text-slate-400">• Rx: Minimize opioids, stop anticholinergics, early chewing gum, ambulation.</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="font-bold text-slate-900 dark:text-white mb-1">Mechanical SBO (Pathologic)</p>
                          <p className="text-slate-600 dark:text-slate-400 mb-1.5">• Hyperactive, high-pitched metallic tinkling rushes with severe cramps.</p>
                          <p className="text-slate-600 dark:text-slate-400 mb-1.5">• Discrete transition point on CT with air-fluid levels and decompressed distal colon.</p>
                          <p className="text-slate-600 dark:text-slate-400">• Rx: NG tube decompression, Gastrografin challenge protocol, surgical review.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tab 4: LOR & Personal Statement */}
        {activeTab === 'lor_statement' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Surgical Letters of Recommendation & Personal Statement Studio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm text-slate-700 dark:text-slate-300">
                {/* LOR Strategy */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm">
                    How Surgical Program Directors Evaluate Letters of Recommendation
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Surgical letters must address four specific criteria that generic medical letters omit:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <strong>1. Physical & Mental Stamina:</strong> Ability to stay focused during 6-hour complex resections and handle back-to-back night call.
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <strong>2. Composure Under Stress:</strong> Staying calm, receptive, and coachable during unexpected intraoperative bleeding.
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <strong>3. OR Nurse & Team Rapport:</strong> Being respectful, humble, and collegial with scrub nurses, circulators, and anesthesiologists.
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <strong>4. Comparative Ranking:</strong> Explicitly stating "Top 5% of sub-interns I have trained over the last 10 years."
                    </div>
                  </div>
                </div>

                {/* Personal Statement Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    Annotated High-Yield Surgical Personal Statement Excerpt
                  </h4>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">The Opening Hook (Clinical Immersion):</p>
                      <p className="italic text-slate-700 dark:text-slate-300">
                        "Standing across the operative table during an emergent laparotomy for acute ischemic colitis, I was struck not by the technical speed of the resection, but by the quiet deliberation required to assess bowel viability. As the attending guided my hands to feel the faint pulsations of the mesenteric arcade, I realized general surgery is defined not merely by what one cuts, but by the judgment to know what must be preserved."
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 font-sans">
                        💡 <strong>Why this works:</strong> Avoids generic childhood passion tropes. Immediately establishes familiarity with high-acuity general surgery pathology and surgical judgment.
                      </p>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Demonstrating Work Ethic & Floor Leadership:</p>
                      <p className="italic text-slate-700 dark:text-slate-300">
                        "During my surgical sub-internship, I quickly learned that excellence in the operating room begins hours earlier on the ward. Arriving at 4:30 AM allowed me to review Jackson-Pratt drain trends, inspect surgical incisions before morning dressings, and anticipate post-operative fever evaluations before chief rounds commenced."
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 font-sans">
                        💡 <strong>Why this works:</strong> Proves the candidate understands the grueling daily realities of a PGY-1 surgery resident.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tab 5: M&M Interview Vignettes */}
        {activeTab === 'interview_mm' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  Surgical Morbidity & Mortality (M&M) Interview Vignettes
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Practice answers to the most rigorous ethical and clinical probing questions asked by Surgical Selection Committees.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 pb-2">
                  {[
                    { id: 'complication', label: '1. Intraoperative Complication' },
                    { id: 'unsafe_order', label: '2. Unsafe Attending Instruction' },
                    { id: 'exhaustion', label: '3. 80-Hour Workweek Stamina' },
                    { id: 'why_gen_surg', label: '4. "Why Gen Surg vs Subspecialty?"' }
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVignette(v.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedVignette === v.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs space-y-3 leading-relaxed">
                  {selectedVignette === 'complication' && (
                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                        Q: "Describe an intraoperative complication you witnessed or experienced, and how you handled it."
                      </h5>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">• High-Yield Strategy:</p>
                        <p className="text-slate-600 dark:text-slate-400">
                          Program directors ask this to test your emotional composure and accountability. Never blame others or panic.
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white pt-1">• Model Response Structure:</p>
                        <p className="text-slate-700 dark:text-slate-300">
                          "During a laparoscopic cholecystectomy, unexpected cystic artery bleeding obscured the Calot's triangle. Rather than blindly grasping with clips, my first reaction was to maintain suction exposure and keep the field clean so the attending could clearly visualize the bleeding point. Following stabilization, we discussed the case during the department M&M conference, focusing on anatomical landmarks and safe energy dissection. This taught me that calm composure and transparent debriefing are vital to surgical safety."
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedVignette === 'unsafe_order' && (
                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                        Q: "What would you do if an attending surgeon asked you to perform an action you felt was unsafe for the patient?"
                      </h5>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">• High-Yield Strategy:</p>
                        <p className="text-slate-600 dark:text-slate-400">
                          Balance patient advocacy with professional respect. Use the "Two-Challenge Rule" (CUS: Concerned, Uncomfortable, Safety).
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white pt-1">• Model Response Structure:</p>
                        <p className="text-slate-700 dark:text-slate-300">
                          "Patient safety is always my primary ethical responsibility. If I believed an instruction was unsafe, I would pause and respectfully state: 'Dr. Smith, for my clarification, I am concerned that doing this step right now might risk damaging the adjacent common bile duct—could you guide me on how you recommend approaching this safely?' Phrasing the question through a learning lens allows the attending to verify the plan without feeling confronted, while immediately halting an unsafe maneuver."
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedVignette === 'exhaustion' && (
                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                        Q: "Surgical residency demands 80-hour workweeks with heavy physical and emotional strain. How will you prevent burnout?"
                      </h5>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">• High-Yield Strategy:</p>
                        <p className="text-slate-600 dark:text-slate-400">
                          Show that you have already proven stamina in high-intensity settings, combined with disciplined personal habits.
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white pt-1">• Model Response Structure:</p>
                        <p className="text-slate-700 dark:text-slate-300">
                          "I developed physical stamina during my surgery clerkships and intensive trauma call rotations by maintaining consistent sleep hygiene, meal preparation, and distance running. Beyond physical endurance, emotional resilience in surgery comes from team camaraderie—checking in on co-interns and debriefing tough outcomes together. Having a strong supportive network and genuine love for the operative discipline keeps me energized every day."
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedVignette === 'why_gen_surg' && (
                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                        Q: "Why General Surgery instead of internal medicine or an integrated surgical subspecialty?"
                      </h5>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">• High-Yield Strategy:</p>
                        <p className="text-slate-600 dark:text-slate-400">
                          Emphasize the breadth of emergency general surgery, surgical critical care, and broad abdominal pathology.
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white pt-1">• Model Response Structure:</p>
                        <p className="text-slate-700 dark:text-slate-300">
                          "General surgery offers an unmatched combination of broad diagnostic mastery, surgical intensive care, and immediate procedural intervention. I am captivated by emergency general surgery and trauma, where surgeons must rapidly stabilize acute abdomens, manage complex perioperative physiology, and provide definitive cure. The comprehensive breadth of general surgery prepares you to manage any acute surgical crisis."
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Resources & Links */}
        <Card className="mt-8 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Official Surgical Applicant Directories & Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <p>
              • <a href="https://apds.org/education-careers/open-positions/" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1">APDS Open Residency Positions <ExternalLink className="w-3 h-3 inline opacity-70" /></a>: Association of Program Directors in Surgery official board for open PGY-1 and PGY-2 positions.
            </p>
            <p>
              • <a href="https://www.facs.org/" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1">American College of Surgeons (ACS) <ExternalLink className="w-3 h-3 inline opacity-70" /></a>: Medical student and resident surgical curriculum, SCORE modules, and research grants.
            </p>
            <p>
              • <a href="https://freida.ama-assn.org/" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1">AMA FREIDA General Surgery Directory <ExternalLink className="w-3 h-3 inline opacity-70" /></a>: Verify J-1 and H-1B visa policies for all 290+ accredited general surgery programs.
            </p>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}