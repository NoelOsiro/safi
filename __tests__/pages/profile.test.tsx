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

// Mock @/lib/supabase/server
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
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
      })
    },
    from:jest.fn(),
    select:jest.fn(),
    single:jest.fn().mockResolvedValue({
      data: {
        phone: '+1234567890',
      },
      error: null,
    })
  })),
}));

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

describe('ProfilePage (TS-safe)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the profile content with user data', async () => {
    render(await ProfilePage());
    expect(screen.getByTestId('profile-content')).toBeInTheDocument();
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    // expect(screen.getByTestId('user-phone')).toHaveTextContent('+1234567890');
  });

  it('renders fallback values when profile fields are missing', async () => {
    const { createClient } = require('@/lib/supabase/server');
    createClient.mockImplementationOnce(() => ({
      auth: {
        getSession: jest.fn().mockResolvedValue(({
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
        })),
      }
    })
  );


    render(await ProfilePage());

    expect(screen.getByTestId('user-name')).toHaveTextContent('test'); // from email
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('user-phone')).toHaveTextContent('');
  });

  it('handles profile fetch errors gracefully', async () => {
    const { createClient } = require('@/lib/supabase/server');
    createClient.mockImplementationOnce(() => ({
      auth: {
        getSession: jest.fn().mockResolvedValue(({
          data: {
            session: {
              user: {
                id: 'user-123',
                email: '',
                user_metadata: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            },
          },
          error: null,
        })),
      }
    })
  );


    

    render(await ProfilePage());

    expect(screen.getByTestId('user-name')).toHaveTextContent('');
    expect(screen.getByTestId('user-email')).toHaveTextContent('');
  });

  it('generates avatar from email when none is provided', async () => {
    const { createClient } = require('@/lib/supabase/server');
    createClient.mockImplementationOnce(() => ({
      auth: {
        getSession: jest.fn().mockResolvedValue(({
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
        })),
      }
    })
  );


    render(await ProfilePage());

    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar.getAttribute('src')).toMatch(/api\.dicebear\.com\/7\.x\/initials\/svg/);
    expect(avatar.getAttribute('src')).toContain(encodeURIComponent('test@example.com'));
  });

  it('redirects to login when session is missing', async () => {
    const { createClient } = require('@/lib/supabase/server');
    createClient.mockImplementationOnce(() => ({
      auth: {
        getSession: jest.fn().mockResolvedValue(({
          data: { session: null },
          error: null,
        }))
      }

    })
  );


    await expect(ProfilePage()).rejects.toThrow('Redirected');
    expect(redirect).toHaveBeenCalledWith('/login');
  });
});
