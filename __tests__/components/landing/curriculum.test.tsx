import { render, screen } from "@testing-library/react"
import { Curriculum } from "@/components/landing/curriculum"

describe("Curriculum", () => {
  it("renders the curriculum section with correct title and description", () => {
    render(<Curriculum />)
    
    expect(screen.getByText("Complete Training Curriculum")).toBeInTheDocument()
    expect(
      screen.getByText("Five comprehensive modules designed specifically for Kenyan food vendors and kitchens")
    ).toBeInTheDocument()
  })

  it("displays all training modules with correct content", () => {
    render(<Curriculum />)
    
    const modules = [
      "Introduction to Food Safety",
      "Hygiene & Cleanliness",
      "Food Handling & Storage",
      "Kitchen Setup & Safety",
      "Certification Requirements"
    ]
    
    modules.forEach(module => {
      expect(screen.getByText(module)).toBeInTheDocument()
    })
  })

  it("has the correct number of module cards", () => {
    render(<Curriculum />)
    const moduleTitles = screen.getAllByText(/Module \d/)
    expect(moduleTitles).toHaveLength(5)
  })

  it("displays module details correctly", () => {
    render(<Curriculum />)
    
    // Check if the first module has the correct details
    const moduleTitle = screen.getByText("Introduction to Food Safety")
    expect(moduleTitle).toBeInTheDocument()
    
    expect(
      screen.getByText("Understanding food safety basics and why it matters for your business")
    ).toBeInTheDocument()
    
    // Get all elements with text "Beginner" and check that at least one exists
    const beginnerBadges = screen.getAllByText("Beginner")
    expect(beginnerBadges.length).toBeGreaterThan(0)
    
    // Get all elements with text "15 min" and check that at least one exists
    const durationBadges = screen.getAllByText("15 min")
    expect(durationBadges.length).toBeGreaterThan(0)
    
    // Verify the first module has the correct duration
    const moduleCard = moduleTitle.closest('[class*="rounded-lg"]')
    expect(moduleCard).toHaveTextContent("15 min")
  })
})
