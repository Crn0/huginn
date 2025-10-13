import { CustomError, type CustomErrorOptions } from "./custom-error.js";

export type ApiErrorOptions = Omit<CustomErrorOptions, "status">;

export class ApiError extends CustomError<"API_ERROR"> {
  readonly kind: "API_ERROR" = "API_ERROR" as const;

  constructor(message: string, status: number, ops?: ApiErrorOptions) {
    super(message, {
      ...ops,
      status,
      code: ops?.code ?? "API_ERROR",
      isOperational:
        typeof ops?.isOperational === "boolean" ? ops.isOperational : true,
    });
  }
}
