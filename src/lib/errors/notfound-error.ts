import { CustomError, type CustomErrorOptions } from "./custom-error.js";

export type NotFoundErrorOptions = Omit<CustomErrorOptions, "status" | "code">;

export class NotFoundError extends CustomError<"NOT_FOUND_ERROR"> {
  readonly kind: "NOT_FOUND_ERROR" = "NOT_FOUND_ERROR" as const;

  constructor(message: string, ops?: NotFoundErrorOptions) {
    super(message, {
      ...ops,
      code: "NOT_FOUND",
      status: 404,
    });
  }
}
