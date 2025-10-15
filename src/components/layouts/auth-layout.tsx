import type { ReactNode } from "react";
import { Origami } from "lucide-react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className='flex min-h-dvh flex-col items-stretch gap-5 bg-neutral-800 text-white sm:flex sm:min-h-dvh sm:flex-col sm:gap-10 sm:p-5'>
      <div className='flex items-center gap-5 self-center sm:self-auto'>
        <div className='flex justify-center'>
          <Origami className='h-24 w-auto' />
        </div>
      </div>

      <div className='w-sm self-center-safe'>{children}</div>
    </div>
  );
}
