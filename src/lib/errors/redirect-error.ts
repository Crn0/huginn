import { CustomError, type CustomErrorOptions } from "./custom-error";

type RedirectErrorOptions = Omit<CustomErrorOptions, "code">;

const normalizeRedirectTo = (redirectTo: string) => {
  let path = redirectTo;

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  if (path.endsWith("/")) {
    path = path.slice(0, path.length - 1);
  }

  return path;
};

export class RedirectError extends CustomError<"REDIRECT_ERROR"> {
  readonly kind: "REDIRECT_ERROR" = "REDIRECT_ERROR" as const;
  private _redirectTo?: string;

  constructor(message: string, ops?: RedirectErrorOptions) {
    super(message, {
      ...ops,
      code: "REDIRECT",
      status: ops?.status ?? 300, // See Other
      isOperational:
        typeof ops?.isOperational === "boolean" ? ops.isOperational : true,
    });
  }

  redirect() {
    if (typeof this._redirectTo !== "string") {
      throw new TypeError(
        `redirectTo is not type of string; received: ${this._redirectTo}`
      );
    }

    window.location.replace(this._redirectTo);
  }

  to(redirectTo: string) {
    if (typeof this._redirectTo === "string") {
      this._redirectTo = `${this._redirectTo}${normalizeRedirectTo(redirectTo)}`;
    } else {
      this._redirectTo = normalizeRedirectTo(redirectTo);
    }

    return this;
  }

  get redirectTo() {
    return this._redirectTo;
  }
}
