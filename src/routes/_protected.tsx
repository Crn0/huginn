import { ErrorComponent } from "@/components/errors/error-component";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { debugError } from "@/lib/logger";
import {
  CatchBoundary,
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";

import { authUserQueryOptions, useAuthUser } from "@/lib/auth";

import { TweetModalRoute } from "@/features/tweets/components/tweet-modal-route";
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
  errorComponent: ErrorComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const authUserQuery = useAuthUser();

  const navigate = useNavigate();
  const { modal } = Route.useSearch();

  if (!authUserQuery.isSuccess) {
    return <LogoSplash />;
  }

  const user = authUserQuery.data;

  return (
    <DashboardLayout>
      <CatchBoundary
        getResetKey={() => "reset"}
        onCatch={(error) => debugError(error)}
        errorComponent={ErrorComponent}
      >
        <TweetModalRoute
          user={user}
          isOpen={!!modal?.open}
          replyTo={modal?.id ?? ""}
          close={() => navigate({ to: "." })}
        />

        <Outlet />
      </CatchBoundary>
    </DashboardLayout>
  );
}
