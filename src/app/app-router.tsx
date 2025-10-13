import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import {
  useAuthActions,
  useAuthToken,
  useIsAuthenticatedToken,
} from "@/hooks/use-auth-store";
import { useClient } from "@/hooks/use-client";

export function AppRouter() {
  const authToken = useAuthToken();
  const isAuthenticated = useIsAuthenticatedToken();
  const authActions = useAuthActions();

  const client = useClient();

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
