import type { ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { Origami } from "lucide-react";

export function AuthLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  const pathname = location.pathname;

  const title = `${pathname.slice(1, 2).toUpperCase()}${pathname.slice(2)}`;

  return (
    <div className='flex min-h-dvh flex-col items-stretch gap-5 bg-black text-white sm:flex sm:min-h-dvh sm:flex-col sm:gap-10 sm:p-5'>
      <div className='flex items-center gap-5 self-center sm:self-auto'>
        <div className='flex justify-center'>
          <Origami className='h-24 w-auto' />
        </div>

        <h1>{title}</h1>
      </div>

      <div className='sm:grid sm:h-auto sm:place-content-center sm:place-items-center sm:gap-5 sm:self-center'>
        {children}
      </div>
    </div>
  );
}
