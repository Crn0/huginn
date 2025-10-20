import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div>Hello "/_protected/settings"!</div>
      <Outlet />
    </>
  );
}
