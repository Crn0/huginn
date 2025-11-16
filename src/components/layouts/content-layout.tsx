import type { PropsWithChildren, ReactNode } from "react";

export type ContentLayoutProps = PropsWithChildren & {
  headerChildren?: ReactNode;
};

export function ContentLayout({
  children,
  headerChildren,
}: ContentLayoutProps) {
  return (
    <>
      {headerChildren && (
        <header className='bg-background border-border sticky top-0 z-30 flex flex-1 items-center-safe justify-between border-l'>
          {headerChildren}
        </header>
      )}

      <div className='border-border flex h-full w-full flex-col border-r border-l bg-inherit'>
        {children}
      </div>
    </>
  );
}
