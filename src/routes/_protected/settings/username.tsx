import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";

import { useAuthUser } from "@/lib/auth";

import { SettingLayout } from "@/components/layouts/setting-layout";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { LogoSplash } from "@/components/ui/logo-splash";
import { UpdateUsername } from "@/features/users/components/update-username";

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
    <SettingLayout
      headerChildren={
        <>
          <Button
            variant='outline'
            className='text-foreground lg:hidden'
            asChild
          >
            <Link to='/home'>
              <ArrowLeftIcon />
            </Link>
          </Button>

          <div>
            <h2 className='font-bold'>Change username</h2>
          </div>
        </>
      }
    >
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
    </SettingLayout>
  );
}
