import { Button } from "@/components/ui/button";

export function ErrorComponent({
  error,
  reset = () => {},
}: {
  error: InstanceType<typeof Error> | null;
  reset?: () => void;
}) {
  return (
    <div
      className='flex flex-col items-center-safe justify-center-safe gap-1'
      role='alert'
    >
      <pre className='text-red-600'>
        {error?.message ?? "Something went wrong."}
      </pre>
      <Button type='button' onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
