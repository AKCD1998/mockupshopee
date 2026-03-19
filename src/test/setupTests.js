import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

beforeAll(() => {
  Object.defineProperty(window, "scrollTo", {
    writable: true,
    value: vi.fn(),
  });

  Object.defineProperty(HTMLElement.prototype, "scrollBy", {
    writable: true,
    value: vi.fn(),
  });

  if (!globalThis.URL.createObjectURL) {
    globalThis.URL.createObjectURL = vi.fn(() => "blob:mock-object-url");
  }

  if (!globalThis.URL.revokeObjectURL) {
    globalThis.URL.revokeObjectURL = vi.fn();
  }
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});
