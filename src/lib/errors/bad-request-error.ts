import { CustomError, type CustomErrorOptions } from "./custom-error.js";

export type BadRequestErrorOptions = Omit<
  CustomErrorOptions,
  "status" | "code"
>;

export class BadRequestError extends CustomError<"BAD_REQUEST_ERROR"> {
  readonly kind: "BAD_REQUEST_ERROR" = "BAD_REQUEST_ERROR" as const;

  constructor(message: string, ops?: BadRequestErrorOptions) {
    super(message, {
      ...ops,
      code: "BAD_REQUEST_ERROR",
      status: 400,
      isOperational:
        typeof ops?.isOperational === "boolean" ? ops.isOperational : true,
    });
  }
}
