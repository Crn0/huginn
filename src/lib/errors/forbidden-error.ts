import { CustomError, type CustomErrorOptions } from "./custom-error.js";

export type ForbiddenErrorOptions = Omit<CustomErrorOptions, "status" | "code">;

export class ForbiddenError extends CustomError<"FORBIDDEN_ERROR"> {
  readonly kind: "FORBIDDEN_ERROR" = "FORBIDDEN_ERROR" as const;

  constructor(message: string, ops?: ForbiddenErrorOptions) {
    super(message, {
      ...ops,
      code: "FORBIDDEN_ERROR",
      status: 403,
    });
  }
}
