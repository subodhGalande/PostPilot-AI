import "@testing-library/jest-dom";
import { vi } from "vitest";
import "./setup/api-mocks";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock arcjet
vi.mock("@/lib/arcjet", () => {
  const mockAj = {
    withRule: vi.fn().mockReturnThis(),
    protect: vi.fn().mockResolvedValue({
      isDenied: () => false,
      isSpoofed: () => false,
      reason: { isRateLimit: () => false, isBot: () => false },
    }),
  };
  return {
    aj: mockAj,
    default: mockAj,
  };
});

vi.mock("@arcjet/next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@arcjet/next")>();
  return {
    ...actual,
    detectBot: vi.fn(),
    detectPromptInjection: vi.fn(),
    slidingWindow: vi.fn(),
  };
});
