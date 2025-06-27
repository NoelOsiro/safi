import { render, screen } from "@testing-library/react"
import { Header } from "@/components/landing/header"


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


describe("Header", () => {
  it("renders the logo and navigation links", async() => {
    // supress console.error here only
    console.error = jest.fn()
    render(await Header());

    // Check logo and site title
    expect(screen.getByText("WinjoPro")).toBeInTheDocument()
    expect(screen.getByText("AI Coach for Food Safety")).toBeInTheDocument()

    // Check navigation links
    const dashboardLinks = screen.getAllByText("Dashboard")
    expect(dashboardLinks[0].closest("a")).toBeInTheDocument()
    expect(screen.getByText("Training")).toBeInTheDocument()
    expect(screen.getByText("Assessment")).toBeInTheDocument()
    expect(screen.getByText("Admin")).toBeInTheDocument()
  })

  it("has correct links in the navigation", async() => {
    render(await Header());

    const dashboardLinks = screen.getAllByText("Dashboard")
    expect(dashboardLinks[0].closest("a")).toHaveAttribute("href", "/dashboard")

    const trainingLink = screen.getByText("Training").closest("a")
    expect(trainingLink).toHaveAttribute("href", "/training")
  })
  it('renders sign in button when no session', async () => {
      // Mock the session to be null
      const { createClient } = require('@/lib/supabase/server');
      createClient.mockImplementationOnce(() => ({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        },
      }))
      
      // Render the component
      render(await Header());
      
      // Check if Sign in Button exists  was called
      expect(screen.getByText("Sign In")).toBeInTheDocument()
    });
})
