import { render, screen } from "@testing-library/react"
import { CallToAction } from "@/components/landing/cta"

describe("CallToAction", () => {
  it("renders the call to action section with correct heading and buttons", () => {
    render(<CallToAction />)
    
    expect(screen.getByText("Ready to Transform Your Kitchen?")).toBeInTheDocument()
    expect(
      screen.getByText("Join thousands of vendors and schools improving food safety across Kenya. Start your journey today!")
    ).toBeInTheDocument()
    
    // Check for both CTA buttons
    expect(screen.getByText("Start Free Training")).toBeInTheDocument()
    expect(screen.getByText("Take Quick Assessment")).toBeInTheDocument()
  })

  it("has correct links in the buttons", () => {
    render(<CallToAction />)

    const trainingButton = screen.getByText("Start Free Training").closest("a")
    expect(trainingButton).toHaveAttribute("href", "/auth/signup")

    const assessmentButton = screen.getByText("Take Quick Assessment").closest("a")
    expect(assessmentButton).toHaveAttribute("href", "/assessment")
  })
})
