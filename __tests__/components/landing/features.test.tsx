import { render, screen } from "@testing-library/react"
import { FeaturesGrid } from "@/components/landing/features"
import { Dictionary } from "@/app/dictionaries"

const mockDict: Dictionary = {
  landing: {
    features: {
      title: "Powerful Features for Food Safety",
      subtitle: "Everything you need to master food safety and get certified, powered by AI",
      aiTitle: "AI Coach",
      aiDescription: "Get personalized guidance and support from our AI Coach",
      interactiveModules: "Interactive Modules",
      interactiveModulesDescription: "Learn at your own pace with interactive modules and quizzes",
      smartAssessment: "Smart Assessment",
      smartAssessmentDescription: "Take our comprehensive assessment to test your knowledge and get certified",
      certificationPrep: "Certification Prep",
      certificationPrepDescription: "Get ready for certification with our comprehensive preparation materials",
      communitySupport: "Community Support",
      communitySupportDescription: "Join our community of food safety enthusiasts and share your experiences",
      multiPlatformAccess: "Multi-Platform Access",
      multiPlatformAccessDescription: "Access our training materials from any device, anywhere in the world",
      items: [
        {
          title: "AI Coach",
          description: "Get personalized guidance and support from our AI Coach",
        },
        {
          title: "Interactive Modules",
          description: "Learn at your own pace with interactive modules and quizzes",
        },
        {
          title: "Smart Assessment",
          description: "Take our comprehensive assessment to test your knowledge and get certified",
        },
        {
          title: "Certification Prep",
          description: "Get ready for certification with our comprehensive preparation materials",
        },
        {
          title: "Community Support",
          description: "Join our community of food safety enthusiasts and share your experiences",
        },
        {
          title: "Multi-Platform Access",
          description: "Access our training materials from any device, anywhere in the world",
        },
      ],
    },
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
      stats: []
    },
    curriculum: {
      title: "",
      subtitle: "",
      modules: [],
      levels: {
        beginner: "",
        intermediate: "",
        advanced: ""
      }
    },
    stats: {
      title: "",
      subtitle: "",
      vendorTrained: "",
      countiesCovered: "",
      passRateIncrease: "",
      languagesSupported: ""
    },
    visual: {
      title: "",
      subtitle: "",
      learnThroughVisualStories: "",
      realKitchenScenariosAndVisualExamples: "",
      interactivePhotoBasedLearning: "",
      realKitchenScenariosFromKenya: "",
      stepByStepVisualGuides: "",
      realKitchenTrainingScenarios: ""
    },
    testimonials: {
      title: "",
      subtitle: "",
      testimonials: []
    },
    cta: {
      title: "",
      subtitle: "",
      startButton: "",
      assessmentButton: ""
    },
    footer: {
      company: {
        name: "",
        description: ""
      },
      platform: {
        title: "",
        items: []
      },
      support: {
        title: "",
        items: []
      },
      legal: {
        title: "",
        items: []
      },
      copyright: ""
    }
  },
}

describe("FeaturesGrid", () => {
  it("renders the features section with correct title and description", () => {
    render(<FeaturesGrid dict={mockDict} />)
    
    expect(screen.getByText("Powerful Features for Food Safety")).toBeInTheDocument()
    expect(
      screen.getByText("Everything you need to master food safety and get certified, powered by AI")
    ).toBeInTheDocument()
  })

  it("displays all feature cards with correct content", () => {
    render(<FeaturesGrid dict={mockDict} />)
    
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
    render(<FeaturesGrid dict={mockDict} />)
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
