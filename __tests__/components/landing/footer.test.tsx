import { render, screen } from "@testing-library/react"
import { Footer } from "@/components/landing/footer"
import { Dictionary } from "@/app/dictionaries"

const mockDict: Dictionary = {
  landing: {
    footer: {
      company: {
        name: "WinjoPro",
        description: "AI-powered food safety training for a healthier Kenya. Building safer food systems one kitchen at a time."
      },
      platform: {
        title: "Platform",
        items: [
          {
            label: "Home",
            href: "/"
          },
          {
            label: "About",
            href: "/about"
          },
          {
            label: "Contact",
            href: "/contact"
          }
        ]
      },
      support: {
        title: "Support",
        items: [
          {
            label: "Help Center",
            href: "/help-center"
          },
          {
            label: "FAQ",
            href: "/faq"
          }
        ]
      },
      legal: {
        title: "Legal",
        items: [
          {
            label: "Terms of Use",
            href: "/terms"
          },
          {
            label: "Privacy Policy",
            href: "/privacy"
          },
          {
            label: "Cookie Policy",
            href: "/cookies"
          }
        ]
      },
      copyright: "© 2025 WinjoPro. Building safer food systems across Kenya with love and technology."
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
      items: []
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
    }
  }
}

describe("Footer", () => {
  it("renders the footer with correct company info", () => {
    render(<Footer dict={mockDict} />)
    
    expect(screen.getByText("WinjoPro")).toBeInTheDocument()
    expect(
      screen.getByText("AI-powered food safety training for a healthier Kenya. Building safer food systems one kitchen at a time.")
    ).toBeInTheDocument()
  })

  it("displays all footer sections with correct links", () => {
    render(<Footer dict={mockDict} />)
    
    // Check section headings
    expect(screen.getByText("Platform")).toBeInTheDocument()
    expect(screen.getByText("Support")).toBeInTheDocument()
    expect(screen.getByText("Languages")).toBeInTheDocument()
    
    // Check some important links
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("About")).toBeInTheDocument()
    expect(screen.getByText("Contact")).toBeInTheDocument()
  })

  it("displays the current year in the copyright notice", () => {
    render(<Footer dict={mockDict} />)
    
    const currentYear = new Date().getFullYear()
    expect(
      screen.getByText(`© ${currentYear} WinjoPro. Building safer food systems across Kenya with love and technology.`)
    ).toBeInTheDocument()
  })

  it("has correct links in the footer", () => {
    render(<Footer dict={mockDict} />)

    const homeLink = screen.getByText("Home").closest("a")
    expect(homeLink).toHaveAttribute("href", "/")

    const aboutLink = screen.getByText("About").closest("a")
    expect(aboutLink).toHaveAttribute("href", "/about")

    const contactLink = screen.getByText("Contact").closest("a")
    expect(contactLink).toHaveAttribute("href", "/contact")
  })
})
