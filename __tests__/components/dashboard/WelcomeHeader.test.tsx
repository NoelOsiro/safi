import { render, screen, fireEvent } from "@testing-library/react"
import { WelcomeHeader } from "@/components/dassboard/WelcomeHeader"
import { useAuthStore } from "@/lib/stores/auth-store"

// Mock the auth store
jest.mock("@/lib/stores/auth-store")

// Mock the auth service
jest.mock("@/lib/services/auth.service", () => ({
  authService: {
    signOut: jest.fn().mockResolvedValue(undefined),
  },
}))

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe("WelcomeHeader", () => {
  // Create a mock user that matches the User type from auth.service.ts
  const mockUser = {
    $id: "123",
    $createdAt: "2023-01-01T00:00:00.000+00:00",
    $updatedAt: "2023-01-01T00:00:00.000+00:00",
    name: "Test User",
    email: "test@example.com",
    emailVerification: true,
    prefs: {},
    status: true,
    registration: "2023-01-01T00:00:00.000+00:00",
    passwordUpdate: "2023-01-01T00:00:00.000+00:00",
    accessedAt: "2023-01-01T00:00:00.000+00:00",
    labels: [],
    phone: "",
    phoneVerification: false,
    mfa: false,
    targets: []
  }

  beforeEach(() => {
    // Mock the useRouter hook
    jest.mock("next/navigation", () => ({
      useRouter: () => ({
        push: jest.fn(),
      }),
    }))
  })

  it("renders user name when user is provided", () => {
    render(<WelcomeHeader user={mockUser} />)
    expect(screen.getByText(/Welcome back, Test User/)).toBeInTheDocument()
  })

  it("renders default text when user is not provided", () => {
    render(<WelcomeHeader user={null} />)
    expect(screen.getByText(/Welcome back, User/)).toBeInTheDocument()
  })

  it("shows sign out button", () => {
    render(<WelcomeHeader user={mockUser} />)
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument()
  })

  it("calls signOut when sign out button is clicked", async () => {
    const { authService } = require("@/lib/services/auth.service")
    const { useRouter } = require("next/navigation")
    
    render(<WelcomeHeader user={mockUser} />)
    const signOutButton = screen.getByRole("button", { name: /sign out/i })
    
    fireEvent.click(signOutButton)
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(authService.signOut).toHaveBeenCalled()
  })
})
