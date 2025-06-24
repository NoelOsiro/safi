import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorMessage } from "@/components/dassboard/ErrorMessage";

describe("ErrorMessage", () => {
  it("displays the error message", () => {
    const errorMessage = "An error occurred while loading data";
    render(<ErrorMessage message={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const onRetry = jest.fn();
    render(<ErrorMessage message="Error" onRetry={onRetry} />);
    
    const retryButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not call onRetry when it is not provided", () => {
    const onRetry = jest.fn();
    render(<ErrorMessage message="Error" />);
    
    const retryButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryButton);
    
    expect(onRetry).not.toHaveBeenCalled();
  });
});
