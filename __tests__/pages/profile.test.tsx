import { render, screen } from '@testing-library/react';
import ProfilePage from '@/app/profile/page';
import { redirect } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('Redirected');
  }),
}));

const redirectMock = jest.fn();
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
      }),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: {
        phone: '+1234567890',
        business_type: 'Retail',
        location: 'Nairobi',
        experience: '1-3 years',
        role: 'user',
        onboarding_completed: true,
        progress: {
          modulesCompleted: 2,
          totalModules: 5,
          assessmentScore: 0,
          certificationReady: 0,
          studyTime: 0,
        },
      },
    }),
  })),
}));

// Mock ProfileContent component
jest.mock('@/app/profile/profile-content', () => ({
  __esModule: true,
  ProfileContent: function MockProfileContent({ user }: { user: { name: string; email: string; phone: string; avatar: string } }) {
    return (
      <div data-testid="profile-content">
        <div data-testid="user-name">{user.name}</div>
        <div data-testid="user-email">{user.email}</div>
        <div data-testid="user-phone">{user.phone}</div>
        <div data-testid="user-avatar">{user.avatar}</div>
      </div>
    );
  },
}));



describe('ProfilePage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the profile content with user data', async () => {
    // Render the component
    const { container } = render(await ProfilePage());
    
    // Check if the content is rendered with user data
    expect(screen.getByTestId('profile-content')).toBeInTheDocument();
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('user-phone')).toHaveTextContent('+1234567890');
  });

  // it('redirects to login when no session', async () => {
  //   await ProfilePage();
  //   expect(redirectMock).toHaveBeenCalledWith('/login');
  // });
  

  it("renders fallback values when profile fields are missing", async () => {
    const { createClient } = require('@/lib/supabase/server')
    createClient.mockImplementation(() => ({
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: {
            session: {
              user: {
                id: "user-123",
                email: "fallback@example.com",
                user_metadata: {},
              },
            },
          },
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {} }), // No profile data
    }))
  
    const { container } = render(await ProfilePage())
  
    expect(screen.getByTestId("user-name")).toHaveTextContent("fallback")
    expect(screen.getByTestId("user-email")).toHaveTextContent("fallback@example.com")
    expect(screen.getByTestId("user-phone")).toHaveTextContent("") // fallback for phone
  })
  
  it("handles profile fetch errors gracefully", async () => {
    const { createClient } = require('@/lib/supabase/server')
    createClient.mockImplementation(() => ({
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: {
            session: {
              user: {
                id: "user-123",
                email: "error@example.com",
                user_metadata: { name: "Error Test" },
              },
            },
          },
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockRejectedValue(new Error("Supabase error")), // simulate failure
    }))
  
    await expect(ProfilePage()).resolves.toBeTruthy()
    // Optionally verify the fallback UI is still rendered or log was triggered
  })
  it("generates avatar from email when no avatar URL is provided", async () => {
    const { createClient } = require('@/lib/supabase/server')
    createClient.mockImplementation(() => ({
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: {
            session: {
              user: {
                id: "user-123",
                email: "avatar@test.com",
                user_metadata: {}, // no avatar
              },
            },
          },
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {} }),
    }))
  
    const { container } = render(await ProfilePage())
    const initialsURL = `https://api.dicebear.com/7.x/initials/svg?seed=avatar%40test.com`
    expect(screen.getByTestId("user-avatar").textContent).toContain("https://api.dicebear.com/7.x/initials/svg?seed=avatar%40test.com")

  })
  jest.mock('next/navigation', () => {
    const actual = jest.requireActual('next/navigation')
    return {
      ...actual,
      redirect: jest.fn(() => {
        throw new Error("Redirected")
      }),
    }
  })
  
  it("throws redirect error when session is missing", async () => {
    const { createClient } = require('@/lib/supabase/server')
    createClient.mockImplementation(() => ({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      },
    }))
  
    await expect(ProfilePage()).rejects.toThrow("Redirected")
  })
  
});
