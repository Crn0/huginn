import "@testing-library/jest-dom";
import { afterEach, beforeAll, vi } from "vitest";

import { ResizeObserverMock } from "./mocks/resize-observer";
import { server } from "./mocks/server";
import { cleanup } from "@testing-library/react";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  vi.mock("zustand");

  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  vi.stubGlobal("scrollTo", vi.fn());

  return () => {
    server.close();
    vi.restoreAllMocks();
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  server.resetHandlers();
  cleanup();
});
