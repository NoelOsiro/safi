import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import ProfilePage from '@/app/[lang]/profile/page';

// Mock redirect globally
jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation');
  return {
    ...actual,
    redirect: jest.fn(() => {
      throw new Error('Redirected');
    }),
  };
});

// Mock supabase client
jest.mock('@/lib/supabase/client', () => {
  const single = jest.fn();
  const eq = jest.fn(() => ({ single }));
  const select = jest.fn(() => ({ eq }));
  const from = jest.fn(() => ({ select }));
  const getSession = jest.fn();

  return {
    supabase: {
      auth: { getSession },
      from,
    },
    __mocks: {
      getSession,
      from,
      select,
      eq,
      single,
    },
  };
});

// Mock ProfileContent component
jest.mock('@/app/[lang]/profile/profile-content', () => ({
  __esModule: true,
  ProfileContent: function MockProfileContent({ user }: { user: any }) {
    return (
      <div data-testid="profile-content">
        <div data-testid="user-name">{user.name}</div>
        <div data-testid="user-email">{user.email}</div>
        <div data-testid="user-phone">{user.phone}</div>
        <img data-testid="user-avatar" alt={user.name} src={user.avatar} />
      </div>
    );
  },
}));

// Access the mocks
const {
  __mocks: { getSession, from, select, eq, single },
} = jest.requireMock('@/lib/supabase/client');

describe('ProfilePage (TS-safe)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the profile content with user data', async () => {
    getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: {
              name: 'Test User',
              full_name: 'Test User',
            },
            created_at: '2023-01-01T00:00:00.000Z',
            updated_at: '2023-01-01T00:00:00.000Z',
            email_confirmed_at: '2023-01-01T00:00:00.000Z',
          },
        },
      },
      error: null,
    });

    single.mockResolvedValue({
      data: {
        phone: '+1234567890',
        business_type: 'Retail',
        location: 'Nairobi',
        experience: '1-3 years',
      },
      error: null,
    });

    render(await ProfilePage());

    expect(screen.getByTestId('profile-content')).toBeInTheDocument();
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('user-phone')).toHaveTextContent('+1234567890');
  });

  it('renders fallback values when profile fields are missing', async () => {
    getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      },
      error: null,
    });

    single.mockResolvedValue({
      data: null,
      error: null,
    });

    render(await ProfilePage());

    expect(screen.getByTestId('user-name')).toHaveTextContent('test'); // from email
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('user-phone')).toHaveTextContent('');
  });

  it('handles profile fetch errors gracefully', async () => {
    getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user-123',
            email: 'error@example.com',
            user_metadata: {
              name: 'Error User',
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      },
      error: null,
    });

    single.mockRejectedValue(new Error('Supabase error'));

    render(await ProfilePage());

    expect(screen.getByTestId('user-name')).toHaveTextContent('Error User');
    expect(screen.getByTestId('user-email')).toHaveTextContent('error@example.com');
  });

  it('generates avatar from email when none is provided', async () => {
    getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: {
              name: 'Test User',
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      },
      error: null,
    });

    single.mockResolvedValue({
      data: {
        phone: '+1234567890',
      },
      error: null,
    });

    render(await ProfilePage());

    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar.getAttribute('src')).toMatch(/api\.dicebear\.com\/7\.x\/initials\/svg/);
    expect(avatar.getAttribute('src')).toContain(encodeURIComponent('test@example.com'));
  });

  it('redirects to login when session is missing', async () => {
    getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(ProfilePage()).rejects.toThrow('Redirected');
    expect(redirect).toHaveBeenCalledWith('/login');
  });
});
