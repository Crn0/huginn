import { createFileRoute } from "@tanstack/react-router";
import { LoginCard } from "@/features/auth/components/login-card";

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LoginCard />;
}
