import { useEffect } from "react";
import {
  Await,
  createFileRoute,
  useNavigate,
  redirect,
} from "@tanstack/react-router";

import { notificationSocket } from "@/lib/socket/notification";
import { useAuthActions } from "@/hooks/use-auth-store";
import { LogoSplash } from "@/components/ui/logo-splash";

const LogoutHandler = () => {
  const { queryClient } = Route.useRouteContext();
  const navigate = useNavigate();
  const logout = useAuthActions().logout;
  const setIsSilentLogin = useAuthActions().setIsSilentLogin;

  useEffect(() => {
    queryClient.cancelQueries();
    queryClient.clear();
    logout();
    setIsSilentLogin();
    navigate({ from: "/logout", to: "/login", replace: true });
  }, [queryClient, logout, navigate, setIsSilentLogin]);

  return <LogoSplash />;
};

export const Route = createFileRoute("/logout")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ from: "/logout", to: "/login", replace: true });
    }
  },
  loader: async ({ context: { client } }) => {
    if (notificationSocket.connected) {
      notificationSocket.disconnect();
    }

    return {
      p: client.callApi("auth/logout", {
        method: "POST",
        credentials: "include",
      }),
    };
  },
  component: RouteComponent,
  errorComponent: LogoutHandler,
});

function RouteComponent() {
  const { p } = Route.useLoaderData();

  return (
    <Await promise={p} fallback={<LogoSplash />}>
      {() => <LogoutHandler />}
    </Await>
  );
}
