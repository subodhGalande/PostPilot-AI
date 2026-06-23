import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogoutButton } from "./logout-button";

// Mock useRouter
const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe("LogoutButton", () => {
  it("renders correctly", () => {
    render(<LogoutButton />);
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeDefined();
  });

  it("calls the logout API and redirects on click", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true });
    const user = userEvent.setup();
    render(<LogoutButton />);

    const button = screen.getByRole("button", { name: "Sign Out" });
    await user.click(button);

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
    });

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/login");
    });
  });

  it("logs an error if the API fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    fetchMock.mockRejectedValueOnce(new Error("Network Error"));
    const user = userEvent.setup();

    render(<LogoutButton />);
    const button = screen.getByRole("button", { name: "Sign Out" });
    await user.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Logout failed",
        expect.any(Error),
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
