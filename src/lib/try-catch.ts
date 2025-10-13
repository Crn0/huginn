import type { ErrorType } from "./errors/errors.type";

import { debugError } from "./logger";

export type OperationSuccess<T> = { error: null; data: T };
export type OperationFailure<E> = { error: E; data: null };
export type OperationResult<T, E> = OperationSuccess<T> | OperationFailure<E>;

type Operation<T> = Promise<T> | (() => Promise<T>) | (() => T);
type OnFinally = (() => void) | (() => Promise<void>);
type TransformError<E extends ErrorType> = (message: string) => E;
type Options<E extends ErrorType> = {
  transformError?: TransformError<E>;
  onFinally?: OnFinally;
};

export function tryCatch<T, E extends ErrorType>(
  operation: Promise<T>,
  options?: Options<E>
): Promise<OperationResult<T, E>>;
export function tryCatch<T, E extends ErrorType>(
  operation: T,
  options?: Options<E>
): Promise<OperationResult<T, E>>;
export function tryCatch<T, E extends ErrorType>(
  operation: () => Promise<T>,
  options?: Options<E>
): Promise<OperationResult<T, E>>;
export function tryCatch<T, E extends ErrorType>(
  operation: Operation<T>,
  options?: Options<E>
): OperationResult<T, E> | Promise<OperationResult<T, E>> {
  const opts = typeof options === "object" && options ? options : {};

  const transformError = opts?.transformError;
  const onFinally = opts?.onFinally;

  try {
    const result = typeof operation === "function" ? operation() : operation;

    if (isPromise(result)) {
      return Promise.resolve(result)
        .then((data) => onSuccess(data))
        .catch((error) => onFailure(error));
    }

    return onSuccess(result);
  } catch (e) {
    debugError(e);

    if (typeof transformError === "function") {
      return { error: transformError(String(e)), data: null };
    }

    return onFailure<E>(e);
  } finally {
    const cleanUp = typeof onFinally === "function" ? onFinally() : onFinally;

    Promise.resolve(cleanUp).then().catch(debugError);
  }
}

const onSuccess = <T>(data: T): OperationSuccess<T> => {
  return { data, error: null };
};

const onFailure = <E>(error: unknown): OperationFailure<E> => {
  const message = String(error) || "Something went wrong";

  const errorParsed = error instanceof Error ? error : new Error(message);

  return { error: errorParsed as E, data: null };
};

const isPromise = <T = unknown>(value: unknown): value is Promise<T> => {
  return (
    !!value &&
    (typeof value === "object" || typeof value === "function") &&
    typeof (value as Promise<T>).then === "function"
  );
};
