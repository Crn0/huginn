import { ErrorComponent as TanstackErrorComponent } from "@tanstack/react-router";

import { CustomError, ValidationError } from "@/lib/errors";

import { Button } from "@/components/ui/button";

const isCustomError = (e: Error | CustomError): e is CustomError =>
  (e as CustomError)?.is !== undefined;

const getErrorCode = (e: Error | CustomError) => {
  const defaultCode = 500;

  if (isCustomError(e)) {
    return e.code || e.response?.status || defaultCode;
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
      {error && error.is(ValidationError) && error.fields?.length > 0 && (
        <ul className='ml-4 list-disc'>
          {error.fields.map((field) => (
            <li key={`${field.path?.join(".")}:${field.message}`}>
              {field.message}
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
