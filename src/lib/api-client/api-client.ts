import type { Client, CallApiConfig, Provider } from "./types";

import { RedirectError } from "@/lib/errors";
import { tryCatch } from "@/lib/try-catch";
import { callAPIWithoutToken, callAPIWithToken } from "./call-api";

export class ApiClient implements Client {
  private _baseUrl: string;
  private _refreshPromise: Promise<string> | null;
  private _provider: Provider;
  private _config: CallApiConfig = {
    isAuth: false,
    redirectOnAuthFail: "/login",
  };

  private async waitForBackgroundRefresh() {
    if (this._refreshPromise) {
      const { error } = await tryCatch(this._refreshPromise);

      this._refreshPromise = null;

      if (error) throw error;
    }
  }

  private handleUnauthUser(redirectOnAuthFail?: string): never {
    const redirectTo = window.location.pathname + window.location.search;

    const path = redirectOnAuthFail
      ? `${redirectOnAuthFail}?redirectTo=${encodeURIComponent(redirectTo)}`
      : `/login?redirectTo=${encodeURIComponent(redirectTo)}`;

    throw new RedirectError("No valid access token, trying to silent login").to(
      path
    );
  }

  constructor(baseURL: string, provider: Provider, config?: CallApiConfig) {
    this._baseUrl = baseURL;

    this._provider = provider;

    this._refreshPromise = null;

    if (typeof config === "object") {
      this._config = {
        ...this._config,
        ...config,
      };
    }

    if (!this._baseUrl.endsWith("/")) {
      this._baseUrl += "/";
    }
  }

  async callApi(resource: string, config: CallApiConfig = this._config) {
    const url = `${this._baseUrl}${resource}`;

    if (!config.isAuth) return callAPIWithoutToken(url, config);

    if (typeof config.redirectOnAuthFail === "string") {
      if (!config.redirectOnAuthFail.startsWith("/")) {
        config.redirectOnAuthFail = `/${config.redirectOnAuthFail}`;
      } else {
        config.redirectOnAuthFail = `${config.redirectOnAuthFail}`;
      }
    }

    let token = this._provider.getToken();

    await this.waitForBackgroundRefresh();

    token = this._provider.getToken();

    if (!token) {
      this.handleUnauthUser(config.redirectOnAuthFail);
    }

    const { error: responseError, data: response } = await tryCatch(
      callAPIWithToken(url, token, config)
    );

    if (!responseError) {
      return response;
    }

    if (responseError.status !== 401) {
      throw responseError;
    }

    if (responseError.status === 401 && !this._refreshPromise) {
      this._refreshPromise = this._provider.refreshToken();

      const { error, data: newToken } = await tryCatch(this._refreshPromise);

      if (error?.status === 401 || error?.message === "Failed to fetch")
        throw error;

      this._provider.setToken(newToken);

      this._refreshPromise = null;
    }

    await this.waitForBackgroundRefresh();

    token = this._provider.getToken();

    if (!token) {
      this.handleUnauthUser(config.redirectOnAuthFail);
    }

    const { error: retryError, data: retryResponse } = await tryCatch(
      callAPIWithToken(url, token, config)
    );

    if (retryError) {
      throw retryError;
    }

    return retryResponse;
  }

  get baseUrl() {
    return this._baseUrl;
  }

  get provider() {
    return this._provider;
  }

  get refreshPromise() {
    return this._refreshPromise;
  }
}
