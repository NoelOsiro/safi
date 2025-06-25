import { render, screen } from "@testing-library/react"
import { Testimonials } from "@/components/landing/testimonials"
import { Dictionary } from "@/app/dictionaries"

const mockDict: Dictionary = {
  landing: {
    testimonials: {
      title: "Success Stories",
      subtitle: "Hear from vendors who transformed their businesses with WinjoPro",
      testimonials: [
        {
          name: "Mary Wanjiku",
          role: "Street Food Vendor",
          rating: 5,
          imageId: 1,
          quote: "WinjoPro has transformed my street food business. I now have a better understanding of food safety and can serve healthier food to my customers."
        },
        {
          name: "John Kiprotich",
          role: "School Kitchen Manager",
          rating: 5,
          imageId: 2,
          quote: "WinjoPro has helped me improve the food safety standards in my school kitchen. The training has made a big difference in the quality of food served to our students."
        },
        {
          name: "Grace Achieng",
          role: "Catering Business Owner",
          rating: 5,
          imageId: 3,
          quote: "WinjoPro has helped me improve the food safety standards in my catering business. The training has made a big difference in the quality of food served to our customers."
        }
      ]
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
  }
}
describe("Testimonials", () => {
  it("renders the testimonials section with correct title", () => {
    render(<Testimonials dict={mockDict} />)
    
    expect(screen.getByText("Success Stories")).toBeInTheDocument()
    expect(
      screen.getByText("Hear from vendors who transformed their businesses with WinjoPro")
    ).toBeInTheDocument()
  })

  it("displays all testimonials with correct content", () => {
    render(<Testimonials dict={mockDict} />)
    
    const testimonials = [
      "Mary Wanjiku",
      "John Kiprotich",
      "Grace Achieng"
    ]
    
    testimonials.forEach(name => {
      expect(screen.getByText(name)).toBeInTheDocument()
    })
  })

  it("displays the correct number of testimonials", () => {
    render(<Testimonials dict={mockDict} />)
    // Find testimonial cards by looking for the card content
    const testimonialCards = screen.getAllByText(/Street Food Vendor|School Kitchen Manager|Catering Business Owner/)
    expect(testimonialCards).toHaveLength(3)
  })

  it("shows the correct rating for each testimonial", () => {
    render(<Testimonials dict={mockDict} />)
    // Find all star SVGs by their class
    const stars = document.querySelectorAll('.lucide-star')
    // 3 testimonials × 5 stars each = 15 stars
    expect(stars).toHaveLength(15)
  })
})
