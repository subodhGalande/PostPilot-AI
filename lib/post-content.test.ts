import { describe, it, expect } from "vitest";
import { countWords } from "./post-content";

describe("post content logic", () => {
  describe("countWords", () => {
    it("handles standard whitespace", () => {
      expect(countWords("this is a test")).toBe(4);
    });

    it("handles multiple spaces and newlines", () => {
      expect(countWords("this   is\na\r\n\r\ntest")).toBe(4);
    });

    it("returns 0 for empty strings or just whitespace", () => {
      expect(countWords("")).toBe(0);
      expect(countWords("   \n\r\n  ")).toBe(0);
    });
  });
});
