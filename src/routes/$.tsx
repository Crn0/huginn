import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftIcon, OrigamiIcon } from "lucide-react";

import { tryCatch } from "@/lib/try-catch";
import { refreshToken, useAuthUser } from "@/lib/auth";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { ContentLayout } from "@/components/layouts/content-layout";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/$")({
  loader: async ({ context: { auth } }) => {
    const { data: token } = await tryCatch(refreshToken());

    if (token) {
      auth.actions.login(token);
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const userQuery = useAuthUser();

  if (userQuery.isLoading) {
    return (
      <div className='grid h-dvh place-content-center-safe'>
        <Spinner className='text-spinner size-9' />
      </div>
    );
  }

  if (!userQuery.isSuccess) {
    return (
      <ContentLayout
        contentClassName='h-auto p-10'
        headerClassName='p-5'
        headerChildren={
          <>
            <Button
              variant='outline'
              className='text-foreground border-none'
              asChild
            >
              <Link to='/'>
                <OrigamiIcon />
              </Link>
            </Button>

            <div className='sm:hidden'>
              <Button asChild>
                <Link to='/login' className='text-foreground bg-background'>
                  Login
                </Link>
              </Button>

              <Button asChild>
                <Link to='/signup' className='bg-foreground text-background'>
                  Sign up
                </Link>
              </Button>
            </div>
          </>
        }
      >
        <div className='grid w-full place-content-center place-items-center-safe gap-4'>
          <span className='text-center'>
            Hmm...this page doesn’t exist. Try searching for something else.
          </span>

          <Link
            variant='button'
            className='w-20 p-2'
            to='/explore'
            search={{ f: "users" }}
          >
            Search
          </Link>
        </div>
      </ContentLayout>
    );
  }

  const user = userQuery.data;

  return (
    <DashboardLayout user={user}>
      <ContentLayout
        contentClassName='h-auto p-10'
        headerClassName='sm:hidden justify-baseline gap-4 fixed top-0 p-5'
        headerChildren={
          <>
            <Button
              variant='outline'
              className='text-foreground border-none'
              asChild
            >
              <Link to='/home'>
                <ArrowLeftIcon />
              </Link>
            </Button>

            <div>
              <h1 className='font-bold'>Not Found</h1>
            </div>
          </>
        }
      >
        <div className='grid w-full place-content-center place-items-center-safe gap-4'>
          <span className='text-center'>
            Hmm...this page doesn’t exist. Try searching for something else.
          </span>

          <Link
            variant='button'
            className='w-20 p-2'
            to='/explore'
            search={{ f: "users" }}
          >
            Search
          </Link>
        </div>
      </ContentLayout>
    </DashboardLayout>
  );
}
