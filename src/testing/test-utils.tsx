import type { ReactElement, ReactNode } from "react";
import {
  createRouter,
  RouterProvider,
  Route,
  createMemoryHistory,
  CatchBoundary,
  RootRoute,
  createRootRoute,
  Outlet,
  createRoute,
} from "@tanstack/react-router";
import {
  useAuthActions,
  useAuthToken,
  useIsAuthenticatedToken,
} from "@/hooks/use-auth-store";
import { useClient } from "@/hooks/use-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthStoreProvider, ClientProvider } from "@/lib/provider";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

type RoutePath = Route["fullPath"];

export type InitialEntries = RoutePath[];

type TestAppProviderProps = {
  children: ReactNode;
  queryClient: QueryClient;
};

export function TestAppProvider({
  children,
  queryClient,
}: TestAppProviderProps) {
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

type TestRouterProviderProps = {
  queryClient: QueryClient;
  rootRoute: RootRoute;
  initialEntries?: InitialEntries;
};

export function TestAppRouter({
  queryClient,
  rootRoute,
  initialEntries = ["/"],
}: TestRouterProviderProps) {
  const authToken = useAuthToken();
  const isAuthenticated = useIsAuthenticatedToken();
  const authActions = useAuthActions();

  const client = useClient();

  const memoryHistory = createMemoryHistory({
    initialEntries: initialEntries,
  });

  const router = createRouter({
    routeTree: rootRoute,
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
    history: memoryHistory,
  });

  return (
    <RouterProvider
      router={router}
      context={{
        client,
        auth: {
          isAuthenticated,
          token: authToken,
          actions: authActions,
        },
      }}
    />
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const initRootRoute = <
  T extends { path: string; component: () => ReactElement },
>(
  routes: ReadonlyArray<T>
) => {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });

  rootRoute.addChildren(
    routes.map((route) =>
      createRoute({
        getParentRoute: () => rootRoute,
        path: route.path,
        component: route.component,
      })
    )
  );

  return rootRoute;
};

// eslint-disable-next-line react-refresh/only-export-components
export const renderAppWithRouter = (
  rootRoute: RootRoute,
  initialEntries: InitialEntries
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return {
    queryClient,
    user: userEvent.setup(),
    ...render(
      <TestAppProvider queryClient={queryClient}>
        <TestAppRouter
          rootRoute={rootRoute}
          initialEntries={initialEntries}
          queryClient={queryClient}
        />
      </TestAppProvider>
    ),
  };
};

// eslint-disable-next-line react-refresh/only-export-components
export const renderApp = (ui: ReactElement, options?: RenderOptions) => {
  return {
    user: userEvent.setup(),
    ...render(ui, options),
  };
};
