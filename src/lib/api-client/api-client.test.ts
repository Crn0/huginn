import { describe, it, expect, vi, beforeEach } from "vitest";

import { env } from "@/configs/env";
import * as callApi from "./call-api";
import { ApiClient } from "./api-client";
import { AuthenticationError } from "../errors";

const fakeProvider = () => {
  let token: string | null = null;

  return {
    getToken: () => token,
    setToken: (t: typeof token) => {
      token = t;
    },
    refreshToken: async () => {
      token = "new-token";
      return token;
    },
  };
};

beforeEach(() => {
  vi.spyOn(callApi, "callAPIWithoutToken").mockResolvedValue(new Response());
  vi.spyOn(callApi, "callAPIWithToken").mockResolvedValue(new Response());

  return () => vi.clearAllMocks();
});

describe("ApiClient (smoke test)", () => {
  it("calls without token when isAuth is false", async () => {
    const client = new ApiClient(env.SERVER_URL, fakeProvider());

    const res = await client.callApi("resource", { isAuth: false });

    expect(res).instanceOf(Response);
    expect(callApi.callAPIWithoutToken).toHaveBeenCalled();
  });

  it("calls with token when isAuth is true", async () => {
    const provider = fakeProvider();

    provider.setToken("abc");

    const client = new ApiClient(env.SERVER_URL, provider);

    const res = await client.callApi("resource", { isAuth: true });

    expect(res).instanceOf(Response);
    expect(callApi.callAPIWithToken).toHaveBeenCalled();
  });

  it("refreshes the token when an authentication error occurs", async () => {
    const provider = fakeProvider();

    provider.setToken("abc");

    vi.spyOn(callApi, "callAPIWithToken")
      .mockRejectedValueOnce(
        new AuthenticationError("Invalid or expired token")
      )
      .mockResolvedValue(new Response());

    const client = new ApiClient(env.SERVER_URL, provider);

    const res = await client.callApi("resource", { isAuth: true });

    expect(res).instanceOf(Response);

    expect(callApi.callAPIWithToken).toHaveBeenCalledTimes(2);
    expect(provider.getToken()).toMatch("new-token");
  });
});
