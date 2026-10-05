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

// Mock lucide-react icons.
// Spread the real module so newly-added icons resolve automatically; the
// hardcoded list previously broke any test importing a component that used an
// icon not on it (e.g. LinkIcon in ResourceLink.jsx).
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal();
  const mockIcon = ({ children, ...props }) => <svg data-testid="icon" {...props} />;
  const mocked = {};
  for (const key of Object.keys(actual)) {
    mocked[key] = typeof actual[key] === 'function' && /^[A-Z]/.test(key) ? mockIcon : actual[key];
  }
  return mocked;
});

// Node >=22 exposes an experimental global `localStorage` that is undefined
// unless --localstorage-file is passed. It shadows jsdom's window.localStorage,
// so any test touching storage fails with "Cannot read properties of undefined".
// Restore a working in-memory implementation when that happens.
function createMemoryStorage() {
  let store = new Map();
  return {
    getItem: (k) => (store.has(String(k)) ? store.get(String(k)) : null),
    setItem: (k, v) => { store.set(String(k), String(v)); },
    removeItem: (k) => { store.delete(String(k)); },
    clear: () => { store = new Map(); },
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; },
  };
}

if (!globalThis.localStorage) {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: createMemoryStorage(),
  });
}
if (typeof window !== 'undefined' && !window.localStorage) {
  window.localStorage = globalThis.localStorage;
}

// Global test utilities
// Must be a real CLASS: Radix components do `new ResizeObserver(...)`, and a
// vi.fn() whose implementation is an arrow function is not a constructor
// ("... is not a constructor"), which fails the mount before any assertion.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;
globalThis.ResizeObserver = ResizeObserverMock;

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