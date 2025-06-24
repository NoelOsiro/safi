import { render, screen } from "@testing-library/react"
import { ProgressCards } from "@/components/dassboard/ProgressCards"

describe("ProgressCards", () => {
  const defaultProps = {
    overallProgress: 65,
    completedModules: 3,
    totalModules: 5,
  }

  it("renders all progress cards with correct values", () => {
    render(<ProgressCards {...defaultProps} />)
    
    // Check overall progress card
    expect(screen.getByText("Overall Progress")).toBeInTheDocument()
    expect(screen.getByText("65%")).toBeInTheDocument()
    
    // Check modules completed card
    expect(screen.getByText("Modules Completed")).toBeInTheDocument()
    expect(screen.getByText("3/5")).toBeInTheDocument()
    expect(screen.getByText("2 modules remaining")).toBeInTheDocument()
    
    // Check study time card
    expect(screen.getByText("Study Time")).toBeInTheDocument()
    expect(screen.getByText("2.5h")).toBeInTheDocument()
    
    // Check certification ready card
    expect(screen.getByText("Certification Ready")).toBeInTheDocument()
    expect(screen.getByText("75%")).toBeInTheDocument()
  })

  it("shows correct remaining modules text for singular", () => {
    render(
      <ProgressCards
        overallProgress={100}
        completedModules={4}
        totalModules={5}
      />
    )
    
    expect(screen.getByText("1 module remaining")).toBeInTheDocument()
  })
})
