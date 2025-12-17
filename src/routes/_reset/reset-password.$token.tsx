import {
  Await,
  CatchBoundary,
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

import { tryCatch } from "@/lib/try-catch";
import { debugError } from "@/lib/logger";
import { getRequest } from "@/features/auth/api/get-requester";

import { ErrorComponent } from "@/components/errors/error-component";
import { LogoSplash } from "@/components/ui/logo-splash";
import { ResetPassword } from "@/features/auth/components/reset-password";

export const Route = createFileRoute("/_reset/reset-password/$token")({
  beforeLoad: ({ params: { token } }) => {
    if (!token) {
      throw redirect({ to: "/login", replace: true });
    }
  },
  loader: async ({ context: { client }, params: { token } }) => {
    const requester = tryCatch(getRequest(client)(token));
    // const requester = getRequest(client)(token)

    return { requester };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();

  const { token } = Route.useParams();

  const { requester } = Route.useLoaderData();

  const onSuccess = () => {
    navigate({ to: "/login", from: "/reset-password/$token", replace: true });
  };

  return (
    <CatchBoundary
      getResetKey={() => "reset"}
      onCatch={(error) => debugError(error)}
      errorComponent={ErrorComponent}
    >
      <Await promise={requester} fallback={<LogoSplash />}>
        {({ error }) =>
          error ? (
            <span>Invalid or expired link</span>
          ) : (
            <ResetPassword token={token} onSuccess={onSuccess} />
          )
        }
      </Await>
    </CatchBoundary>
  );
}
