import { ShieldAlert } from "lucide-react";

import { Link } from "@/components/ui/link";

export function NotFound({
  title = "Page Not Found",
  message = "The page you’re looking for doesn’t exist.",
}) {
  return (
    <div className='flex h-dvh flex-col items-center justify-center space-y-4 bg-black px-4 py-8 text-center text-white'>
      <ShieldAlert
        className='text-5xl text-yellow-500'
        aria-label='Warning icon'
      />
      <h1 className='text-2xl font-semibold'>{title}</h1>
      <p className='max-w-md text-white/70'>{message}</p>
      <Link to='..' variant='button'>
        Go Home
      </Link>
    </div>
  );
}
