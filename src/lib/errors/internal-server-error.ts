import { CustomError, type CustomErrorOptions } from "./custom-error.js";

export type InternalServerErrorOptions = Omit<
  CustomErrorOptions,
  "status" | "code"
>;

export class InternalServerError extends CustomError<"INTERNAL_SERVER_ERROR"> {
  readonly kind: "INTERNAL_SERVER_ERROR" = "INTERNAL_SERVER_ERROR" as const;

  constructor(message: string, ops?: InternalServerErrorOptions) {
    super(message, {
      ...ops,
      code: "INTERNAL_SERVER_ERROR",
      status: 500,
    });
  }
}
