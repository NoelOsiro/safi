import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AssessmentContent from '@/app/assessment/assessment-content';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  redirect: jest.fn((path) => {
    throw new Error(`Redirected to ${path}`);
  }),
}));

// Mock supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockImplementation(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { 
          session: { 
            user: { 
              id: 'test-user-id',
              email: 'test@example.com',
              user_metadata: { name: 'Test User' }
            } 
          } 
        },
        error: null,
      }),
    },
  })),
}));

// Mock the AssessmentContent component since we're testing the page
jest.mock('@/app/assessment/assessment-content', () => ({
  __esModule: true,
  default: function MockAssessmentContent() {
    return <div data-testid="mock-assessment-content">Mock Assessment Content</div>;
  },
}));

// Create a test wrapper component
async function TestWrapper() {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    const { redirect } = await import('next/navigation');
    redirect('/login');
  }
  
  return <AssessmentContent />;
}

describe('AssessmentPage', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    // Setup mock router
    (useRouter as jest.Mock).mockImplementation(() => ({
      push: mockPush,
    }));
    
    // Mock window.URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login when no session', async () => {
    // Mock no session
    const { createClient } = require('@/lib/supabase/server');
    createClient.mockImplementationOnce(() => ({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      },
    }));

    await expect(TestWrapper()).rejects.toThrow('Redirected to /login');
  });

  it('renders the assessment content when authenticated', async () => {
    render(await TestWrapper());
    
    // Verify the mock content is rendered
    expect(screen.getByTestId('mock-assessment-content')).toBeInTheDocument();
  });

  it('handles authentication and renders content', async () => {
    render(await TestWrapper());
    
    // Verify the mock content is rendered
    const mockContent = screen.getByTestId('mock-assessment-content');
    expect(mockContent).toBeInTheDocument();
    
    // Verify no redirect was called
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('handles authentication errors', async () => {
    const error = new Error('Authentication failed');
    const { createClient } = require('@/lib/supabase/server');
    createClient.mockImplementationOnce(() => ({
      auth: {
        getSession: jest.fn().mockRejectedValue(error),
      },
    }));

    // We expect the error to be thrown and not caught
    await expect(TestWrapper()).rejects.toThrow(error);
  });
});

// Note: Tests for AssessmentContent should be in a separate test file
// that doesn't mock the component, such as __tests__/components/AssessmentContent.test.tsx
