import { useEffect } from "react";
import {
  Await,
  CatchBoundary,
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";

import { tryCatch } from "@/lib/try-catch";
import { debugError } from "@/lib/logger";
import { refreshToken as silentLogin } from "@/lib/auth";
import { useAuthActions, useIsSilentLogin } from "@/hooks/use-auth-store";
import { ErrorComponent } from "@/components/errors/error-component";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { LogoSplash } from "@/components/ui/logo-splash";

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      const redirectTo = search.redirectTo ?? "/home";

      throw redirect({ to: redirectTo, replace: true });
    }
  },
  loader: async ({
    context: {
      auth: { isSilentLogin },
    },
  }) => {
    const refreshToken = (
      !isSilentLogin ? tryCatch(silentLogin()) : Promise.resolve({ data: null })
    ) as Promise<{ data: string | null }>;

    return { refreshToken };
  },
  component: RouteComponent,
});

function Wrapper({ token }: { token: string | null }) {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_auth" });

  const redirectTo = search.redirectTo ?? "/home";
  const login = useAuthActions().login;
  const setIsSilentLogin = useAuthActions().setIsSilentLogin;

  useEffect(() => {
    if (token) {
      login(token);

      navigate({ to: redirectTo, replace: true });
    } else {
      setIsSilentLogin();
    }
  }, [token, login, navigate, redirectTo, setIsSilentLogin]);

  if (token) return <LogoSplash />;

  return (
    <AuthLayout>
      <CatchBoundary
        getResetKey={() => "reset"}
        onCatch={(error) => debugError(error)}
        errorComponent={ErrorComponent}
      >
        <Outlet />
      </CatchBoundary>
    </AuthLayout>
  );
}

function RouteComponent() {
  const { refreshToken } = Route.useLoaderData();
  const isSilentLogin = useIsSilentLogin();

  return (
    <>
      {isSilentLogin ? (
        <AuthLayout>
          <CatchBoundary
            getResetKey={() => "reset"}
            onCatch={(error) => debugError(error)}
            errorComponent={ErrorComponent}
          >
            <Outlet />
          </CatchBoundary>
        </AuthLayout>
      ) : (
        <Await promise={refreshToken} fallback={<LogoSplash />}>
          {({ data: token }) => <Wrapper token={token} />}
        </Await>
      )}
    </>
  );
}
