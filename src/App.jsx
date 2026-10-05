import { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client';
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/components/i18n/LanguageContext';

import logo from '@/assets/logo.png';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;
// Login is lazy like every other page; take it from the shared map so the
// public route is not eagerly bundled into the entry chunk.
const Login = Pages.Login;

/**
 * Layout chrome stays mounted while the lazy page chunk loads, so Suspense is
 * placed inside the layout rather than around it.
 */
const LayoutWrapper = ({ children, currentPageName }) => {
  const content = <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
  return Layout
    ? <Layout currentPageName={currentPageName}>{content}</Layout>
    : content;
};

/** Loading spinner shown while Supabase session is being resolved */
const LoadingScreen = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0b132b] text-white z-50">
    <img src={logo} alt="MatchaMD" className="w-16 h-16 mb-4 animate-bounce" />
    <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin shadow-lg" />
    <p className="mt-4 text-xs text-slate-400 font-medium tracking-wide">Loading MatchaMD...</p>
  </div>
);

/** Guard: redirects to /Login if the user is not authenticated */
const RequireAuth = ({ children }) => {
  const { isLoadingAuth, isAuthenticated, authResolved } = useAuth();
  const location = useLocation();

  // Keep showing the loading screen until the session is actually known.
  // Redirecting on `!isAuthenticated` alone would bounce a logged-in user to
  // /Login whenever the token refresh was merely slow.
  if (isLoadingAuth || !authResolved) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/Login" state={{ from: location }} replace />;

  return children;
};

/** All authenticated pages */
const AuthenticatedRoutes = () => (
  <RequireAuth>
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages)
        .filter(([path]) => path !== 'Login')
        .flatMap(([path, Page]) => {
          const normalizedPageName = 
            (path === 'interviewcourse' || path === 'interview-course') 
              ? 'InterviewCourse' 
              : path;
          return [
            <Route
              key={path}
              path={`/${path}`}
              element={
                <LayoutWrapper currentPageName={normalizedPageName}>
                  <Page />
                </LayoutWrapper>
              }
            />,
            <Route
              key={`${path}-id`}
              path={`/${path}/:id`}
              element={
                <LayoutWrapper currentPageName={normalizedPageName}>
                  <Page />
                </LayoutWrapper>
              }
            />
          ];
        })}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  </RequireAuth>
);

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        {/* Router must wrap LanguageProvider because it uses useLocation() */}
        <Router>
          <LanguageProvider>
            <NavigationTracker />
            <Routes>
              {/* Public route — no auth required. Suspense sits here because
                  this route renders outside the shared LayoutWrapper. */}
              <Route path="/Login" element={
                <Suspense fallback={<LoadingScreen />}>
                  <Login />
                </Suspense>
              } />
              {/* All other routes require auth */}
              <Route path="/*" element={<AuthenticatedRoutes />} />
            </Routes>
            <Toaster />
          </LanguageProvider>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
