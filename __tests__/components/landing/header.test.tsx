import { render, screen } from "@testing-library/react"
import { Header } from "@/components/landing/header"

describe("Header", () => {
  it("renders the logo and navigation links", () => {
    render(<Header />)

    // Check logo and site title
    expect(screen.getByText("WinjoPro")).toBeInTheDocument()
    expect(screen.getByText("AI Coach for Food Safety")).toBeInTheDocument()

    // Check navigation links
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Training")).toBeInTheDocument()
    expect(screen.getByText("Assessment")).toBeInTheDocument()
    expect(screen.getByText("Admin")).toBeInTheDocument()
  })

  it("has correct links in the navigation", () => {
    render(<Header />)

    const dashboardLink = screen.getByText("Dashboard").closest("a")
    expect(dashboardLink).toHaveAttribute("href", "/dashboard")

    const trainingLink = screen.getByText("Training").closest("a")
    expect(trainingLink).toHaveAttribute("href", "/training")
  })
})
