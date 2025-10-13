import { CatchBoundary, createFileRoute, Outlet } from "@tanstack/react-router";

import { ErrorComponent } from "@/components/errors/error-component";
import { AuthLayout } from "@/components/layouts/auth-layout";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthLayout>
      <CatchBoundary
        getResetKey={() => "reset"}
        onCatch={(error) => console.error(error)}
        errorComponent={ErrorComponent}
      >
        <Outlet />
      </CatchBoundary>
    </AuthLayout>
  );
}
