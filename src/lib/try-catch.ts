import { debugError } from "./logger";

export type OperationSuccess<T> = { error: null; data: T };
export type OperationFailure<E> = { error: E; data: null };
export type OperationResult<T, E> = OperationSuccess<T> | OperationFailure<E>;

type Identity<T> = {
  [Key in keyof T]: T[Key];
};

type Operation<T> = Promise<T> | (() => Promise<T>) | (() => T);
type TransformError<TError> = (options: Identity<TError>) => TError;

export function tryCatch<TResult, TError extends Error & { status?: number }>(
  operation: () => TResult,
  transformError?: TransformError<TError>
): OperationResult<TResult, TError>;
export function tryCatch<TResult, TError extends Error & { status?: number }>(
  operation: Promise<TResult>,
  transformError?: TransformError<TError>
): Promise<OperationResult<TResult, TError>>;
export function tryCatch<TResult, TError extends Error & { status?: number }>(
  operation: TResult,
  transformError?: TransformError<TError>
): Promise<OperationResult<TResult, TError>>;
export function tryCatch<TResult, TError extends Error & { status?: number }>(
  operation: () => Promise<TResult>,
  transformError?: TransformError<TError>
): Promise<OperationResult<TResult, TError>>;
export function tryCatch<TResult, TError extends Error & { status?: number }>(
  operation: Operation<TResult>,
  transformError?: TransformError<TError>
):
  | OperationResult<TResult, TError>
  | Promise<OperationResult<TResult, TError>> {
  try {
    const result = typeof operation === "function" ? operation() : operation;

    if (isPromise(result)) {
      return Promise.resolve(result)
        .then((data) => onSuccess(data))
        .catch((error) => {
          const err =
            typeof transformError === "function"
              ? transformError(error as TError)
              : error;

          return onFailure<TError>(err);
        });
    }

    return onSuccess(result);
  } catch (error) {
    const err =
      typeof transformError === "function"
        ? transformError(error as TError)
        : error;

    return onFailure<TError>(err);
  }
}

const onSuccess = <T>(data: T): OperationSuccess<T> => {
  return { data, error: null };
};

const onFailure = <E extends Error>(error: unknown): OperationFailure<E> => {
  const message = String(error) || "Something went wrong";

  const errorParsed = error instanceof Error ? error : new Error(message);

  debugError(errorParsed);

  return { error: errorParsed as E, data: null };
};

const isPromise = <T = unknown>(value: unknown): value is Promise<T> => {
  return (
    !!value &&
    (typeof value === "object" || typeof value === "function") &&
    typeof (value as Promise<T>).then === "function"
  );
};
