import "@testing-library/jest-dom";
import { beforeAll, vi } from "vitest";

import { ResizeObserverMock } from "./mocks/resize-observer";
import { MockUrl } from "./mocks/url";

beforeAll(() => {
  vi.mock("zustand");

  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubGlobal("URL", MockUrl);

  return () => {
    vi.restoreAllMocks();
  };
});
