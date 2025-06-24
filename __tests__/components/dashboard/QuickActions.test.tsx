import { render, screen } from "@testing-library/react"
import { QuickActions } from "@/components/dassboard/QuickActions"

describe("QuickActions", () => {
  it("renders both action cards", () => {
    render(<QuickActions />)
    
    // Check assessment card
    expect(screen.getByText("Ready for Assessment?")).toBeInTheDocument()
    expect(screen.getByText("Test your knowledge with our comprehensive food safety assessment")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /take assessment/i })).toHaveAttribute("href", "/assessment")
    
    // Check help card
    expect(screen.getByText("Need Help?")).toBeInTheDocument()
    expect(screen.getByText("Chat with Mama Safi AI Coach for personalized guidance")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /chat with ai coach/i })).toHaveAttribute("href", "/chat")
  })

  it("has correct styling for buttons", () => {
    render(<QuickActions />)
    
    const assessmentButton = screen.getByRole("link", { name: /take assessment/i })
    expect(assessmentButton).toHaveClass("bg-green-600")
    expect(assessmentButton).toHaveClass("hover:bg-green-700")
    
    const chatButton = screen.getByRole("link", { name: /chat with ai coach/i })
    expect(chatButton).toHaveClass("border-blue-200")
    expect(chatButton).toHaveClass("text-blue-700")
  })
})
