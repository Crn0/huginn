import { CatchBoundary, createFileRoute, Outlet } from "@tanstack/react-router";

import { debugError } from "@/lib/logger";

import { ErrorComponent } from "@/components/errors/error-component";
import { ResetLayout } from "@/components/layouts/reset-layout";

export const Route = createFileRoute("/_reset")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ResetLayout>
      <CatchBoundary
        getResetKey={() => "reset"}
        onCatch={(error) => debugError(error)}
        errorComponent={ErrorComponent}
      >
        <Outlet />
      </CatchBoundary>
    </ResetLayout>
  );
}
