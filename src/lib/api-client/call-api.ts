import type { ErrorType } from "../errors/errors.type";
import type { CallApiConfig } from "./types";

import { errorHandler, handleResponseError } from "@/lib/errors";

const isBodyInit = (data: unknown): data is BodyInit => {
  return (
    typeof data === "string" ||
    data instanceof Blob ||
    data instanceof FormData ||
    data instanceof URLSearchParams ||
    data instanceof ReadableStream ||
    ArrayBuffer.isView(data) ||
    data instanceof ArrayBuffer
  );
};

const generateHeader = (config: CallApiConfig) => {
  let headers = config?.headers;

  if (headers && typeof headers === "object") {
    headers = new Headers(headers);
  }

  if (!headers) {
    headers = new Headers();
  }

  return headers;
};

const handlePayload = (data: Pick<CallApiConfig, "data">["data"]) => {
  if (data == null) return null;

  if (isBodyInit(data)) {
    return data;
  }

  return JSON.stringify(data);
};

const generateFetchOptions = (config: CallApiConfig, token?: string) => {
  const { data, ...rest } = config;

  rest.headers = generateHeader(rest);

  if (token) {
    rest.headers.set("Authorization", `Bearer ${token}`);
  }

  const options: RequestInit = { ...rest };

  if (data && !isBodyInit(data) && typeof data === "object") {
    if (!(options.headers instanceof Headers)) {
      options.headers = rest.headers;

    } 

     options.headers.set("Accept", "application/json")
      options.headers.set("Content-Type", "application/json")


  }

  options.body = handlePayload(data);

  return options;
};

export const callAPIWithToken = async (
  url: string,
  token: string,
  configs: CallApiConfig
) => {
  const cloneConfig = { ...configs } satisfies CallApiConfig;

  const fetchOptions = generateFetchOptions(cloneConfig, token);

  const response = await fetch(url, {
    ...fetchOptions,
  });

  const responseError = await handleResponseError(response);

  if (responseError) {
    throw errorHandler(responseError as ErrorType);
  }

  return response;
};

export const callAPIWithoutToken = async (
  url: string,
  configs: CallApiConfig
) => {
  const cloneConfig = { ...configs } satisfies CallApiConfig;

  const fetchOptions = generateFetchOptions(cloneConfig);

  const response = await fetch(url, {
    ...fetchOptions,
  });

  const responseError = await handleResponseError(response);

  if (responseError) {
    throw errorHandler(responseError as ErrorType);
  }

  return response;
};
