import { createFileRoute } from "@tanstack/react-router";

import { ErrorComponent } from "@/components/errors/error-component";

export const Route = createFileRoute("/_protected/notifications")({
  errorComponent: ErrorComponent,
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/notifications"!</div>;
}
