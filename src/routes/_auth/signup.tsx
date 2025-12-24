import { SignupCard } from "@/features/auth/components/signup-card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();

  const onSuccess = () => navigate({ to: "/login", replace: true });

  return <SignupCard onSuccess={onSuccess} />;
}
