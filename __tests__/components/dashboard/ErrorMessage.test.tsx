import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorMessage } from "@/components/dassboard/ErrorMessage";

// 👇 Mock window.location.reload since jsdom does not implement it
beforeAll(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { ...window.location, reload: jest.fn() },
  });
});

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

  it("calls window.location.reload when onRetry is not provided", () => {
    const reloadSpy = jest.spyOn(window.location, "reload");
    render(<ErrorMessage message="Error" />);
    
    const retryButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryButton);
    
    expect(reloadSpy).toHaveBeenCalled();
  });
});
