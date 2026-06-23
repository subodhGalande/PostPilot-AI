import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoginForm } from "./login-form";
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

describe("LoginForm", () => {
  it("renders the login form correctly", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LoginForm />
      </QueryClientProvider>,
    );
    expect(
      screen.getByRole("heading", { name: /welcome to postpilot ai/i }),
    ).toBeDefined();
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/^password/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /login/i })).toBeDefined();
  });

  it("shows validation errors when submitting an empty form", async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <LoginForm />
      </QueryClientProvider>,
    );

    const button = screen.getByRole("button", { name: /login/i });
    await user.click(button);

    // Zod validation errors
    expect(await screen.findByText(/Invalid email address/i)).toBeDefined();
    expect(
      await screen.findByText(/Password must be at least 8 characters long/i),
    ).toBeDefined();
  });
});
