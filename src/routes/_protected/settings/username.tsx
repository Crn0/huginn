import { LogoSplash } from "@/components/ui/logo-splash";
import { UpdateUsername } from "@/features/users/components/update-username";
import { useAuthUser } from "@/lib/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/settings/username")({
  component: RouteComponent,
});

function RouteComponent() {
  const userQuery = useAuthUser();
  const navigate = Route.useNavigate();

  if (!userQuery.isSuccess) {
    return <LogoSplash />;
  }

  const user = userQuery.data;

  return (
    <UpdateUsername
      user={user}
      onSuccess={() => {
        navigate({
          to: "/settings/me/account",
          from: "/settings/username",
          replace: true,
        });
      }}
    />
  );
}
