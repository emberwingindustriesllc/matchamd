import React, { useState } from 'react';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle, Mail, Globe, FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const PRIVACY_SECTIONS = [
  {
    title: 'Information We Collect',
    content: [
      { subtitle: 'You provide directly', items: ['Account info (email, name)', 'Profile info (country, medical school, USMLE scores, specialty, visa status)', 'Community posts and comments', 'Support messages'] },
      { subtitle: 'Collected automatically', items: ['Device type, OS, and identifiers', 'Usage data (features accessed, progress)', 'General location (country/region from IP)', 'App crash reports and performance data'] },
      { subtitle: 'Payment', items: ['Processed entirely by Stripe — we never store card numbers', 'We receive only: payment status, subscription tier, and a customer ID'] },
    ]
  },
  {
    title: 'How We Use Your Data',
    content: [
      { subtitle: 'We use your data to', items: ['Provide and personalize the app experience', 'Process premium subscription payments', 'Send deadline reminders and service notifications', 'Analyze usage to improve features', 'Detect fraud and maintain security'] },
      { subtitle: 'We do NOT', items: ['Sell your data to third parties', 'Target you with third-party advertising', 'Store patient information or clinical health records'] },
    ]
  },
  {
    title: 'Information Sharing',
    content: [
      { subtitle: 'Service providers (under contract)', items: ['Base44 — app infrastructure and database', 'Stripe — payment processing', 'Apple App Store / Google Play — distribution'] },
      { subtitle: 'Other cases', items: ['Community posts are visible to other registered users', 'Legal requirements or court orders', 'Business transfer (with advance notice to you)'] },
    ]
  },
  {
    title: 'Your Privacy Rights',
    content: [
      { subtitle: 'All users', items: ['Access your personal data', 'Correct inaccurate data', 'Delete your account and data (within 30 days)', 'Request data in portable format', 'Withdraw consent at any time'] },
      { subtitle: 'California residents (CCPA)', items: ['Right to know what data is collected and shared', 'Right to deletion', 'Right to opt out of data sale (we do not sell data)', 'Right to non-discrimination'] },
      { subtitle: 'EU / UK residents (GDPR)', items: ['All rights above, plus:', 'Object to processing based on legitimate interest', 'Lodge a complaint with your local data authority'] },
    ]
  },
  {
    title: 'Data Security & Retention',
    content: [
      { subtitle: 'Security measures', items: ['TLS/HTTPS encryption in transit', 'Encryption at rest', 'Access controls and regular audits'] },
      { subtitle: 'Retention', items: ['Account data: until you delete your account', 'Analytics: up to 24 months (aggregated)', 'Payment records: 7 years (financial compliance)', 'Account deletion processed within 30 days'] },
    ]
  },
];

const TOS_SECTIONS = [
  {
    title: 'Using MatchaMD',
    content: [
      { subtitle: 'You agree to', items: ['Provide accurate registration information', 'Be at least 18 years of age', 'Use the app for lawful purposes only', 'Keep your password confidential'] },
      { subtitle: 'You agree NOT to', items: ['Post patient data or Protected Health Information (PHI)', 'Impersonate any person or institution', 'Use bots or scrapers', 'Post harmful, abusive, or misleading content', 'Attempt to access unauthorized parts of the app'] },
    ]
  },
  {
    title: 'Community Guidelines',
    content: [
      { subtitle: 'Community standards', items: ['Be respectful and constructive', 'Do not share identifying patient information', 'Do not spread misinformation about exams or application processes', 'No harassment, bullying, or discrimination'] },
      { subtitle: 'Moderation', items: ['We reserve the right to remove content violating these guidelines', 'Repeated violations may result in account suspension'] },
    ]
  },
  {
    title: 'Subscriptions & Payments',
    content: [
      { subtitle: 'Free tier', items: ['Program search, checklists, deadline calendar, pathway guides, and community access'] },
      { subtitle: 'Premium subscription', items: ['Auto-renews unless cancelled 24+ hours before renewal date', 'Manage through App Store / Play Store account settings', 'Refunds handled per Apple App Store / Google Play policies'] },
    ]
  },
  {
    title: 'Disclaimers & Liability',
    content: [
      { subtitle: 'Educational use only', items: ['MatchaMD is not affiliated with ECFMG, NRMP, AAMC, ERAS, or any program', 'Nothing in this app is medical, legal, or immigration advice', 'Always verify deadlines and requirements with official sources', 'No guarantee of acceptance to any program'] },
      { subtitle: 'AI Advisor', items: ['The AI advisor provides general educational guidance only', 'It is not a substitute for official ECFMG determination or professional advice'] },
      { subtitle: 'Limitation of liability', items: ['App provided "as is" without warranties', 'We are not liable for decisions made based on app content', 'Maximum liability limited to fees paid in the prior 12 months'] },
    ]
  },
];

function CollapsibleSection({ title, content, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>
      {open && (
        <div className="px-4 pb-5 pt-1 space-y-4 bg-slate-50/50 dark:bg-slate-800/20">
          {content.map((block, i) => (
            <div key={i}>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2">{block.subtitle}</p>
              <ul className="space-y-1.5">
                {block.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Legal() {
  const [tab, setTab] = useState('privacy');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header title="Legal & Privacy" showBack />

      <main className="px-4 py-6 max-w-2xl mx-auto space-y-5">

        {/* Disclaimer banner */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Educational Resource Only</p>
                <p className="text-xs text-amber-700 dark:text-amber-500">
                  MatchaMD is not affiliated with ECFMG, NRMP, AAMC, ERAS, or any residency program.
                  Always verify requirements with official sources. Nothing in this app constitutes medical, legal, or immigration advice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab selector */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
          {[
            { id: 'privacy', label: 'Privacy Policy', icon: Shield },
            { id: 'terms', label: 'Terms of Service', icon: FileText },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === id
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Header card */}
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {tab === 'privacy' ? <Shield className="w-5 h-5 text-indigo-600" /> : <FileText className="w-5 h-5 text-indigo-600" />}
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    {tab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Effective April 5, 2026 · Last updated April 5, 2026</p>
              </div>
              <a
                href={tab === 'privacy' ? 'https://matchamd.app/privacy' : 'https://matchamd.app/terms'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
                  Full version <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Collapsible sections */}
        <div className="space-y-2">
          {(tab === 'privacy' ? PRIVACY_SECTIONS : TOS_SECTIONS).map((section, i) => (
            <CollapsibleSection key={i} title={section.title} content={section.content} index={i} />
          ))}
        </div>

        {/* Contact card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-base">Contact & Data Requests</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              For privacy questions, data access requests, or account deletion:
            </p>
            <a href="mailto:privacy@matchamd.app" className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">privacy@matchamd.app</p>
                <p className="text-xs text-slate-500">We respond within 30 days</p>
              </div>
            </a>
            <a href="mailto:support@matchamd.app" className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">support@matchamd.app</p>
                <p className="text-xs text-slate-500">General support and questions</p>
              </div>
            </a>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Globe className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Based in West Virginia, USA · Serving IMGs worldwide</p>
            </div>
          </CardContent>
        </Card>

      </main>

      <BottomNav />
    </div>
  );
}
