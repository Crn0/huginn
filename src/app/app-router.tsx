import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import {
  useAuthActions,
  useAuthToken,
  useIsAuthenticatedToken,
  useIsSilentLogin,
} from "@/hooks/use-auth-store";
import { useClient } from "@/hooks/use-client";

export function AppRouter() {
  const authToken = useAuthToken();
  const isAuthenticated = useIsAuthenticatedToken();
  const isSilentLogin = useIsSilentLogin();
  const authActions = useAuthActions();

  const client = useClient();

  return (
    <RouterProvider
      router={router}
      context={{
        client,
        auth: {
          isAuthenticated,
          isSilentLogin,
          token: authToken,
          actions: authActions,
        },
      }}
    />
  );
}
