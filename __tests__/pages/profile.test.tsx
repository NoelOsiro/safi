import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ProfilePage from '@/app/profile/page';
import { useAuthStore } from '@/lib/stores/auth-store';

// Mock the auth store
jest.mock('@/lib/stores/auth-store');

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock useCurrentUser hook
jest.mock('@/lib/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    user: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      onboardingCompleted: true,
      progress: {
        modulesCompleted: 2,
        totalModules: 5
      },
      businessType: 'Retail',
      location: 'Nairobi',
      experience: 'beginner'
    },
    error: null,
    isLoading: false
  })
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Setup default mock for auth store
const setupAuthStore = (isAuthenticated = true) => {
  mockUseAuthStore.mockReturnValue({
    isAuthenticated,
    user: isAuthenticated 
      ? { 
          id: 'user-123',
          name: 'Test User', 
          email: 'test@example.com',
          phone: '+1234567890',
          onboardingCompleted: true,
          progress: {
            modulesCompleted: 2,
            totalModules: 5
          },
          businessType: 'Retail',
          location: 'Nairobi',
          experience: 'beginner'
        }
      : null,
    isLoading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    checkAuth: jest.fn(),
    completeOnboarding: jest.fn(),
    updateProgress: jest.fn(),
  });
};

describe('ProfilePage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Setup default auth store mock
    setupAuthStore(true);
    // Mock useRouter
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  it('renders the user profile with user information', () => {
    render(<ProfilePage />);
    
    // Check if user information is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    
    // Check if the avatar with initials is rendered
    const avatarInitials = screen.getByText('TU');
    expect(avatarInitials).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    // Mock unauthenticated user
    setupAuthStore(false);
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    render(<ProfilePage />);
    
    // Check if redirect to login happens
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
