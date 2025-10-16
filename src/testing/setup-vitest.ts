import "@testing-library/jest-dom";
import { beforeAll, vi } from "vitest";

import { ResizeObserverMock } from "./mocks/resize-observer";

beforeAll(() => {
  vi.mock("zustand");
  
  vi.stubGlobal("ResizeObserver", ResizeObserverMock)
  vi.stubGlobal("scrollTo", vi.fn())

  return () => {
    vi.restoreAllMocks();
  };
});
