import { beforeAll, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { MockUrl } from "@/testing/mocks/url";

import { useObjectUrl } from "../use-object-url";

const file = new File(["Hello world"], "hello.txt", { type: "text/plain" });

beforeAll(() => {
  const createObjectURL =
    URL.createObjectURL as (typeof MockUrl)["createObjectURL"];

  createObjectURL.mockReturnValue(
    "blob:http://localhost:3000/8f9c7e12-0f4d-4c2d-9a0c-123456789abc"
  );

  return () => {
    vi.resetAllMocks();
  };
});

it("should generate a url string when there's a file", () => {
  const { result } = renderHook(() => useObjectUrl(file));
  const [url] = result.current;

  expect(url).toBeTypeOf("string");
  expect(url).toMatch(/^blob:/);
});

it("should revoke the url", () => {
  const { result } = renderHook(() => useObjectUrl(file));

  const [, revokeUrl] = result.current;

  act(() => {
    revokeUrl();
  });

  const [url] = result.current;

  expect(url).toBeNull();
});

it("should revoke the previous url when the file changed", () => {
  const revokeObjectURL =
    URL.createObjectURL as (typeof MockUrl)["revokeObjectURL"];

  const { rerender } = renderHook((prop: File) => useObjectUrl(prop), {
    initialProps: file,
  });

  const newFile = new File(["New file"], "new-file.txt", {
    type: "text/plain",
  });

  rerender(newFile);

  expect(revokeObjectURL).toHaveBeenCalled();
});

it("should return null when there's no file", () => {
  const { result } = renderHook(() => useObjectUrl(null));

  const [url] = result.current;

  expect(url).toBeNull();
});
