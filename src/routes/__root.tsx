import * as React from "react";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { env } from "@/configs/env";

import type { QueryClient } from "@tanstack/react-query";
import type { ApiClient } from "@/lib/api-client";
import type { AuthStoreState } from "@/lib/provider";

interface RouterContext {
  client: ApiClient;
  queryClient: QueryClient;
  auth: AuthStoreState;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <Outlet />
      <TanStackRouterDevtools position='bottom-left' initialIsOpen={false} />
      {env.NODE_ENV === "dev" && <ReactQueryDevtools />}
    </React.Fragment>
  );
}
