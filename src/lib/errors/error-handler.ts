import type { ErrorType } from "./errors.type";
import { debug } from "@/lib/logger";

export const errorHandler = <T extends ErrorType>(error: T): T => {
  if (error.kind === "REDIRECT_ERROR") {
    error.redirect();

    return error;
  }

  if (error.isOperational) {
    debug(String(error));

    return error;
  }

  throw error;
};
