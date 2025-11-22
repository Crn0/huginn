import type { ReactNode } from "react";
import type { FileRouteTypes } from "@/routeTree.gen";
import { useLocation, useParams, type LinkProps } from "@tanstack/react-router";
import type { LucideProps } from "lucide-react";

import { cn } from "@/utils/cn";
import { nFormatter } from "@/lib/number-formatter";
import { useAuthUser } from "@/lib/auth";
import {
  HomeIcon,
  SearchIcon,
  BellIcon,
  BookmarkIcon,
  UserIcon,
  SettingsIcon,
  OrigamiIcon,
  FeatherIcon,
  CircleCheckIcon,
  LogOutIcon,
} from "lucide-react";
import { Link } from "../ui/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { UserAvatar } from "../ui/avatar/user-avatar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "../ui/drawer";
import { VisuallyHidden } from "../ui/visually-hidden";
import { DialogTitle } from "../ui/dialog";

export type SideNavigationLink = {
  name: string;
  to: FileRouteTypes["fullPaths"];
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
} & LinkProps;

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { username } = useParams({ strict: false });
  const location = useLocation();

  const authUserQuery = useAuthUser();

  if (!authUserQuery.isSuccess) return null;

  const authUser = authUserQuery.data;

  const navLinks = [
    {
      name: "Home" as const,
      to: "/home",
      icon: HomeIcon,
    },
    {
      name: "Explore",
      to: "/explore",
      icon: SearchIcon,
    },
    {
      name: "Notifications",
      to: "/notifications",
      icon: BellIcon,
    },
    {
      name: "Bookmarks",
      to: "/bookmarks",
      icon: BookmarkIcon,
    },
    {
      name: "Profile",
      to: "/$username",
      params: { username: authUser.username },
      icon: UserIcon,
    },
    {
      name: "Settings and Privacy",
      to: "/settings",
      icon: SettingsIcon,
    },
  ] satisfies SideNavigationLink[];

  return (
    <div className='bg-background flex h-dvh flex-col overflow-x-hidden text-white sm:w-dvw sm:flex-row'>
      <header className='border-border hidden border-r font-mono sm:sticky sm:top-0 sm:flex sm:flex-col sm:place-items-center-safe sm:items-center-safe sm:justify-between lg:flex-[0.9]'>
        <nav className='mt-1 grid place-items-center-safe items-center-safe gap-2 lg:flex lg:flex-1 lg:flex-col lg:place-items-baseline'>
          <Link
            to='/home'
            className='p-2 text-white focus-visible:rounded-md focus-visible:ring-[2px] focus-visible:ring-white'
          >
            <OrigamiIcon strokeWidth={1} />
          </Link>

          {navLinks.map((link) => (
            <Tooltip key={link.to}>
              <TooltipTrigger asChild>
                <Link
                  {...link}
                  key={link.name}
                  to={link.to}
                  className='flex items-center-safe gap-2 p-2 text-xl font-medium text-white focus-visible:rounded-md focus-visible:ring-[2px] focus-visible:ring-white'
                  activeProps={{ className: "font-extrabold" }}
                  activeOptions={{ exact: true }}
                >
                  {({ isActive }) => {
                    return (
                      <>
                        <link.icon strokeWidth={!isActive ? 1 : 2} />
                        <span className='hidden lg:block'>{link.name}</span>
                      </>
                    );
                  }}
                </Link>
              </TooltipTrigger>
              <TooltipContent
                className='xl:hidden'
                side='bottom'
                sideOffset={-20}
              >
                {link.name}
              </TooltipContent>
            </Tooltip>
          ))}

          <Button variant='secondary' asChild>
            <Link
              to='/compose/post'
              className='mt-2 hidden items-center-safe gap-2 rounded-4xl p-2 text-sm font-medium text-black lg:flex lg:w-full'
              activeOptions={{ exact: true }}
            >
              <span>Post</span>
            </Link>
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to='/compose/post'
                className='flex items-center-safe gap-2 rounded-4xl p-2 text-white focus-visible:rounded-md focus-visible:ring-[2px] focus-visible:ring-white lg:hidden'
                activeOptions={{ exact: true }}
              >
                {({ isActive }) => (
                  <FeatherIcon strokeWidth={!isActive ? 1 : 2} />
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent
              className='xl:hidden'
              side='bottom'
              sideOffset={-20}
            >
              <span>Post</span>
            </TooltipContent>
          </Tooltip>

          <div className='flex w-full flex-1 items-end-safe justify-center-safe p-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='bg-background flex w-full justify-start p-10'>
                  <UserAvatar
                    className='h-15 w-15'
                    avatar={authUser.profile.avatarUrl}
                    fallback={authUser.username}
                  />
                  <div className='hidden lg:flex lg:flex-col'>
                    <span className='font-bold'>
                      {authUser.profile.displayName}
                    </span>
                    <span className='font-light opacity-50'>
                      @{authUser.username}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className='bg-background hidden w-50 text-white sm:block'
                align='center'
                side='top'
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem className='pointer-events-none w-full'>
                    <div className='flex flex-1 gap-1'>
                      <UserAvatar
                        avatar={authUser.profile.avatarUrl}
                        fallback={authUser.username}
                      />
                      <div className='flex flex-col'>
                        <span className='font-bold'>
                          {authUser.profile.displayName}
                        </span>
                        <span className='font-light opacity-50'>
                          @{authUser.username}
                        </span>
                      </div>
                    </div>

                    <CircleCheckIcon color='teal' />
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem disabled asChild>
                    <Button className='flex w-full justify-start'>
                      <span>Add an existing account</span>
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled asChild>
                    <Button className='flex w-full justify-start'>
                      <span>Manage accounts</span>
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Button variant='ghost' asChild>
                      <Link
                        className='flex w-full justify-start text-white focus-visible:rounded-md focus-visible:ring-[2px] focus-visible:ring-white'
                        to='/logout'
                        preload={false}
                        replace
                      >
                        <span>Log out @{authUser.username}</span>
                      </Link>
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>
      <main className='flex flex-2 flex-col'>
        {!username &&
          location.pathname !== "/compose/post" &&
          !location.pathname.includes("/settings") && (
            <header
              id='dashboard-header'
              className='bg-background sticky top-0 z-30 flex items-center gap-4 p-1 sm:static sm:hidden sm:h-auto sm:border-0 sm:bg-transparent sm:p-2 sm:px-6'
            >
              <aside>
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button
                      size='icon'
                      variant='default'
                      className='text-black'
                    >
                      <>
                        <UserAvatar
                          className='h-12 w-12'
                          avatar={authUser.profile.avatarUrl}
                          fallback={authUser.username}
                        />
                        <span className='sr-only'>Toggle Menu</span>
                      </>
                    </Button>
                  </DrawerTrigger>

                  <DrawerContent
                    side='left'
                    className='bg-background overflow-hidden border-r border-neutral-600 pt-10 text-white'
                  >
                    <VisuallyHidden>
                      <DialogTitle>
                        <span>User menu</span>
                      </DialogTitle>
                    </VisuallyHidden>
                    <DrawerHeader className='mb-5 text-white'>
                      <Link
                        to='/$username'
                        params={{ username: authUser.username }}
                      >
                        <UserAvatar
                          className='h-15 w-15'
                          avatar={authUser.profile.avatarUrl}
                          fallback={authUser.username}
                        />
                      </Link>

                      <div className='flex flex-col items-start'>
                        <span className='font-bold'>
                          {authUser.profile.displayName}
                        </span>
                        <span className='font-light opacity-50'>
                          @{authUser.username}
                        </span>
                      </div>

                      <div className='flex items-center-safe gap-5'>
                        <div className='flex gap-1'>
                          <span>
                            {" "}
                            {nFormatter(authUser._count.following, 0)}
                          </span>
                          <span className='font-light opacity-50'>
                            Following
                          </span>
                        </div>
                        <div className='flex gap-1'>
                          <span>
                            {nFormatter(authUser._count.followedBy, 0)}
                          </span>
                          <span className='font-light opacity-50'>
                            Followers
                          </span>
                        </div>
                      </div>
                    </DrawerHeader>

                    <nav className='grid gap-6 text-lg font-medium'>
                      {(
                        [
                          ...navLinks,
                          {
                            name: "Logout",
                            to: "/logout",
                            preload: false,
                            replace: true,
                            icon: LogOutIcon,
                          },
                        ] satisfies SideNavigationLink[]
                      ).map((link) => (
                        <DrawerClose key={link.name} asChild>
                          <Link
                            {...link}
                            to={link.to}
                            className='flex items-center-safe gap-2 rounded-4xl p-2 text-white focus-visible:rounded-md focus-visible:ring-[2px] focus-visible:ring-white'
                            activeOptions={{ exact: true }}
                          >
                            <link.icon
                              className={cn(
                                "text-gray-400 group-hover:text-gray-300",
                                "mr-4 size-6 shrink-0"
                              )}
                              aria-hidden='true'
                            />
                            {link.name}
                          </Link>
                        </DrawerClose>
                      ))}
                    </nav>
                  </DrawerContent>
                </Drawer>
              </aside>
            </header>
          )}
        <section className='flex-1'>{children}</section>
      </main>

      <footer className='sticky bottom-0 bg-inherit pt-2 sm:hidden'>
        <nav className='flex w-full justify-around sm:hidden'>
          {navLinks
            .filter(({ name }) =>
              ["Home", "Explore", "Notifications", "Bookmarks"].includes(name)
            )
            .map((link) => (
              <Tooltip key={link.to}>
                <TooltipTrigger asChild>
                  <Link
                    {...link}
                    key={link.name}
                    to={link.to}
                    className='flex items-center-safe gap-2 p-2 text-sm font-medium text-white focus-visible:rounded-md focus-visible:ring-[2px] focus-visible:ring-white'
                    activeProps={{ className: "font-extrabold" }}
                    activeOptions={{ exact: true }}
                  >
                    {({ isActive }) => {
                      return (
                        <>
                          <link.icon strokeWidth={!isActive ? 1 : 2} />
                          <span className='hidden lg:block'>{link.name}</span>
                        </>
                      );
                    }}
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  className='xl:hidden'
                  side='bottom'
                  sideOffset={-20}
                >
                  {link.name}
                </TooltipContent>
              </Tooltip>
            ))}
        </nav>
      </footer>
    </div>
  );
}
