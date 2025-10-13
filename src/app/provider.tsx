import { CatchBoundary } from "@tanstack/react-router";

import { AuthStoreProvider } from "@/lib/provider";
import { ClientProvider } from "@/lib/provider/client/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./query-client";

import type { ReactNode } from "react";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <CatchBoundary getResetKey={() => "reset"}>
      <QueryClientProvider client={queryClient}>
        <AuthStoreProvider>
          <ClientProvider>{children}</ClientProvider>
        </AuthStoreProvider>
      </QueryClientProvider>
    </CatchBoundary>
  );
}
