import type { QueryClient } from "@tanstack/react-query";
import type { ApiClient } from "@/lib/api-client";
import type { AuthStoreState } from "@/lib/provider";

import * as React from "react";
import z from "zod";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { env } from "@/configs/env";

interface RouterContext {
  client: ApiClient;
  queryClient: QueryClient;
  auth: AuthStoreState;
}

const paths = [
  "/bookmarks",
  "/compose",
  "/explore",
  "/home",
  "/notifications",
  "/settings",
  "/compose/post",
  "/settings/account",
];

const searchParamSchema = z.object({
  redirectTo: z
    .string()
    .refine((p) => paths.includes(p) || /^\/.+$/.test(p), {
      error: `Invalid redirect path. Allowed: ${[...paths].join(", ")}`,
    })
    .optional()
    .catch("/home"),
});

export type RootSearchParam = z.infer<typeof searchParamSchema>;

export const Route = createRootRouteWithContext<RouterContext>()({
  validateSearch: (search) => searchParamSchema.parse(search),
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
