import { render, screen, fireEvent } from "@testing-library/react"
import { ModuleCard } from "@/components/dassboard/ModuleCard"
import type { Module } from "@/app/dashboard/types"

const mockModule: Module = {
  id: "1",
  title: "Food Safety Basics",
  description: "Learn the fundamentals of food safety",
  icon: "📚",
  duration: "30 min",
  level: "beginner",
  image: "/module1.jpg",
  progress: 65,
  status: "in-progress" as const,
}

describe("ModuleCard", () => {
  const handleModuleClick = jest.fn()

  beforeEach(() => {
    handleModuleClick.mockClear()
  })

  it("renders module information correctly", () => {
    render(<ModuleCard module={mockModule} onModuleClick={handleModuleClick} />)
    
    expect(screen.getByText(/Module 1: Food Safety Basics/)).toBeInTheDocument()
    expect(screen.getByText(/Learn the fundamentals of food safety/)).toBeInTheDocument()
    expect(screen.getByText(/65%/)).toBeInTheDocument()
    expect(screen.getByText(/In Progress/)).toBeInTheDocument()
    expect(screen.getByText(/30 min/)).toBeInTheDocument()
  })

  it("calls onModuleClick when card is clicked", () => {
    render(<ModuleCard module={mockModule} onModuleClick={handleModuleClick} />)
    
    const card = screen.getByTestId("module-card")
    fireEvent.click(card)
    
    expect(handleModuleClick).toHaveBeenCalledWith("1")
  })

  it("shows correct button based on status", () => {
    // Test in-progress status
    const { rerender } = render(
      <ModuleCard module={mockModule} onModuleClick={handleModuleClick} />
    )
    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument()

    // Test completed status
    const completedModule = { ...mockModule, status: "completed" as const, progress: 100 }
    rerender(<ModuleCard module={completedModule} onModuleClick={handleModuleClick} />)
    expect(screen.getByRole("button", { name: /review/i })).toBeInTheDocument()

    // Test not-started status
    const notStartedModule = { ...mockModule, status: "not-started" as const, progress: 0 }
    rerender(<ModuleCard module={notStartedModule} onModuleClick={handleModuleClick} />)
    expect(screen.getByRole("button", { name: /start module/i })).toBeInTheDocument()
  })
})
