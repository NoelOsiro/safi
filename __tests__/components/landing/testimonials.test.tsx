import { render, screen } from "@testing-library/react"
import { Testimonials } from "@/components/landing/testimonials"

describe("Testimonials", () => {
  it("renders the testimonials section with correct title", () => {
    render(<Testimonials />)
    
    expect(screen.getByText("Success Stories")).toBeInTheDocument()
    expect(
      screen.getByText("Hear from vendors who transformed their businesses with WinjoPro")
    ).toBeInTheDocument()
  })

  it("displays all testimonials with correct content", () => {
    render(<Testimonials />)
    
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
    render(<Testimonials />)
    // Find testimonial cards by looking for the card content
    const testimonialCards = screen.getAllByText(/Street Food Vendor|School Kitchen Manager|Catering Business Owner/)
    expect(testimonialCards).toHaveLength(3)
  })

  it("shows the correct rating for each testimonial", () => {
    render(<Testimonials />)
    // Find all star SVGs by their class
    const stars = document.querySelectorAll('.lucide-star')
    // 3 testimonials × 5 stars each = 15 stars
    expect(stars).toHaveLength(15)
  })
})
