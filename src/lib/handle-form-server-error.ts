import {
  AuthenticationError,
  type ConflictError,
  type ValidationError,
} from "./errors";

type GetPath<Schema extends { [key: string]: unknown }> =
  keyof Schema extends string ? keyof Schema : never;

export const handleServerError = <
  Schema extends { [key: string]: unknown },
  Path extends GetPath<Schema> = GetPath<Schema>,
>(
  e: ValidationError | ConflictError | AuthenticationError,
  setError: (path: Path, ops: { message: string }) => void,
  paths?: { path: Path; showMessage?: boolean }[]
) => {
  if (e.kind === "CONFLICT_ERROR") {
    const field = e.field;

    const path = field?.path?.[0] as Path;
    const message = field.message as string;

    setError(path, { message });
  }

  if (e.kind === "VALIDATION_ERROR") {
    {
      e.issues.forEach((issue) => {
        const path = issue?.path?.[0] as Path;
        const message = issue.message as string;

        setError(path, { message });
      });
    }
  }

  if (e.kind === "AUTHENTICATION_ERROR") {
    paths?.forEach(({ path, showMessage }) =>
      setError(path, { message: showMessage ? e.message : "" })
    );
  }

  throw e;
};
