import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/compose/post")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/compose/post"!</div>;
}
