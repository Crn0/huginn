import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/profiles")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div>Hello "/_protected/profiles"!</div>
      <Outlet />
    </>
  );
}
