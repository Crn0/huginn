import { CustomError, type CustomErrorOptions } from "./custom-error.js";

type ErrorField = {
  code: string;
  message: string;
  path?: string[];
  entity?: string;
};

export type ConflictErrorOptions = Omit<CustomErrorOptions, "status" | "code">;

export class ConflictError extends CustomError<"CONFLICT_ERROR"> {
  readonly kind: "CONFLICT_ERROR" = "CONFLICT_ERROR" as const;
  private _field: ErrorField;

  constructor(message: string, field: ErrorField, ops?: ConflictErrorOptions) {
    super(message, {
      ...ops,
      code: "CONFLICT_ERROR",
      status: 409,
      isOperational:
        typeof ops?.isOperational === "boolean" ? ops.isOperational : true,
    });

    this._field = field;
  }

  get field() {
    return this._field;
  }
}
