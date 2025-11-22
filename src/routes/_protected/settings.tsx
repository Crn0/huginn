import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@/utils/cn";
import { useAuthUser } from "@/lib/auth";
import { ContentLayout } from "@/components/layouts/content-layout";
import { LogoSplash } from "@/components/ui/logo-splash";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

export const Route = createFileRoute("/_protected/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const userQuery = useAuthUser();
  const location = useLocation();

  if (!userQuery.isSuccess) {
    return <LogoSplash />;
  }

  const user = userQuery.data;

  const isRootPath = location.pathname === "/settings";

  return (
    <div className='flex h-full w-full overflow-hidden'>
      <div
        className={cn(
          "border-border max-w-lg flex-1 border-r",
          !isRootPath && "hidden sm:p-1 lg:block"
        )}
      >
        <ContentLayout
          contentClassName='border-none'
          headerClassName={cn(
            "flex-1 justify-baseline gap-5 p-1 ",
            !isRootPath && "hidden lg:flex"
          )}
          headerChildren={
            <>
              <Button
                variant='outline'
                className='text-foreground sm:hidden'
                asChild
              >
                <Link to='/home'>
                  <ArrowLeftIcon />
                </Link>
              </Button>

              <div>
                <h1 className='font-bold'>Settings</h1>

                <span className='font-light opacity-50 sm:hidden'>
                  @{user.username}
                </span>
              </div>
            </>
          }
        >
          <div className={cn(!isRootPath && "hidden lg:block")}>
            <Button
              variant='link'
              className='text-foreground flex justify-between text-xl'
              asChild
            >
              <Link to='/settings/account'>
                Your account <ChevronRightIcon />
              </Link>
            </Button>
          </div>
        </ContentLayout>
      </div>

      <div className={cn(!isRootPath && "flex-1 p-1")}>
        <Outlet />
      </div>
    </div>
  );
}
