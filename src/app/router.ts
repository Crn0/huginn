import { createRouter } from "@tanstack/react-router";

import { routeTree } from "@/routeTree.gen";
import { queryClient } from "./query-client";

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    client: undefined!,
    auth: undefined!,
  },
  defaultPreload: "intent",
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});
