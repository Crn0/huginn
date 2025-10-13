export type ErrorKind =
  | "API_ERROR"
  | "BAD_REQUEST_ERROR"
  | "CONFLICT_ERROR"
  | "FORBIDDEN_ERROR"
  | "INTERNAL_SERVER_ERROR"
  | "NOT_FOUND_ERROR"
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "REDIRECT_ERROR"
  | "CUSTOM_ERROR";

export interface CustomErrorOptions {
  code: string;
  status: number;
  isOperational?: boolean;
}

export abstract class CustomError<TKind extends ErrorKind> extends Error {
  abstract readonly kind: TKind;
  readonly code: TKind | string;
  readonly status: number;
  readonly isOperational: boolean;

  constructor(
    message: string,
    { code, status, isOperational = true }: CustomErrorOptions
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = new.target.name;
    this.isOperational = isOperational;
    this.code = code;
    this.status = status;

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
