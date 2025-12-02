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
import { useIsSilentLogin } from "@/hooks/use-auth-store";
import { ErrorComponent } from "@/components/errors/error-component";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { LogoSplash } from "@/components/ui/logo-splash";
import { SilentLogin } from "@/features/auth/components/silent-login";

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
  errorComponent: ErrorComponent,
  component: RouteComponent,
});

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
          {({ data: token }) => (
            <SilentLogin token={token}>
              <AuthLayout>
                <CatchBoundary
                  getResetKey={() => "reset"}
                  onCatch={(error) => debugError(error)}
                  errorComponent={ErrorComponent}
                >
                  <Outlet />
                </CatchBoundary>
              </AuthLayout>
            </SilentLogin>
          )}
        </Await>
      )}
    </>
  );
}
