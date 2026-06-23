// Vitest setup file
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock Supabase
vi.mock('@/api/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnThis(),
      filter: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: '' } }),
      }),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  },
}));

// Mock RevenueCat
vi.mock('@revenuecat/purchases-capacitor', () => ({
  Purchases: {
    configure: vi.fn().mockResolvedValue(undefined),
    setLogLevel: vi.fn().mockResolvedValue(undefined),
    logIn: vi.fn().mockResolvedValue(undefined),
    logOut: vi.fn().mockResolvedValue(undefined),
    getOfferings: vi.fn().mockResolvedValue({ current: null }),
    getProducts: vi.fn().mockImplementation(({ productIdentifiers }) => 
      Promise.resolve({ 
        products: productIdentifiers.map(id => ({ identifier: id, title: id, price: '$9.99' })) 
      })
    ),
    purchasePackage: vi.fn().mockResolvedValue({}),
    purchaseStoreProduct: vi.fn().mockResolvedValue({}),
  },
  LOG_LEVEL: { DEBUG: 'DEBUG' },
}));

// Mock Capacitor
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => false,
    getPlatform: () => 'web',
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const icons = ['Bell', 'ChevronRight', 'Calendar', 'Trophy', 'Flame', 'Sparkles', 'Users', 'GraduationCap', 'Target', 'Stethoscope', 'Bot', 'Send', 'AlertCircle', 'Globe', 'CheckCircle2', 'Camera', 'Moon', 'BookOpen', 'Crown', 'Shield', 'MapPin', 'Settings', 'LogOut', 'ChevronLeft', 'GraduationCap', 'Shield'];
  const mockIcon = ({ children, ...props }) => <svg data-testid="icon" {...props} />;
  const mocked = {};
  icons.forEach(name => { mocked[name] = mockIcon; });
  return mocked;
});

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));