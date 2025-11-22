import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { useAuthUser } from "@/lib/auth";

import { LogoSplash } from "@/components/ui/logo-splash";
import { UpdatePassword } from "@/features/users/components/update-password";

export const Route = createFileRoute("/_protected/settings/password")({
  component: RouteComponent,
});

function RouteComponent() {
  const userQuery = useAuthUser();
  const navigate = useNavigate();

  if (!userQuery.isSuccess) {
    return <LogoSplash />;
  }

  const user = userQuery.data;

  return (
    <UpdatePassword
      user={user}
      onSuccess={() => {
        navigate({ to: "/login", from: "/settings/password", replace: true });
      }}
    />
  );
}
