import type { FileRouteTypes } from "@/routeTree.gen";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  KeyRoundIcon,
  UserIcon,
  type LucideProps,
} from "lucide-react";

import { useAuthUser } from "@/lib/auth";

import { ContentLayout } from "@/components/layouts/content-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/components/ui/link";

export const Route = createFileRoute("/_protected/settings/")({
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

  const navigationLinks = [
    {
      name: "Account Information",
      description:
        "See your account information like your phone number and email address.",
      to: "/settings/me/account",
      icon: UserIcon,
    },
    {
      name: "Change your password",
      description: "Change your password at any time.",
      to: "/settings/password",
      icon: KeyRoundIcon,
    },
  ] satisfies ContentNavigationLink[];

  return (
    <ContentLayout
      contentClassName='border-none'
      headerClassName='justify-baseline gap-5 p-1'
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
            <h2 className='font-bold'>Your Account</h2>

            <span className='font-light opacity-50 sm:hidden'>
              @{user.username}
            </span>
          </div>
        </>
      }
    >
      <Card className='flex-1 border-none bg-black p-2'>
        <CardDescription>
          See information about your account, download an archive of your data,
          or learn about your account deactivation options
        </CardDescription>

        <CardContent className='grid w-full gap-10'>
          {navigationLinks.map((link) => (
            <Link
              key={`${link.name}-${link.description}`}
              to={link.to}
              className='text-foreground flex w-full items-center-safe gap-5 sm:gap-10'
            >
              <link.icon />

              <div className='flex items-center-safe justify-between'>
                <div>
                  <CardTitle>{link.name}</CardTitle>
                  <CardDescription className='w-3xs break-all whitespace-pre-wrap sm:w-full lg:w-3xs 2xl:w-lg'>
                    {link.description}
                  </CardDescription>
                </div>

                <ChevronRightIcon />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </ContentLayout>
  );
}
