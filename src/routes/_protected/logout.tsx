import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/logout")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/logout"!</div>;
}
