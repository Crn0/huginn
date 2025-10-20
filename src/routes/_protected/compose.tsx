import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/compose")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div>Hello "/_protected/_compose"!</div>
      <Outlet />
    </>
  );
}
