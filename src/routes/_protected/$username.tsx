import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDaysIcon,
  LinkIcon,
  MapPinXInsideIcon,
  Undo2Icon,
} from "lucide-react";

import { useAuthUser } from "@/lib/auth";
import { Authorization } from "@/lib/authorization";
import { nFormatter } from "@/lib/number-formatter";
import { formatDate } from "@/utils/format-date";

import { ContentLayout } from "@/components/layouts/content-layout";
import { UserAvatar } from "@/components/ui/avatar/user-avatar";
import { UserBanner } from "@/components/ui/avatar/user-banner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { LogoSplash } from "@/components/ui/logo-splash";
import { userQueryOption, useUser } from "@/features/users/api/get-user";
import { UpdateProfile } from "@/features/users/components/update-profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTweetList } from "@/features/tweets/components/user-tweet-list";
import { useToggleFollowUser } from "@/features/follow/api/follow";
import { MediaList } from "@/features/media/components/media-list";

export const Route = createFileRoute("/_protected/$username")({
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(
      userQueryOption(context.client)(params.username)
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const authUserQuery = useAuthUser();
  const userQuery = useUser(params.username);
  const followMutation = useToggleFollowUser(
    authUserQuery.data?.username ?? ""
  );

  if (!authUserQuery.isSuccess || userQuery.isLoading) {
    return <LogoSplash />;
  }

  if (!userQuery.isSuccess) {
    return (
      <ContentLayout
        headerChildren={
          <>
            <div className='flex items-center-safe gap-2'>
              <Button variant='outline' asChild>
                <Link
                  to='/home'
                  className='text-foreground border-none bg-none'
                >
                  <Undo2Icon />
                </Link>
              </Button>

              <h1>Profile</h1>
            </div>
          </>
        }
      >
        <Card className='bg-background text-foreground border-black pt-0'>
          <CardContent className='p-10'>
            <div className='grid place-content-center-safe gap-2'>
              <CardTitle className='text-3xl'>
                This account doesn't exist
              </CardTitle>
              <CardDescription>Try searching for another.</CardDescription>
            </div>
          </CardContent>
        </Card>
      </ContentLayout>
    );
  }

  const authUser = authUserQuery.data;
  const user = userQuery.data;

  return (
    <ContentLayout
      headerClassName='static'
      headerChildren={
        <>
          <div className='flex items-center-safe gap-2'>
            <Button variant='outline' asChild>
              <Link to='/home' className='text-foreground border-none bg-none'>
                <Undo2Icon />
              </Link>
            </Button>

            <div className='flex w-xs flex-col justify-center-safe gap-1'>
              <span className='overflow-hidden text-xl overflow-ellipsis whitespace-nowrap'>
                {user.username}
              </span>
              <span className='text-xl opacity-45'>
                {nFormatter(user._count.tweets, 0)} posts
              </span>
            </div>
          </div>
        </>
      }
    >
      <Card className='bg-background text-foreground border-black pt-0'>
        <CardHeader className='px-0'>
          <UserBanner banner={user.profile.bannerUrl} />
          <div className='-mt-10 flex items-center-safe justify-between p-2'>
            <UserAvatar
              className='h-25 w-25 sm:h-45 sm:w-45'
              fallbackClassName='text-3xl sm:text-5xl'
              avatar={user.profile.avatarUrl}
              fallback={user.username}
            />

            <Authorization
              user={authUser}
              resource='user'
              action='update'
              data={user}
              forbiddenFallback={
                <Button
                  variant='secondary'
                  onClick={() => followMutation.mutate(user)}
                  disabled={followMutation.isPending}
                >
                  {user.followed ? "Unfollow" : "Follow"}
                </Button>
              }
            >
              <UpdateProfile
                user={authUser}
                renderButtonTrigger={({ open }) => (
                  <Button
                    variant='ghost'
                    className='rounded-full border-1 border-white'
                    onClick={open}
                  >
                    <span>Edit profile</span>
                  </Button>
                )}
              />
            </Authorization>
          </div>
        </CardHeader>

        <CardContent className='grid gap-2'>
          <div className='flex flex-col items-start'>
            <span className='text-2xl font-bold'>
              {user.profile.displayName}
            </span>
            <span className='font-light opacity-50'>@{user.username}</span>
          </div>

          <div className='grid gap-2'>
            {user.profile.bio && (
              <div className='w-sm wrap-break-word text-balance sm:w-2xl'>
                <span>{user.profile.bio}</span>
              </div>
            )}
            <div className='flex flex-wrap sm:flex-col'>
              {user.profile.location && (
                <div className='flex items-center-safe gap-1'>
                  <MapPinXInsideIcon size={15} />
                  <span className='font-light opacity-50'>
                    {user.profile.location}
                  </span>
                </div>
              )}

              <div className='flex gap-5'>
                {user.profile.website && (
                  <div className='flex items-center-safe gap-1'>
                    <LinkIcon size={15} />
                    <a
                      className='w-[150px] overflow-hidden font-light text-ellipsis whitespace-nowrap text-sky-600'
                      href={user.profile.website}
                      target='_blank'
                      rel='noreferrer'
                    >
                      {user.profile.website}
                    </a>
                  </div>
                )}

                <div className='flex flex-1 items-center-safe gap-1'>
                  <CalendarDaysIcon size={15} />
                  <time
                    className='font-light opacity-50'
                    dateTime={user.createdAt}
                  >
                    {formatDate(user.createdAt, "'Joined at 'MMMM yyyy")}
                  </time>
                </div>
              </div>
            </div>
          </div>

          <div className='flex items-center-safe gap-5'>
            <div className='flex gap-1'>
              <span> {nFormatter(user._count.following, 0)}</span>
              <span className='font-light opacity-50'>Following</span>
            </div>
            <div className='flex gap-1'>
              <span>{nFormatter(user._count.followedBy, 0)}</span>
              <span className='font-light opacity-50'>Followers</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className='flex-1'>
          <Tabs defaultValue='posts' className='flex-1'>
            <TabsList className='flex w-full rounded-none'>
              <TabsTrigger value='posts'>
                <span className='group-data-[state=active]:border-b-5 group-data-[state=active]:border-b-blue-400'>
                  Posts
                </span>
              </TabsTrigger>
              <TabsTrigger value='replies'>
                <span className='group-data-[state=active]:border-b-5 group-data-[state=active]:border-b-blue-400'>
                  Replies
                </span>
              </TabsTrigger>
              <TabsTrigger value='media'>
                <span className='group-data-[state=active]:border-b-5 group-data-[state=active]:border-b-blue-400'>
                  Media
                </span>
              </TabsTrigger>
              <Authorization
                user={authUser}
                resource='like'
                action='view'
                data={user}
              >
                <TabsTrigger value='likes'>
                  <span className='group-data-[state=active]:border-b-5 group-data-[state=active]:border-b-blue-400'>
                    Likes
                  </span>
                </TabsTrigger>
              </Authorization>
            </TabsList>

            <TabsContent value='posts'>
              <UserTweetList username={user.username} scope='posts' />
            </TabsContent>

            <TabsContent value='replies'>
              <UserTweetList
                username={user.username}
                scope='replies'
                withReply
              />
            </TabsContent>

            <TabsContent value='media'>
              <MediaList username={user.username} />
            </TabsContent>

            <Authorization
              user={authUser}
              resource='like'
              action='view'
              data={user}
            >
              <TabsContent value='likes'>
                <UserTweetList username={user.username} scope='likes' />
              </TabsContent>
            </Authorization>
          </Tabs>
        </CardFooter>
      </Card>
    </ContentLayout>
  );
}
