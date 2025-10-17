import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/login", replace: true });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
