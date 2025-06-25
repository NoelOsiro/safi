import { render, screen } from '@testing-library/react';
import TrainingPage from '@/app/[lang]/training/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock @/lib/supabase/server
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
            },
          },
        },
      }),
    },
  })),
}));

// Mock the TrainingContent component
jest.mock('@/app/[lang]/training/training-content', () => ({
  __esModule: true,
  default: function MockTrainingContent() {
    return <div data-testid="training-content">Mock Training Content</div>;
  },
}));

describe('TrainingPage', () => {
  it('renders the training content', async () => {
    // Render the component
    const { container } = render(await TrainingPage());
    
    // Check if the content is rendered
    expect(screen.getByTestId('training-content')).toBeInTheDocument();
    expect(screen.getByText('Mock Training Content')).toBeInTheDocument();
  });

  it('redirects to login when no session', async () => {
    // Mock the session to be null
    const { createClient } = require('@/lib/supabase/server');
    createClient.mockImplementationOnce(() => ({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      },
    }));

    // Mock the redirect function
    const { redirect } = require('next/navigation');
    
    // Render the component
    await TrainingPage();
    
    // Check if redirect was called
    expect(redirect).toHaveBeenCalledWith('/login');
  });
});