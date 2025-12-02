import { Button } from "@/components/ui/button";

export function ErrorComponent({
  error,
  reset = () => {},
  defaultMessage = true,
}: {
  error: InstanceType<typeof Error> | null;
  reset?: () => void;
  defaultMessage?: boolean
}) {
  return (
    <div
      className='flex flex-col items-center-safe justify-center-safe gap-1'
      role='alert'
    >
      <pre className='text-red-600'>
        { defaultMessage ? "Something went wrong. Try reloading." : error?.message ?? "Something went wrong. Try reloading." }
      </pre>
      <Button type='button' onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
