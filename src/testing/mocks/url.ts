import { vi } from "vitest";

export const MockUrl = {
  createObjectURL: vi.fn(),
  revokeObjectURL: vi.fn(),
  toString: () => "URL",
  valueOf: () => "URL",
} as const;
