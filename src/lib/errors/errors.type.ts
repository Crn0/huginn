import type { ApiError } from "./api-error";
import type { AuthenticationError } from "./auth-error";
import type { RedirectError } from "./redirect-error";
import type { ValidationError } from "./validation-error";

export type ErrorType =
  | ApiError
  | AuthenticationError
  | ValidationError
  | RedirectError
  | RedirectError;
