import { render, screen } from "@testing-library/react"
import { Footer } from "@/components/landing/footer"

describe("Footer", () => {
  it("renders the footer with correct company info", () => {
    render(<Footer />)
    
    expect(screen.getByText("MAMA SAFI")).toBeInTheDocument()
    expect(
      screen.getByText("AI-powered food safety training for a healthier Kenya. Building safer food systems one kitchen at a time.")
    ).toBeInTheDocument()
  })

  it("displays all footer sections with correct links", () => {
    render(<Footer />)
    
    // Check section headings
    expect(screen.getByText("Platform")).toBeInTheDocument()
    expect(screen.getByText("Support")).toBeInTheDocument()
    expect(screen.getByText("Languages")).toBeInTheDocument()
    
    // Check some important links
    expect(screen.getByText("Training Modules")).toBeInTheDocument()
    expect(screen.getByText("Help Center")).toBeInTheDocument()
    expect(screen.getByText("Contact Us")).toBeInTheDocument()
  })

  it("displays the current year in the copyright notice", () => {
    render(<Footer />)
    
    const currentYear = new Date().getFullYear()
    expect(
      screen.getByText(`© ${currentYear} MAMA SAFI. Building safer food systems across Kenya with love and technology.`)
    ).toBeInTheDocument()
  })

  it("has correct links in the footer", () => {
    render(<Footer />)

    const trainingLink = screen.getByText("Training Modules").closest("a")
    expect(trainingLink).toHaveAttribute("href", "/training")

    const helpLink = screen.getByText("Help Center").closest("a")
    expect(helpLink).toHaveAttribute("href", "/help")
  })
})
