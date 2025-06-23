/// <reference types="@testing-library/jest-dom" />

// This file extends the global Jest namespace with custom matchers from @testing-library/jest-dom
declare namespace jest {
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toHaveAttribute(attr: string, value?: any): R;
    // Add other custom matchers you use from @testing-library/jest-dom
  }
}
