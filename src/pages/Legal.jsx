import React from 'react';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle, Mail, Globe } from 'lucide-react';

export default function Legal() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header title="Legal & Privacy" showBack />

      <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Disclaimer */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <CardTitle>Important Disclaimer</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <p>
              <strong>FMG Pathway is an informational resource only.</strong> We are not affiliated with, endorsed by, or officially connected to ECFMG, USMLE, NRMP, AAMC, or any other official medical licensing or matching organization.
            </p>
            <p>
              All information provided is for educational purposes. While we strive for accuracy, official policies and requirements change frequently. <strong>Always verify information with official sources</strong> including:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>ECFMG.org for certification requirements</li>
              <li>USMLE.org for exam information</li>
              <li>NRMP.org for Match process details</li>
              <li>AAMC.org for ERAS application</li>
            </ul>
            <p className="text-amber-700 dark:text-amber-400 font-medium">
              We are not responsible for decisions made based on information from this platform. Consult official resources and licensed advisors for critical decisions.
            </p>
          </CardContent>
        </Card>

        {/* Privacy Policy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <CardTitle>Privacy Policy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <div>
              <h3 className="font-semibold mb-2">Data Collection</h3>
              <p>We collect:</p>
              <ul className="list-disc ml-6 mt-1 space-y-1">
                <li>Profile information (name, location, medical school, goals)</li>
                <li>Progress tracking data (completed steps, notes)</li>
                <li>Community activity (posts, comments, likes)</li>
                <li>Usage analytics (page views, feature usage)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Data Usage</h3>
              <p>Your data is used to:</p>
              <ul className="list-disc ml-6 mt-1 space-y-1">
                <li>Personalize your experience and recommendations</li>
                <li>Track your progress through FMG pathways</li>
                <li>Connect you with mentors and community members</li>
                <li>Improve our platform and features</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Data Protection</h3>
              <p>We implement industry-standard security measures:</p>
              <ul className="list-disc ml-6 mt-1 space-y-1">
                <li>Encrypted data transmission (SSL/TLS)</li>
                <li>Secure authentication and password hashing</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal information</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Data Sharing</h3>
              <p>We do NOT sell your personal data. We may share anonymized, aggregated data for research purposes. Your profile information may be visible to other community members based on your privacy settings.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Your Rights (GDPR Compliance)</h3>
              <p>You have the right to:</p>
              <ul className="list-disc ml-6 mt-1 space-y-1">
                <li>Access your personal data</li>
                <li>Request data correction or deletion</li>
                <li>Export your data in portable format</li>
                <li>Withdraw consent at any time</li>
                <li>Lodge complaints with supervisory authorities</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">International Users</h3>
              <p>
                FMG Pathway is available globally. By using our platform, you consent to data processing in accordance with this privacy policy, regardless of your location. We comply with applicable data protection regulations including GDPR for European users.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Terms of Service */}
        <Card>
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <div>
              <h3 className="font-semibold mb-2">Acceptable Use</h3>
              <p>You agree to:</p>
              <ul className="list-disc ml-6 mt-1 space-y-1">
                <li>Provide accurate registration information</li>
                <li>Use the platform for lawful purposes only</li>
                <li>Respect other users and maintain professional conduct</li>
                <li>Not share copyrighted content without permission</li>
                <li>Not attempt to access unauthorized areas or data</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Content Ownership</h3>
              <p>
                You retain ownership of content you post. By posting, you grant FMG Pathway a non-exclusive license to display, distribute, and moderate your content. We reserve the right to remove content that violates our community guidelines.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Limitation of Liability</h3>
              <p>
                FMG Pathway is provided "as is" without warranties. We are not liable for decisions made based on platform information, technical issues, or data loss. Your use of the platform is at your own risk.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Changes to Terms</h3>
              <p>
                We may update these terms periodically. Continued use of the platform after changes constitutes acceptance of new terms.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-600" />
              <CardTitle>Contact & Support</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <p>For questions about privacy, terms, or data requests:</p>
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <a href="mailto:support@fmgpathway.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                support@fmgpathway.com
              </a>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Based in United States • Serving FMGs worldwide</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
              Last updated: January 19, 2026
            </p>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}