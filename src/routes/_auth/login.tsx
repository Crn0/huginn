import { createFileRoute } from "@tanstack/react-router";

import { useAuthActions } from "@/hooks/use-auth-store";
import { LoginCard } from "@/features/auth/components/login-card";

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch({});
  const setToken = useAuthActions().login;

  const redirectTo = search.redirectTo ?? "/home";

  const onSuccess = ({ token }: { token: string }) => {
    setToken(token);

    navigate({ to: redirectTo, replace: true });
  };

  return <LoginCard onSuccess={onSuccess} />;
}
