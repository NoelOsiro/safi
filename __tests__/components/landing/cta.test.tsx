import { render, screen } from "@testing-library/react"
import { CallToAction } from "@/components/landing/cta"
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
      title: "",
      subtitle: "",
      modules: [],
      levels: {
        beginner: "",
        intermediate: "",
        advanced: "",
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
      title: "Ready to Transform Your Kitchen?",
      subtitle: "Join thousands of vendors and schools improving food safety across Kenya. Start your journey today!",
      startButton: "Start Free Training",
      assessmentButton: "Take Quick Assessment",
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


describe("CallToAction", () => {
  it("renders the call to action section with correct heading and buttons", () => {
    render(<CallToAction dict={mockDict} />)

    expect(screen.getByText("Ready to Transform Your Kitchen?")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Join thousands of vendors and schools improving food safety across Kenya. Start your journey today!"
      )
    ).toBeInTheDocument()

    expect(screen.getByText("Start Free Training")).toBeInTheDocument()
    expect(screen.getByText("Take Quick Assessment")).toBeInTheDocument()
  })

  it("has correct links in the buttons", () => {
    render(<CallToAction dict={mockDict} />)

    const trainingButton = screen.getByText("Start Free Training").closest("a")
    expect(trainingButton).toHaveAttribute("href", "/auth/signup")

    const assessmentButton = screen.getByText("Take Quick Assessment").closest("a")
    expect(assessmentButton).toHaveAttribute("href", "/assessment")
  })
})
