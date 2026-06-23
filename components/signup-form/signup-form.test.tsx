import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SignupForm } from "./signup-form";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("SignupForm", () => {
  it("renders the sign up form", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SignupForm />
      </QueryClientProvider>,
    );
    expect(
      screen.getByRole("heading", { name: /welcome to postpilot ai/i }),
    ).toBeDefined();
    expect(screen.getByLabelText(/full name/i)).toBeDefined();
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/^password/i)).toBeDefined();
  });

  it("shows validation errors for empty submission", async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <SignupForm />
      </QueryClientProvider>,
    );
    const button = screen.getByRole("button", { name: /create account/i });
    await user.click(button);

    // Expect error messages to appear
    expect(
      await screen.findByText(/Name must be at least 2 characters long/i),
    ).toBeDefined();
    expect(await screen.findByText(/Invalid email address/i)).toBeDefined();
  });
});
