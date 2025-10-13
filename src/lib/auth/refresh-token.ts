import { env } from "@/configs/env";
import { errorHandler } from "@/lib/errors/error-handler";
import { handleResponseError } from "../errors";
import type { ErrorType } from "../errors/errors.type";

export const refreshToken = async (signal?: AbortSignal): Promise<string> => {
  const url = `${env.SERVER_URL}/auth/refresh-tokens`;

  const res = await fetch(url, {
    signal,
    method: "POST",
    credentials: "include",
  });

  const error = await handleResponseError(res);

  if (error) {
    throw errorHandler(error as ErrorType);
  }

  const token = (await res.json()).token;

  return token;
};
