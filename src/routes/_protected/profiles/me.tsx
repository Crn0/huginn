import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/profiles/me")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/profiles/me"!</div>;
}
