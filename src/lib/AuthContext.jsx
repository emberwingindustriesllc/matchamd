import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { purchaseManager } from '@/lib/purchaseManager';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]                   = useState(null);
  const [session, setSession]             = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Safety fallback: force isLoadingAuth to false after 2.5s max
    const timer = setTimeout(() => {
      if (isMounted) {
        setIsLoadingAuth(false);
      }
    }, 2500);

    // 1. Get the current session on mount
    supabase.auth.getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        const currentSession = data?.session ?? null;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsAuthenticated(!!currentSession);
        setIsLoadingAuth(false);
        clearTimeout(timer);
        
        try {
          purchaseManager.initialize(currentSession?.user?.id);
        } catch (e) {
          console.warn('[AuthContext] RevenueCat init error:', e);
        }
      })
      .catch((err) => {
        console.error('[AuthContext] getSession error:', err);
        if (isMounted) {
          setIsLoadingAuth(false);
          clearTimeout(timer);
        }
      });

    // 2. Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAuthenticated(!!session);
      setIsLoadingAuth(false);
      clearTimeout(timer);
      
      try {
        if (currentUser) {
          purchaseManager.logIn(currentUser.id);
        } else {
          purchaseManager.logOut();
        }
      } catch (e) {
        console.warn('[AuthContext] PurchaseManager auth change error:', e);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAuthenticated(false);
  };

  /**
   * Redirects the user to the internal Login page.
   * Components should call this instead of using navigate() directly
   * so the login destination can be changed in one place.
   */
  const navigateToLogin = () => {
    window.location.href = '/Login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated,
      isLoadingAuth,
      // Legacy compat: these kept so existing callers don't crash
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: null,
      logout,
      navigateToLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
