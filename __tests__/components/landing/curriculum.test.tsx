import { render, screen } from "@testing-library/react"
import { Curriculum } from "@/components/landing/curriculum"
import { Dictionary } from "@/app/dictionaries"

const mockDict: Dictionary = {
  landing: {
    hero: {
      title: "",
      tagline: "",
      subtitle: "",
      button: "",
      description: "",
      madeInKenya: "",
      startAITraining: "",
      watchDemo: "",
      trustedBy: "",
      stats: [],
    },
    curriculum: {
      title: "Complete Training Curriculum",
      subtitle: "Five comprehensive modules designed specifically for Kenyan food vendors and kitchens",
      modules: [
        {
          title: "Introduction to Food Safety",
          description: "Understanding food safety basics and why it matters for your business",
          level: "Beginner",
          duration: "15 min",
        },
        {
          title: "Hygiene & Cleanliness",
          description: "Hygiene and cleanliness are essential for food safety and quality. This module covers the importance of hygiene and cleanliness in the kitchen and how to maintain a clean and hygienic environment.",
          level: "Beginner",
          duration: "15 min",
        },
        {
          title: "Food Handling & Storage",
          description: "Food handling and storage are essential for food safety and quality. This module covers the importance of food handling and storage in the kitchen and how to maintain a clean and hygienic environment.",
          level: "Beginner",
          duration: "15 min",
        },
      ],
      levels: {
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced",
      },
    },
    stats: {
      title: "",
      subtitle: "",
      vendorTrained: "",
      countiesCovered: "",
      passRateIncrease: "",
      languagesSupported: "",
    },
    visual: {
      title: "",
      subtitle: "",
      learnThroughVisualStories: "",
      realKitchenScenariosAndVisualExamples: "",
      interactivePhotoBasedLearning: "",
      realKitchenScenariosFromKenya: "",
      stepByStepVisualGuides: "",
      realKitchenTrainingScenarios: "",
    },
    features: {
      title: "",
      subtitle: "",
      aiTitle: "",
      interactiveModules: "",
      smartAssessment: "",
      certificationPrep: "",
      communitySupport: "",
      multiPlatformAccess: "",
      aiDescription: "",
      interactiveModulesDescription: "",
      smartAssessmentDescription: "",
      certificationPrepDescription: "",
      communitySupportDescription: "",
      multiPlatformAccessDescription: "",
      items: [],
    },
    testimonials: {
      title: "",
      subtitle: "",
      testimonials: [],
    },
    cta: {
      title: "",
      subtitle: "",
      startButton: "",
      assessmentButton: "",
    },
    footer: {
      company: {
        name: "",
        description: "",
      },
      platform: {
        title: "",
        items: [],
      },
      support: {
        title: "",
        items: [],
      },
      legal: {
        title: "",
        items: [],
      },
      copyright: "",
    },
  },
}

describe("Curriculum", () => {
  it("renders the curriculum section with correct title and description", () => {
    render(<Curriculum dictionary={mockDict} />)
    
    expect(screen.getByText("Complete Training Curriculum")).toBeInTheDocument()
    expect(
      screen.getByText("Five comprehensive modules designed specifically for Kenyan food vendors and kitchens")
    ).toBeInTheDocument()
  })

  it("displays all training modules with correct content", () => {
    render(<Curriculum dictionary={mockDict} />)
    
    const modules = [
      "Introduction to Food Safety",
      "Hygiene & Cleanliness",
      "Food Handling & Storage",
    ]
    
    modules.forEach(module => {
      expect(screen.getByText(module)).toBeInTheDocument()
    })
  })

  it("has the correct number of module cards", () => {
    render(<Curriculum dictionary={mockDict} />)
    const moduleTitles = screen.getAllByTestId("module-card")
    expect(moduleTitles).toHaveLength(3)
  })

  it("displays module details correctly", () => {
    render(<Curriculum dictionary={mockDict} />)
    
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
