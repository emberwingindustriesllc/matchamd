import React, { createContext, useContext, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { translations } from './translations';
import { useLocation } from 'react-router-dom';

const LanguageContext = createContext({ 
  t: (key) => key, 
  language: 'en',
  isRTL: false 
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const location = useLocation();
  const isOnboarding = location.pathname.includes('Onboarding');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null),
    retry: false
  });

  const { data: profiles } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: user?.id }),
    enabled: !!user?.id && !isOnboarding,
    staleTime: 5 * 60 * 1000
  });

  const profile = profiles?.[0];

  useEffect(() => {
    const userLang = profile?.preferred_language || 'en';
    setLanguage(userLang);
    setIsRTL(userLang === 'ar');
    
    // Set HTML dir attribute for RTL languages
    document.documentElement.dir = userLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = userLang;
  }, [profile]);

  const t = (key, defaultValue = key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        value = translations['en'];
        for (const k2 of keys) {
          if (value && typeof value === 'object') {
            value = value[k2];
          } else {
            return defaultValue;
          }
        }
        return value || defaultValue;
      }
    }
    
    return value || defaultValue;
  };

  return (
    <LanguageContext.Provider value={{ t, language, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);