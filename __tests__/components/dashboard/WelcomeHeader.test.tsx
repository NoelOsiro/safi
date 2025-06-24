import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { logout, WelcomeHeader } from "@/components/dassboard/WelcomeHeader";
import { User } from "@/lib/types/user.types";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      signOut: jest.fn().mockResolvedValue(undefined),
    },
  })),
}));



describe("WelcomeHeader", () => {
  // Create a mock user that matches the User type from the component
  const mockUser: User = {
    id: "123",
    email: "test@example.com",
    name: "Test User",
    avatar: "https://example.com/avatar.jpg",
    email_verified: true,
    phone: "+1234567890",
    role: "user",
    onboardingCompleted: true,
    progress: {
      modulesCompleted: 2,
      totalModules: 5,
      assessmentScore: 85,
      certificationReady: 0,
      studyTime: 120,
    },
    created_at: "2023-01-01T00:00:00.000+00:00",
  };

  it("renders user name when user is provided", () => {
    render(<WelcomeHeader user={mockUser} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Welcome back, Test User");
    expect(
      screen.getByText("Track your learning progress and access your courses")
    ).toBeInTheDocument();
  });

  it("renders default name when user has no name", () => {
    // Create a new user object without the name property
    const { name, ...userWithoutName } = mockUser;
    render(<WelcomeHeader user={{ ...userWithoutName, name: "" }} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Welcome back, User");
  });

  it("shows user avatar with email fallback", () => {
    render(<WelcomeHeader user={mockUser} />);
    const avatar = screen.getByText("T"); // The avatar shows the first letter of the name
    expect(avatar).toBeInTheDocument();
  });

  it("shows default avatar when no avatar is provided", () => {
    const userWithoutAvatar = { ...mockUser, avatar: undefined, name: "Test" };
    render(<WelcomeHeader user={userWithoutAvatar} />);
    const avatar = screen.getByText("T"); // Should still show first letter
    expect(avatar).toBeInTheDocument();
  });

  it("renders default text when user is not provided", () => {
    render(<WelcomeHeader user={null} />);
    expect(screen.getByText(/Welcome back, User/)).toBeInTheDocument();
  });

  it("shows user menu button when user is authenticated", () => {
    render(<WelcomeHeader user={mockUser} />);
    const menuButton = screen.getByRole("button", { name: /user menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  // it("calls logout when sign out is clicked", async () => {
  //   // Mock the dropdown menu to be open
  //   const user = userEvent.setup();

  //   render(<WelcomeHeader user={mockUser} />);

  //   // Open the dropdown
  //   const menuButton = screen.getByRole("button", { name: /user menu/i });
  //   await user.click(menuButton);

  //   // Find and click the sign out button
  //   const logoutButton = screen.getByTestId("logout-button");
  //   await user.click(logoutButton);

  //   // Wait for any async operations to complete
  //   await new Promise((resolve) => setTimeout(resolve, 0));

  //   expect(logout).toHaveBeenCalled();
  // });
});
