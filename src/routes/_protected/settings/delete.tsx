import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";

import { useAuthUser } from "@/lib/auth";

import { SettingLayout } from "@/components/layouts/setting-layout";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { DeleteAccount } from "@/features/users/components/delete-account";

export const Route = createFileRoute("/_protected/settings/delete")({
  component: RouteComponent,
});

function RouteComponent() {
  const userQuery = useAuthUser();

  if (!userQuery.isSuccess) return null;

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
            <h2 className='font-bold'>Delete account</h2>
          </div>
        </>
      }
    >
      <DeleteAccount user={user} />
    </SettingLayout>
  );
}
