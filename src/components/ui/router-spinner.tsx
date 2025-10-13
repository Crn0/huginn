import { useRouterState } from "@tanstack/react-router";

import { Spinner } from "./spinner";
import { cn } from "@/utils/cn";

export function RouterSpinner({ wait }: { wait?: string }) {
  const isLoading = useRouterState({ select: (s) => s.status === "pending" });

  return (
    <Spinner
      className={cn(
        "transition",
        isLoading
          ? `opacity-100 duration-500 ${wait ?? "delay-300"}`
          : "opacity-0 delay-0 duration-500"
      )}
    />
  );
}
