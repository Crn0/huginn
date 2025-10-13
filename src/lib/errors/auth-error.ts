import { CustomError } from "./custom-error.js";

export class AuthenticationError extends CustomError<"AUTHENTICATION_ERROR"> {
  readonly kind: "AUTHENTICATION_ERROR" = "AUTHENTICATION_ERROR" as const;

  constructor(message: string) {
    super(message, {
      code: "AUTHENTICATION_ERROR",
      status: 401,
      isOperational: false,
    });
  }
}
