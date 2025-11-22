import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";

import { useAuthUser } from "@/lib/auth";

import { SettingLayout } from "@/components/layouts/setting-layout";
import { LogoSplash } from "@/components/ui/logo-splash";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
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
            <h2 className='font-bold'>Change your password</h2>
          </div>
        </>
      }
    >
      <UpdatePassword
        user={user}
        onSuccess={() => {
          navigate({ to: "/login", from: "/settings/password", replace: true });
        }}
      />
    </SettingLayout>
  );
}
