import type { ReactNode } from "react";

export function ResetLayout({ children }: { children: ReactNode }) {
  return (
    <div className='flex min-h-dvh flex-col items-stretch justify-center-safe gap-5 bg-neutral-800 text-white sm:flex sm:flex-col'>
      <div className='flex h-full w-full flex-1 flex-col items-center-safe justify-center-safe'>
        {children}
      </div>
    </div>
  );
}
