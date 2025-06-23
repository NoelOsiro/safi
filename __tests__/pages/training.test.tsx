import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import TrainingPage from '@/app/training/page';
import { apiClient } from '@/lib/api-client';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        name: 'Test User',
        email: 'test@example.com',
      },
    },
    status: 'authenticated',
  })),
}));

// Mock the apiClient
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    getModules: jest.fn(),
  },
}));

describe('TrainingPage', () => {
  const mockModules = [
    {
      id: '1',
      title: 'Introduction to Food Safety',
      description: 'Learn the basics of food safety',
      icon: '🍎',
      duration: '30 min',
      level: 'Beginner',
      image: '/images/food-safety.jpg',
    },
    {
      id: '2',
      title: 'Hygiene Practices',
      description: 'Best practices for food handling hygiene',
      icon: '🧼',
      duration: '45 min',
      level: 'Beginner',
      image: '/images/hygiene.jpg',
    },
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('shows loading state', () => {
    // Mock the API to return a promise that never resolves
    (apiClient.getModules as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(<TrainingPage />);
    
    // Check if loading spinner is shown
    const loader = screen.getByTestId('loading-spinner');
    expect(loader).toBeInTheDocument();
  });

  it('displays modules when loaded', async () => {
    // Mock successful API response with progress and status
    const mockApiResponse = {
      success: true,
      modules: [
        {
          ...mockModules[0],
          progress: 100,
          status: 'completed',
        },
        {
          ...mockModules[1],
          progress: 60,
          status: 'in-progress',
        },
      ],
    };

    (apiClient.getModules as jest.Mock).mockResolvedValue(mockApiResponse);

    render(<TrainingPage />);
    
    // Wait for modules to load
    await waitFor(() => {
      // Verify API was called
      expect(apiClient.getModules).toHaveBeenCalledTimes(1);
      
      // Check if module titles are displayed
      expect(screen.getByText('Introduction to Food Safety')).toBeInTheDocument();
      expect(screen.getByText('Hygiene Practices')).toBeInTheDocument();
      
      // Check for status badges
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      
      // Check for progress indicators
      expect(screen.getByText('60% complete')).toBeInTheDocument();
    });
  });

  it('shows error message when module loading fails', async () => {
    // Mock console.error to prevent error logs in test output
    const originalError = console.error;
    console.error = jest.fn();
    
    try {
      // Mock failed API response
      (apiClient.getModules as jest.Mock).mockRejectedValue(new Error('API Error'));

      render(<TrainingPage />);
      
      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText(/failed to load training modules/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });
    } finally {
      // Restore console.error
      console.error = originalError;
    }
  });

  it('displays progress summary cards with correct values', async () => {
    // Mock successful API response
    (apiClient.getModules as jest.Mock).mockResolvedValue({
      success: true,
      modules: [],
    });

    render(<TrainingPage />);
    
    // Wait for the content to load
    await waitFor(() => {
      // Check for each progress summary card using test IDs
      const modulesCompleted = screen.getByTestId('modules-completed');
      const overallProgress = screen.getByTestId('overall-progress');
      const certificationReady = screen.getByTestId('certification-ready');
      
      // Verify each card is in the document
      expect(modulesCompleted).toBeInTheDocument();
      expect(overallProgress).toBeInTheDocument();
      expect(certificationReady).toBeInTheDocument();
      
      // Check the content of each card
      expect(modulesCompleted).toHaveTextContent('Modules Completed');
      expect(modulesCompleted).toHaveTextContent('2/5');
      
      expect(overallProgress).toHaveTextContent('Overall Progress');
      expect(overallProgress).toHaveTextContent('52%');
      
      expect(certificationReady).toHaveTextContent('Certification Ready');
      expect(certificationReady).toHaveTextContent('75%');
      
      // Verify progress bars by checking the style transform property
      const modulesProgressBar = screen.getByTestId('modules-completed-progress').querySelector('[style*="transform"]');
      const overallProgressBar = screen.getByTestId('overall-progress-bar').querySelector('[style*="transform"]');
      const certProgressBar = screen.getByTestId('certification-progress').querySelector('[style*="transform"]');
      
      expect(modulesProgressBar).toHaveStyle('transform: translateX(-60%)');
      expect(overallProgressBar).toHaveStyle('transform: translateX(-48%)');
      expect(certProgressBar).toHaveStyle('transform: translateX(-25%)');
    });
  });
});
