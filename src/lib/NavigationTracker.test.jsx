import { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';

// Unmock react-router-dom so we can use the real useNavigate/MemoryRouter for navigation
vi.unmock('react-router-dom');

// Mock dependencies
vi.mock('@/lib/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/pages.config', () => ({
  pagesConfig: {
    Pages: {
      Dashboard: 'Dashboard',
      Profile: 'Profile',
      Onboarding: 'Onboarding',
    },
    mainPage: 'Onboarding',
  },
}));

import { useAuth } from '@/lib/AuthContext';
import NavigationTracker from '@/lib/NavigationTracker';

// Test wrapper
const renderWithRouter = (component, { initialPath = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      {component}
    </MemoryRouter>
  );
};

describe('NavigationTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('tracks page view for authenticated user on Dashboard', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-123', email: 'test@example.com' },
    });

    renderWithRouter(<NavigationTracker />, { initialPath: '/Dashboard' });

    await waitFor(() => {
      const pageViews = JSON.parse(localStorage.getItem('matchamd_page_views') || '[]');
      expect(pageViews).toHaveLength(1);
      expect(pageViews[0].page).toBe('Dashboard');
      expect(pageViews[0].userId).toBe('user-123');
    });
  });

  it('tracks page view for root path as mainPage', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-123' },
    });

    renderWithRouter(<NavigationTracker />, { initialPath: '/' });

    await waitFor(() => {
      const pageViews = JSON.parse(localStorage.getItem('matchamd_page_views') || '[]');
      expect(pageViews[0].page).toBe('Onboarding');
    });
  });

  it('does not track when user is not authenticated', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    renderWithRouter(<NavigationTracker />, { initialPath: '/Dashboard' });

    await waitFor(() => {
      const pageViews = JSON.parse(localStorage.getItem('matchamd_page_views') || '[]');
      expect(pageViews).toHaveLength(0);
    });
  });

  it('does not track when user is null', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: null,
    });

    renderWithRouter(<NavigationTracker />, { initialPath: '/Dashboard' });

    await waitFor(() => {
      const pageViews = JSON.parse(localStorage.getItem('matchamd_page_views') || '[]');
      expect(pageViews).toHaveLength(0);
    });
  });

  it('tracks multiple page views', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-123' },
    });

    const NavigateButton = () => {
      const navigate = useNavigate();
      return (
        <button data-testid="nav-btn" onClick={() => navigate('/Profile')}>
          Go to Profile
        </button>
      );
    };

    render(
      <MemoryRouter initialEntries={['/Dashboard']}>
        <NavigationTracker />
        <NavigateButton />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      let pageViews = JSON.parse(localStorage.getItem('matchamd_page_views') || '[]');
      expect(pageViews).toHaveLength(1);
      expect(pageViews[0].page).toBe('Dashboard');
    });

    // Click to navigate
    fireEvent.click(screen.getByTestId('nav-btn'));

    await waitFor(() => {
      const pageViews = JSON.parse(localStorage.getItem('matchamd_page_views') || '[]');
      expect(pageViews).toHaveLength(2);
      expect(pageViews[1].page).toBe('Profile');
    });
  });

  it('limits stored page views to 100', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-123' },
    });

    // Pre-populate with 100 entries
    const existingViews = Array.from({ length: 100 }, (_, i) => ({
      page: `Page${i}`,
      timestamp: new Date().toISOString(),
      userId: 'user-123',
    }));
    localStorage.setItem('matchamd_page_views', JSON.stringify(existingViews));

    renderWithRouter(<NavigationTracker />, { initialPath: '/Dashboard' });

    await waitFor(() => {
      const pageViews = JSON.parse(localStorage.getItem('matchamd_page_views') || '[]');
      expect(pageViews).toHaveLength(100);
      // Oldest should be removed
      expect(pageViews[0].page).toBe('Page1');
      expect(pageViews[99].page).toBe('Dashboard');
    });
  });

  it('handles unknown paths gracefully', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-123' },
    });

    renderWithRouter(<NavigationTracker />, { initialPath: '/UnknownPage' });

    await waitFor(() => {
      const pageViews = JSON.parse(localStorage.getItem('matchamd_page_views') || '[]');
      expect(pageViews[0].page).toBe('UnknownPage');
    });
  });
});