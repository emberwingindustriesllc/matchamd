import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { translations } from './translations';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';

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
  const { user } = useAuth();

  const { data: profiles } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !isOnboarding,
    staleTime: 5 * 60 * 1000
  });

  const profile = profiles?.[0];

  useEffect(() => {
    setLanguage('en');
    setIsRTL(false);
    
    // Set HTML dir attribute for RTL languages
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  }, [profile]);

  const t = (key, defaultValue = key) => {
    const keys = key.split('.');
    let value = translations['en'];
    
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