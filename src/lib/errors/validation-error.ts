import { CustomError, type CustomErrorOptions } from "./custom-error.js";

import type z from "zod";

type ValidationErrorOptions = Omit<CustomErrorOptions, "status" | "code">;

export class ValidationError extends CustomError<"VALIDATION_ERROR"> {
  readonly kind: "VALIDATION_ERROR" = "VALIDATION_ERROR" as const;
  private _issues: z.core.$ZodIssue[];

  constructor(
    message: string,
    issues: z.core.$ZodIssue[],
    ops?: ValidationErrorOptions
  ) {
    super(message, {
      ...ops,
      code: "VALIDATION_ERROR",
      status: 422,
      isOperational:
        typeof ops?.isOperational === "boolean" ? ops.isOperational : true,
    });
    this._issues = issues;
  }

  get issues() {
    return this._issues;
  }
}
