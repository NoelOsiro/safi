import { render, screen } from "@testing-library/react"
import { LoadingSpinner } from "@/components/dassboard/LoadingSpinner"

describe("LoadingSpinner", () => {
  it("renders with default props", () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByTestId("loading-spinner")
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass("min-h-[60vh]")
  })

  it("renders with full screen when fullScreen is true", () => {
    render(<LoadingSpinner fullScreen />)
    const spinner = screen.getByTestId("loading-spinner")
    expect(spinner).toHaveClass("min-h-screen")
  })

  it("has the correct spinner icon", () => {
    render(<LoadingSpinner />)
    const spinnerIcon = screen.getByTestId("loading-spinner").querySelector("svg")
    expect(spinnerIcon).toBeInTheDocument()
    expect(spinnerIcon).toHaveClass("animate-spin")
    expect(spinnerIcon).toHaveClass("text-emerald-600")
  })
})
