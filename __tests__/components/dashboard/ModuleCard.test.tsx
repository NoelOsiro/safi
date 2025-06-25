import { render, screen } from "@testing-library/react";
import { ModuleCard } from "@/components/dassboard/ModuleCard";
import type { Module } from "@/app/[lang]/dashboard/types";

const mockModule: Module = {
  id: "1",
  title: "Food Safety Basics",
  description: "Learn the fundamentals of food safety",
  icon: "📚",
  duration: "30 min",
  level: "beginner",
  image: "/module1.jpg",
  progress: 65,
  status: "in-progress",
};

describe("ModuleCard", () => {
  const href = `/dashboard/module/${mockModule.id}`;

  it("renders module information correctly", () => {
    render(<ModuleCard module={mockModule} href={href} />);
    
    expect(screen.getByText(/Module 1: Food Safety Basics/)).toBeInTheDocument();
    expect(screen.getByText(/Learn the fundamentals of food safety/)).toBeInTheDocument();
    expect(screen.getByText(/65%/)).toBeInTheDocument();
    expect(screen.getByText(/In Progress/)).toBeInTheDocument();
    expect(screen.getByText(/30 min/)).toBeInTheDocument();
  });

  it("renders a link to the module page", () => {
    render(<ModuleCard module={mockModule} href={href} />);
    
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", href);
  });

  it("shows correct button based on status", () => {
    const { rerender } = render(
      <ModuleCard module={mockModule} href={href} />
    );
    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();

    const completedModule = { ...mockModule, status: "completed" as Module["status"], progress: 100 };
    rerender(<ModuleCard module={completedModule} href={href} />);
    expect(screen.getByRole("button", { name: /review/i })).toBeInTheDocument();

    const notStartedModule = { ...mockModule, status: "not-started" as Module["status"], progress: 0 };
    rerender(<ModuleCard module={notStartedModule} href={href} />);
    expect(screen.getByRole("button", { name: /start module/i })).toBeInTheDocument();
  });

  it("renders 'Ask AI' button", () => {
    render(<ModuleCard module={mockModule} href={href} />);
    expect(screen.getByRole("button", { name: /ask ai/i })).toBeInTheDocument();
  });
});
