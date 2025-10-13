export interface Provider {
  getToken: () => string | null;
  setToken: (token: string | null) => void;
  /**
   * Refreshes the access token.
   *
   * @param signal - Optional `AbortSignal` to cancel the request.
   * @returns A promise that resolves to the new access token.
   */
  refreshToken: (signal?: AbortSignal) => Promise<string>;
}

export interface Client {
  baseUrl: string;
  /**
   * A promise representing an in-progress token refresh.
   * `null` if no refresh is currently happening.
   */
  refreshPromise: Promise<string> | null;
  provider: Provider;
  /**
   * Performs an API request against the configured `baseUrl`.
   *
   * Automatically attaches authentication headers if
   * {@link CallApiConfig.isAuth | `config.isAuth`} is `true`.
   *
   * @param resource - The API endpoint path, relative to `baseUrl`.
   * @param config - Additional request configuration.
   * @returns A promise that resolves to the raw `Response` object.
   *
   * @example
   * ```ts
   * // Example: Unauthenticated request
   * const response = await client.callApi("public/data", {
   *   method: "GET",
   * });
   * const data = await response.json();
   * ```
   *
   * @example
   * ```ts
   * // Example: Authenticated request
   * const response = await client.callApi("user/profile", {
   *   method: "GET",
   *   isAuth: true,
   * });
   * const profile = await response.json();
   * ```
   */
  callApi: (resource: string, config: CallApiConfig) => Promise<Response>;
}

export interface CallApiConfig extends Omit<RequestInit, "body"> {
  headers?: Headers;
  /**
   * Whether the request requires authentication.
   *
   * @default false
   */
  isAuth?: boolean;
  /**
   * Path to redirect to if the user is unauthenticated.
   *
   * @default "login"
   */
  redirectOnAuthFail?: string;

  /**
   * Data payload to be sent as the request body.
   *
   * - If an object literal **or a number** is provided, it will be serialized to JSON.
   * - If a `BodyInit` type (e.g., `string`, `FormData`, `Blob`) is provided,
   *   it will be passed through as-is.
   * - `null` means no body is sent.
   */
  data?: Record<string, unknown> | BodyInit | number | null;
}
