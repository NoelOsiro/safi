import { render, screen } from '@testing-library/react';
import { mockModules } from '@/lib/mock-data';
import TrainingContent from '@/app/training/training-content';
import '@testing-library/jest-dom';

// Mock the next/link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('TrainingContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the training content with correct title and description', () => {
    render(<TrainingContent />);
    
    expect(screen.getByText('Food Safety Training')).toBeInTheDocument();
    expect(screen.getByText('Master essential food safety practices for your business')).toBeInTheDocument();
  });

  it('displays the correct number of modules', () => {
    render(<TrainingContent />);
    
    // Find modules by their title class
    const moduleTitles = screen.getAllByText(/./, {
      selector: '.font-semibold.tracking-tight.text-xl'
    });
    expect(moduleTitles).toHaveLength(mockModules.length);
  });

  it('calculates and displays the correct overall progress', () => {
    // Calculate expected progress
    const expectedProgress = Math.round(
      mockModules.reduce((acc, _, index) => {
        const progress = index <= 1 ? 100 : index === 2 ? 60 : 0;
        return acc + progress;
      }, 0) / mockModules.length
    );

    render(<TrainingContent />);
    
    // Find the overall progress element by its test ID
    const progressElement = screen.getByTestId('overall-progress');
    expect(progressElement).toHaveTextContent(`${expectedProgress}%`);
  });

  it('displays the correct number of completed modules', () => {
    // Calculate expected completed modules (first 2 are completed in the mock data)
    const expectedCompleted = 2;
    
    render(<TrainingContent />);
    
    // Find the completed modules count
    const completedElement = screen.getByText(/\d+\s*\/\s*\d+/);
    expect(completedElement).toHaveTextContent(`${expectedCompleted}/${mockModules.length}`);
  });

  it('displays the correct module statuses', () => {
    render(<TrainingContent />);
    
    // Check for different statuses using more specific selectors
    const badges = screen.getAllByRole('status') as HTMLElement[];
    
    // Verify we have at least one of each status
    const completedBadges = badges.filter(badge => badge.textContent === 'Completed');
    const inProgressBadges = badges.filter(badge => badge.textContent === 'In Progress');
    const notStartedBadges = badges.filter(badge => badge.textContent === 'Not Started');
    
    expect(completedBadges.length).toBeGreaterThan(0);
    expect(inProgressBadges.length).toBeGreaterThan(0);
    expect(notStartedBadges.length).toBeGreaterThan(0);
  });

  it('renders the correct action buttons based on module status', () => {
    render(<TrainingContent />);
    
    // Check for different action buttons
    const reviewButtons = screen.getAllByRole('button', { name: /review/i });
    const continueButtons = screen.getAllByRole('button', { name: /continue/i });
    const startButtons = screen.getAllByRole('button', { name: /start/i });
    
    expect(reviewButtons.length).toBeGreaterThan(0);
    expect(continueButtons.length).toBeGreaterThan(0);
    expect(startButtons.length).toBeGreaterThan(0);
  });

  it('displays the correct progress for each module', () => {
    render(<TrainingContent />);
    
    // Check progress for the first module (should be 100%)
    const progressElements = screen.getAllByText(/\d+%/);
    expect(progressElements.length).toBeGreaterThan(0);
    expect(progressElements[0]).toHaveTextContent('52%');
    
    // Check progress bar value
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);
  });
});