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
        <header className='sticky top-0 mx-auto max-w-7xl border-r border-l border-border bg-inherit px-4 sm:px-6 md:px-8'>
          <h1 className='text-foreground text-2xl font-semibold'>{title}</h1>
        </header>
      )}

      <div className='flex h-full w-full flex-col border-r border-l border-border bg-inherit'>
        {children}
      </div>
    </>
  );
}
