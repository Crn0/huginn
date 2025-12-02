import { createFileRoute } from "@tanstack/react-router";

import { ErrorComponent } from "@/components/errors/error-component";

export const Route = createFileRoute("/_protected/bookmarks")({
  errorComponent: ErrorComponent,
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/bookmark"!</div>;
}
