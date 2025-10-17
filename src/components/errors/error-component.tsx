import { ErrorComponent as TanstackErrorComponent } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import type { ErrorType } from "@/lib/errors/errors.type";

const isCustomError = (e: Error | ErrorType): e is ErrorType =>
  (e as ErrorType)?.kind !== undefined;

const getErrorCode = (e: Error | ErrorType) => {
  const defaultCode = 500;

  if (isCustomError(e)) {
    return e.code || defaultCode;
  }

  return defaultCode;
};

export function ErrorComponent({
  error,
  reset,
}: {
  error: InstanceType<typeof Error>;
  reset: () => void;
}) {
  if (!isCustomError(error)) return <TanstackErrorComponent error={error} />;

  return (
    <div role='alert'>
      <p>Error {getErrorCode(error)}: Something went wrong</p>
      <pre className='text-red-600'>{error.message}</pre>
      {error && error.kind === "VALIDATION_ERROR" && error.issues?.length > 0 && (
        <ul className='ml-4 list-disc'>
          {error.issues.map((issue) => (
            <li key={`${issue.path?.join(".")}:${issue.message}`}>
              {issue.message}
            </li>
          ))}
        </ul>
      )}
      <Button type='button' onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
