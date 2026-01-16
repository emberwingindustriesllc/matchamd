import React from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Card } from '@/components/ui/card';
import { AlertCircle, Shield, Lock, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Legal() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header title="Legal & Privacy" showBack />

      <main className="px-4 py-6 max-w-2xl mx-auto">
        <Tabs defaultValue="disclaimer" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="disclaimer">Disclaimer</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="terms">Terms</TabsTrigger>
          </TabsList>

          <TabsContent value="disclaimer">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6 border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-2">
                      Important Legal Disclaimer
                    </h2>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      FMG Pathway is an informational and educational platform only. The content provided is NOT medical, legal, or immigration advice.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  What This App Is NOT
                </h3>
                <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span><strong>NOT Medical Advice:</strong> This app does not provide medical advice, diagnosis, or treatment recommendations. Always consult qualified healthcare professionals.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span><strong>NOT Legal Advice:</strong> Information about visa status, immigration, or legal requirements is for educational purposes only. Consult licensed immigration attorneys.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span><strong>NOT Official Guidance:</strong> This is not affiliated with ECFMG, NRMP, AAMC, or any medical licensing body. Always verify information with official sources.</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Official Resources</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>ECFMG Certification:</strong> <a href="https://www.ecfmg.org" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">ecfmg.org</a></p>
                  <p><strong>NRMP Match:</strong> <a href="https://www.nrmp.org" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">nrmp.org</a></p>
                  <p><strong>Immigration (USCIS):</strong> <a href="https://www.uscis.gov" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">uscis.gov</a></p>
                  <p><strong>Medical Licensing:</strong> Contact your state medical board</p>
                </div>
              </Card>

              <Card className="p-6 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-semibold text-lg mb-3">No Guarantees</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  While we strive for accuracy, we make no guarantees about completeness, reliability, or suitability of the information. Users are responsible for verifying all information independently. The app creators and contributors assume no liability for decisions made based on this content.
                </p>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="privacy">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-xl font-bold">Privacy Policy</h2>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Last Updated: January 2026
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Data We Collect</h3>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <li>• Profile information (name, email, location, medical school)</li>
                      <li>• Progress tracking (completed steps, saved content)</li>
                      <li>• Community posts and interactions</li>
                      <li>• Usage analytics (pages viewed, features used)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">How We Use Your Data</h3>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <li>• Personalize your experience and recommendations</li>
                      <li>• Connect you with relevant mentors and peers</li>
                      <li>• Improve app features and content</li>
                      <li>• Send important updates and deadline reminders</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Data Protection</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      We implement industry-standard security measures to protect your data. All data is encrypted in transit and at rest. We comply with GDPR (for EU users) and CCPA (for California residents).
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Your Rights</h3>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <li>• Access your personal data</li>
                      <li>• Request data deletion</li>
                      <li>• Opt-out of marketing communications</li>
                      <li>• Export your data</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Note:</strong> This app does NOT handle protected health information (PHI) under HIPAA. We do not collect medical records or clinical data.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="terms">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-xl font-bold">Terms of Service</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Acceptable Use</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                      By using FMG Pathway, you agree to:
                    </p>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <li>• Use the app for lawful, educational purposes only</li>
                      <li>• Not share false or misleading information</li>
                      <li>• Respect other users and maintain professional conduct</li>
                      <li>• Not attempt to access unauthorized areas</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Community Guidelines</h3>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <li>• Posts must be relevant and respectful</li>
                      <li>• No spam, advertising, or self-promotion without permission</li>
                      <li>• Misinformation will be moderated and removed</li>
                      <li>• Medical/legal advice is prohibited; share experiences only</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Premium Subscriptions</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Subscriptions auto-renew unless cancelled. You can cancel anytime from your profile settings. Refunds are provided per our refund policy (7-day guarantee for new subscribers).
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Intellectual Property</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      All content, guides, and materials are owned by FMG Pathway or licensed. You may not reproduce, distribute, or create derivative works without permission.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Limitation of Liability</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      FMG Pathway is provided "as is" without warranties. We are not liable for decisions made based on app content, or any damages resulting from use or inability to use the service.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}