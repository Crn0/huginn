import { cn } from "@/utils/cn";
import type { PropsWithChildren, ReactNode } from "react";

export type ContentLayoutProps = PropsWithChildren & {
  headerChildren?: ReactNode;
  headerClassName?: string;
  contentClassName?: string;
};

export function ContentLayout({
  children,
  headerChildren,
  headerClassName,
  contentClassName,
}: ContentLayoutProps) {
  return (
    <>
      {headerChildren && (
        <header
          className={cn(
            "bg-background sticky top-0 z-30 flex flex-1 items-center-safe justify-between",
            headerClassName
          )}
        >
          {headerChildren}
        </header>
      )}

      <div
        className={cn(
          "flex h-full w-full flex-col border-r bg-inherit",
          contentClassName
        )}
      >
        {children}
      </div>
    </>
  );
}
