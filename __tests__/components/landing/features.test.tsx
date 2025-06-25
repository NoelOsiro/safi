import { render, screen } from "@testing-library/react"
import { FeaturesGrid } from "@/components/landing/features"

describe("FeaturesGrid", () => {
  it("renders the features section with correct title and description", () => {
    render(<FeaturesGrid />)
    
    expect(screen.getByText("Powerful Features for Food Safety")).toBeInTheDocument()
    expect(
      screen.getByText("Everything you need to master food safety and get certified, powered by AI")
    ).toBeInTheDocument()
  })

  it("displays all feature cards with correct content", () => {
    render(<FeaturesGrid />)
    
    const features = [
      "AI Coach",
      "Interactive Modules",
      "Smart Assessment",
      "Certification Prep",
      "Community Support",
      "Multi-Platform Access"
    ]
    
    features.forEach(feature => {
      expect(screen.getByText(feature)).toBeInTheDocument()
    })
  })

  it("has the correct number of feature cards", () => {
    render(<FeaturesGrid />)
    // Find all feature cards by their title text
    const featureTitles = [
      "AI Coach",
      "Interactive Modules",
      "Smart Assessment",
      "Certification Prep",
      "Community Support",
      "Multi-Platform Access"
    ]
    
    featureTitles.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument()
    })
    
    // Verify the count
    const featureCards = document.querySelectorAll('[class*="rounded-lg bg-card"]')
    expect(featureCards).toHaveLength(6)
  })
})
