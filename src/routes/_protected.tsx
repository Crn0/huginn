import { ErrorComponent } from "@/components/errors/error-component";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { debugError } from "@/lib/logger";
import {
  CatchBoundary,
  createFileRoute,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import { authUserQueryOptions, useAuthUser } from "@/lib/auth";
import { LogoSplash } from "@/components/ui/logo-splash";

export const Route = createFileRoute("/_protected")({
  beforeLoad: ({ context, location: { href } }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: { redirectTo: href },
        replace: true,
      });
    }
  },
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(authUserQueryOptions(context.client));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const authUserQuery = useAuthUser();

  if (!authUserQuery.isSuccess) {
    return <LogoSplash />;
  }

  return (
    <DashboardLayout>
      <CatchBoundary
        getResetKey={() => "reset"}
        onCatch={(error) => debugError(error)}
        errorComponent={ErrorComponent}
      >
        <Outlet />
      </CatchBoundary>
    </DashboardLayout>
  );
}
