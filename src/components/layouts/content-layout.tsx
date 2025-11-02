import type { PropsWithChildren, ReactNode } from "react";

export type ContentLayoutProps = PropsWithChildren &
  (
    | {
        header: ReactNode;
        title?: never;
      }
    | {
        title: string;
        header?: never;
      }
  );

export function ContentLayout({ children, title, header }: ContentLayoutProps) {
  return (
    <>
      {header ? (
        <>{header}</>
      ) : (
        <header className='sticky bg-inherit top-0 mx-auto max-w-7xl border-l border-r border-neutral-600 px-4 sm:px-6 md:px-8'>
          <h1 className='text-2xl font-semibold text-foreground'>{title}</h1>
        </header>
      )}

      <div className='flex bg-inherit h-full w-full flex-col border-l border-r border-neutral-600'>
        {children}
      </div>
    </>
  );
}
