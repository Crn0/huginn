import type { DefaultOptions } from "@tanstack/react-query";

export const queryConfig = {
  queries: {
    staleTime: 12 * 60 * 1000, // 12 minutes
  },
} satisfies DefaultOptions;
