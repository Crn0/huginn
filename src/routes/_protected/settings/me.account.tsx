import type { FileRouteTypes } from "@/routeTree.gen";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  type LucideProps,
} from "lucide-react";

import { differenceInCalendarYears } from "date-fns";
import { formatDate } from "@/utils/format-date";
import { useAuthUser } from "@/lib/auth";

import { SettingLayout } from "@/components/layouts/setting-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_protected/settings/me/account")({
  component: RouteComponent,
});

export type ContentNavigationLink = {
  name: string;
  description: string;
  to: FileRouteTypes["fullPaths"];
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
};

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
            <h2 className='font-bold'>Account information</h2>

            <span className='font-light opacity-50 lg:hidden'>
              @{user.username}
            </span>
          </div>
        </>
      }
    >
      <Card className='flex-1 border-none bg-black p-2'>
        <CardContent className='grid w-full gap-10'>
          <Link
            to='/settings/username'
            className='text-foreground flex w-full items-center-safe'
          >
            <div className='flex w-full items-center-safe justify-between'>
              <div className='grid place-content-center-safe'>
                <CardTitle>Username</CardTitle>
                <CardDescription>@{user.username}</CardDescription>
              </div>

              <ChevronRightIcon />
            </div>
          </Link>

          <Link
            to='/settings/me/account'
            className='text-foreground flex w-full items-center-safe'
            disabled
            aria-disabled
          >
            <div className='flex w-full items-center-safe justify-between'>
              <div className='grid place-content-center-safe'>
                <CardTitle>Email</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>

              <ChevronRightIcon />
            </div>
          </Link>

          <Link
            to='/settings/me/account'
            className='text-foreground flex w-full items-center-safe'
            disabled
            aria-disabled
          >
            <div className='flex w-full items-center-safe justify-between'>
              <div className='grid place-content-center-safe'>
                <CardTitle>Account Level</CardTitle>
                <CardDescription>{user.accountLevel}</CardDescription>
              </div>

              <ChevronRightIcon />
            </div>
          </Link>

          <Separator />

          <div className='text-foreground flex w-full items-center-safe'>
            <div className='grid place-content-center-safe'>
              <CardTitle>Account creation</CardTitle>
              <CardDescription>
                {formatDate(user.createdAt, "LLL dd, h:m:s aaa")}
              </CardDescription>
            </div>
          </div>

          <Separator />

          <div className='grid gap-10'>
            <Link
              to='/settings/me/account'
              className='text-foreground flex w-full items-center-safe'
              disabled
              aria-disabled
            >
              <div className='flex w-full items-center-safe justify-between'>
                <div className='grid place-content-center-safe'>
                  <CardTitle>Birth date</CardTitle>
                  <CardDescription>
                    {user.profile.birthday
                      ? formatDate(user.profile.birthday, "LLL dd, yyyy")
                      : "N/A"}
                  </CardDescription>
                </div>

                <ChevronRightIcon />
              </div>
            </Link>

            <Link
              to='/settings/me/account'
              className='text-foreground flex w-full items-center-safe'
              disabled
              aria-disabled
            >
              <div className='flex w-full items-center-safe justify-between'>
                <div className='grid place-content-center-safe'>
                  <CardTitle>Age</CardTitle>
                  <CardDescription>
                    {user.profile.birthday
                      ? differenceInCalendarYears(
                          new Date(),
                          user.profile.birthday
                        )
                      : "N/A"}
                  </CardDescription>
                </div>

                <ChevronRightIcon />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </SettingLayout>
  );
}
