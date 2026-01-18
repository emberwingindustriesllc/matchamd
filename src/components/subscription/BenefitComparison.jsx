import React from 'react';
import { Check, X, Zap, Crown, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

const features = [
  { 
    category: 'Core Features',
    items: [
      { name: 'Pathway Guides', free: 'Basic', premium: 'All Guides', pro: 'All Guides + Custom' },
      { name: 'Progress Tracking', free: true, premium: true, pro: true },
      { name: 'Community Access', free: true, premium: true, pro: true },
      { name: 'Notifications', free: 'Basic', premium: 'All', pro: 'Priority' }
    ]
  },
  {
    category: 'Mentorship',
    items: [
      { name: 'Mentor Requests', free: '3/month', premium: 'Unlimited', pro: 'Unlimited + Priority' },
      { name: 'Mentor Directory', free: true, premium: true, pro: true },
      { name: '1-on-1 Sessions', free: false, premium: false, pro: '1/month' },
      { name: 'Direct Messaging', free: false, premium: true, pro: true }
    ]
  },
  {
    category: 'Content & Resources',
    items: [
      { name: 'Specialty Guides', free: false, premium: true, pro: true },
      { name: 'Interview Prep', free: false, premium: 'Materials', pro: 'Materials + Mock' },
      { name: 'CV/PS Templates', free: false, premium: true, pro: true },
      { name: 'Webinars', free: false, premium: 'Recordings', pro: 'Live + Recordings' }
    ]
  },
  {
    category: 'Support',
    items: [
      { name: 'Response Time', free: '48 hours', premium: '24 hours', pro: '2 hours' },
      { name: 'Application Review', free: false, premium: false, pro: true },
      { name: 'Research Assistance', free: false, premium: false, pro: true },
      { name: 'Priority Support', free: false, premium: false, pro: true }
    ]
  }
];

export default function BenefitComparison() {
  const renderValue = (value) => {
    if (value === true) return <Check className="w-5 h-5 text-green-500 mx-auto" />;
    if (value === false) return <X className="w-5 h-5 text-slate-300 mx-auto" />;
    return <span className="text-sm text-slate-700 dark:text-slate-300">{value}</span>;
  };

  return (
    <Card className="p-6 overflow-x-auto">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
        Compare All Features
      </h3>
      
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Feature</th>
            <th className="text-center py-3 px-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Free</span>
              </div>
            </th>
            <th className="text-center py-3 px-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Premium</span>
              </div>
            </th>
            <th className="text-center py-3 px-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Pro</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((category, catIdx) => (
            <React.Fragment key={catIdx}>
              <tr>
                <td colSpan={4} className="pt-6 pb-2">
                  <h4 className="font-semibold text-slate-800 dark:text-white text-sm uppercase tracking-wide">
                    {category.category}
                  </h4>
                </td>
              </tr>
              {category.items.map((item, itemIdx) => (
                <tr key={itemIdx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 text-center">{renderValue(item.free)}</td>
                  <td className="py-3 px-4 text-center">{renderValue(item.premium)}</td>
                  <td className="py-3 px-4 text-center">{renderValue(item.pro)}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </Card>
  );
}