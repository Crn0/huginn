import { useEffect } from "react";
import {
  Await,
  CatchBoundary,
  createFileRoute,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import { tryCatch } from "@/lib/try-catch";
import { debugError } from "@/lib/logger";
import { refreshToken as silentLogin } from "@/lib/auth";
import { useAuthActions } from "@/hooks/use-auth-store";
import { ErrorComponent } from "@/components/errors/error-component";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { LogoSplash } from "@/components/ui/logo-splash";

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: "/home", replace: true });
    }
  },
  loader: async () => {
    const refreshToken = tryCatch(silentLogin());

    return { refreshToken };
  },
  component: RouteComponent,
});

function SilentLogin({ token }: { token: string | null }) {
  const navigate = Route.useNavigate();

  const login = useAuthActions().login;

  useEffect(() => {
    if (token) {
      login(token);

      navigate({ to: "home", replace: true });
    }
  }, [token, login, navigate]);

  return <LogoSplash />;
}

function RouteComponent() {
  const { refreshToken } = Route.useLoaderData();

  return (
    <Await promise={refreshToken} fallback={<LogoSplash />}>
      {({ data: token }) =>
        token ? (
          <SilentLogin token={token} />
        ) : (
          <AuthLayout>
            <CatchBoundary
              getResetKey={() => "reset"}
              onCatch={(error) => debugError(error)}
              errorComponent={ErrorComponent}
            >
              <Outlet />
            </CatchBoundary>
          </AuthLayout>
        )
      }
    </Await>
  );
}
