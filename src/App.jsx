import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/components/i18n/LanguageContext';
import Login from './pages/Login';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

/** Loading spinner shown while Supabase session is being resolved */
const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-[rgba(var(--color-primary),0.2)] border-t-[rgb(var(--color-primary))] rounded-full animate-spin shadow-[0_0_15px_rgba(var(--color-primary),0.3)]" />
  </div>
);

/** Guard: redirects to /Login if the user is not authenticated */
const RequireAuth = ({ children }) => {
  const { isLoadingAuth, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) return <LoadingScreen />;
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
        .map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  </RequireAuth>
);

function App() {
  return (
    <AuthProvider>
      {/* Router must wrap LanguageProvider because it uses useLocation() */}
      <Router>
        <LanguageProvider>
          <NavigationTracker />
          <Routes>
            {/* Public route — no auth required */}
            <Route path="/Login" element={<Login />} />
            {/* All other routes require auth */}
            <Route path="/*" element={<AuthenticatedRoutes />} />
          </Routes>
          <Toaster />
        </LanguageProvider>
      </Router>
    </AuthProvider>
  )
}

export default App
