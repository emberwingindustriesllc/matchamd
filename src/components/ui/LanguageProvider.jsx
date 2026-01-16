import React, { createContext, useContext, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import translations from '@/components/translations';

const LanguageContext = createContext({ 
  t: (key) => key, 
  language: 'en',
  dir: 'ltr'
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: user?.id }),
    enabled: !!user?.id,
    retry: false
  });

  const profile = profiles?.[0];

  useEffect(() => {
    if (profile?.preferred_language) {
      setLanguage(profile.preferred_language);
      document.documentElement.lang = profile.preferred_language;
      document.documentElement.dir = profile.preferred_language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [profile?.preferred_language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return value || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ t, language, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);