import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Info, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGeolocation } from './useGeolocation';

const LOCATION_TIPS = {
  // By country code
  IN: {
    title: 'Tips for IMGs from India',
    tips: [
      'Complete ECFMG certification early - process can take 3-6 months',
      'OET Medicine accepted as English proficiency test (no TOEFL needed)',
      'Join Indian medical graduate communities for networking',
      'Consider USCE programs in your specialty before applying'
    ],
    visaInfo: 'J-1 visa is most common for Indian IMGs. Start DS-2019 process early.',
    resources: [
      { title: 'ECFMG India', url: 'https://www.ecfmg.org' },
      { title: 'USCE Programs', url: 'https://www.ecfmg.org/certification' }
    ]
  },
  PK: {
    title: 'Tips for IMGs from Pakistan',
    tips: [
      'Verify medical school is WFME-accredited for Pathway 3',
      'OET Medicine scores valid - minimum 350 per sub-test',
      'Network with Pakistani physician associations in US',
      'Research J-1 visa sponsorship programs early'
    ],
    visaInfo: 'J-1 visa requires sponsor certification. Start early to avoid delays.',
    resources: [
      { title: 'APPNA', url: 'https://appna.org' }
    ]
  },
  EG: {
    title: 'Tips for IMGs from Egypt',
    tips: [
      'Ensure Arabic medical documents are professionally translated',
      'OET Medicine or TOEFL required for English proficiency',
      'Egyptian Medical Society of Americas can provide mentorship',
      'Consider observership programs to gain US clinical experience'
    ],
    visaInfo: 'Most Egyptian IMGs use J-1 visa. Processing time: 2-3 months.',
    resources: []
  },
  NG: {
    title: 'Tips for IMGs from Nigeria',
    tips: [
      'Verify WFME accreditation status of your medical school',
      'English proficiency may still be required despite English instruction',
      'Network with Association of Nigerian Physicians in Americas',
      'USCE highly recommended for competitive match'
    ],
    visaInfo: 'J-1 visa processing - allow 3-4 months. H-1B also possible.',
    resources: [
      { title: 'ANPA', url: 'https://anpana.org' }
    ]
  },
  PH: {
    title: 'Tips for IMGs from Philippines',
    tips: [
      'PLE (Philippine Licensure Exam) required for ECFMG certification',
      'Ensure medical school is recognized by ECFMG',
      'Filipino physician networks very active in US',
      'Consider USCE in community hospitals'
    ],
    visaInfo: 'J-1 and H-1B visas both common for Filipino physicians.',
    resources: []
  },
  GB: {
    title: 'Tips for UK Medical Graduates',
    tips: [
      'GMC registration helpful but not required for ECFMG',
      'PLAB scores not transferable to USMLE',
      'Your clinical experience valued - highlight in applications',
      'Consider differences in residency structure (3-7 years)'
    ],
    visaInfo: 'J-1 or H-1B visa. UK citizens may find sponsorship easier.',
    resources: []
  },
  CA: {
    title: 'Tips for Canadian Medical Graduates',
    tips: [
      'ECFMG certification required even for Canadian graduates',
      'Strong clinical experience - emphasize in applications',
      'Geographic proximity advantage for interviews',
      'Consider border state programs'
    ],
    visaInfo: 'TN visa option available for Canadians (faster than J-1/H-1B).',
    resources: []
  },
  DEFAULT: {
    title: 'General Tips for International Medical Graduates',
    tips: [
      'Start ECFMG certification process 12-18 months before Match',
      'USMLE Step 1 & 2 CK required - aim for scores ≥230',
      'US clinical experience strongly recommended',
      'Research visa requirements early (J-1 vs H-1B)'
    ],
    visaInfo: 'Most IMGs use J-1 visa. Research waiver options if applicable.',
    resources: [
      { title: 'ECFMG Website', url: 'https://www.ecfmg.org' },
      { title: 'NRMP IMG Resources', url: 'https://www.nrmp.org' }
    ]
  }
};

export default function LocationAwareTips({ compact = false }) {
  const { location, loading, error } = useGeolocation();

  if (loading) {
    return compact ? null : (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin className="w-4 h-4 animate-pulse" />
            <p className="text-sm">Detecting your location...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !location) {
    return null;
  }

  const countryCode = location.countryCode || 'DEFAULT';
  const tips = LOCATION_TIPS[countryCode] || LOCATION_TIPS.DEFAULT;

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg p-4 border border-indigo-100 dark:border-indigo-900">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {tips.title}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {location.country}
              </Badge>
            </div>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-2">
              💡 {tips.tips[0]}
            </p>
            {tips.visaInfo && (
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1">
                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{tips.visaInfo}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-indigo-200 dark:border-indigo-800">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <CardTitle className="text-lg">{tips.title}</CardTitle>
          <Badge variant="secondary" className="ml-auto">
            {location.country}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">
            Key Tips:
          </h4>
          <ul className="space-y-2">
            {tips.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {tips.visaInfo && (
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-900">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Visa Info:</strong> {tips.visaInfo}
              </p>
            </div>
          </div>
        )}

        {tips.resources.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">
              Helpful Resources:
            </h4>
            <div className="space-y-2">
              {tips.resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  {resource.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}