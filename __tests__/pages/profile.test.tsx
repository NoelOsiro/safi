import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { useSession } from 'next-auth/react';
import ProfilePage from '../../app/profile/page';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
      },
    },
    status: 'authenticated',
  })),
}));

describe('ProfilePage', () => {
  it('renders the user profile', () => {
    render(<ProfilePage />);
    
    // Check if user information is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    
    // Check if the avatar with initials is rendered
    const avatarInitials = screen.getByText('TU');
    expect(avatarInitials).toBeInTheDocument();
    expect(avatarInitials.closest('span')).toHaveClass('bg-gradient-to-r', 'from-emerald-500', 'to-teal-400');
  })

  it('displays user information when session is loaded', () => {
    // Mock the session as loaded
    (useSession as jest.Mock).mockImplementationOnce(() => ({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          image: 'https://example.com/avatar.jpg',
        },
      },
      status: 'authenticated',
    }));

    render(<ProfilePage />);
    
    // Check if user information is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});
