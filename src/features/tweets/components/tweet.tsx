import type { Tweet as TweetType, TweetLike, User } from "@/types/api";
import type { AuthUser } from "@/lib/auth";

import { useNavigate } from "@tanstack/react-router";
import {
  ChartColumnIcon,
  EllipsisIcon,
  HeartIcon,
  MessageCircleIcon,
  MessageCircleOffIcon,
  Repeat2Icon,
  ShareIcon,
} from "lucide-react";

import { dateDiffInDays } from "@/lib/date";
import { format, formatDistanceStrict } from "@/utils/format-date";
import { nFormatter } from "@/lib/number-formatter";
import { isRepost } from "../utils/is-repost";

import { UserAvatar } from "@/components/ui/avatar/user-avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MDPreview } from "@/components/ui/md-preview/md-preview";
import { TweetMedia } from "./tweet-media";
import { cn } from "@/utils/cn";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Authorization } from "@/lib/authorization";
import { DeleteTweet } from "./delete-tweet";
import { useToggleLikeTweet } from "../api/like-tweet";
import { useToggleFollowUser } from "@/features/follow/api/follow";
import { useToggleRepostTweet } from "../api/repost-tweet";
import { useDisclosure } from "@/hooks/use-disclosure";

export interface TweetProps {
  user: AuthUser | User;
  tweet: TweetLike;
  pageTweet?: TweetType;
}

export function Tweet({ user, tweet, pageTweet }: TweetProps) {
  const navigate = useNavigate();

  const toggleLikeMutation = useToggleLikeTweet(user?.username ?? "");
  const toggleFollowMutation = useToggleFollowUser(user?.username ?? "");
  const toggleRepostMutation = useToggleRepostTweet(user?.username ?? "");
  const popOverDisclosure = useDisclosure(false);

  const author = tweet.author;
  const profile = author.profile;

  const laterDate = new Date(tweet.createdAt);
  const currentDate = new Date();

  const onNavigateTweet = (
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (e.type === "keydown") {
      if ((e as React.KeyboardEvent<HTMLDivElement>).key !== "Enter") return;
    }

    const target = e.target as Element;

    const targetParent = target.parentElement;

    const selection = window.getSelection()?.toString() ?? "";

    if (selection.length > 0) return;

    if (
      targetParent &&
      targetParent.getAttribute("data-navigates") !== "true" &&
      target.getAttribute("data-navigates") !== "true"
    )
      return;

    navigate({
      to: "/$username/status/$tweetId",
      params: { username: user.username, tweetId: tweet.id },
    });
  };

  return (
    <Card
      data-navigates='true'
      role='button'
      id={tweet.id}
      tabIndex={0}
      className='bg-background text-foreground w-full'
      onClick={onNavigateTweet}
      onKeyDown={onNavigateTweet}
    >
      <CardHeader>
        {isRepost(tweet) && (
          <div data-navigates='true' className='flex gap-1'>
            <span className='font-light opacity-50'>
              <Repeat2Icon />
            </span>
            <span className='flex gap-1 font-light opacity-50'>
              <span
                className={cn(
                  tweet.reposter.id !== user.id &&
                    "w-10 overflow-hidden overflow-ellipsis whitespace-nowrap sm:w-auto"
                )}
              >
                {tweet.reposter.id === user.id
                  ? "You"
                  : tweet.reposter.profile.displayName}
              </span>
              <span>reposted</span>
            </span>
          </div>
        )}
        <div className='flex gap-2'>
          <div>
            <Link to='/$username' params={{ username: author.username }}>
              <UserAvatar
                className='h-13 w-13 border-2'
                avatar={profile.avatarUrl}
                fallback={author.username}
              />
            </Link>
          </div>
          <div className='flex w-full'>
            <div
              data-navigates='true'
              role='button'
              tabIndex={0}
              onClick={onNavigateTweet}
              className='text-foreground grid flex-1 gap-1'
            >
              <div
                data-navigates='true'
                className='text-foreground flex flex-1 gap-1'
              >
                <span className='w-15 overflow-hidden font-bold overflow-ellipsis whitespace-nowrap sm:w-auto'>
                  {profile.displayName}
                </span>
                <span className='w-10 overflow-hidden font-light overflow-ellipsis whitespace-nowrap opacity-50 sm:w-auto'>
                  @{author.username}
                </span>

                <time
                  className='w-20 overflow-hidden font-light text-ellipsis whitespace-nowrap opacity-50 sm:w-fit'
                  dateTime={tweet.createdAt}
                >
                  {dateDiffInDays(laterDate, currentDate) < 1
                    ? `• ${formatDistanceStrict(laterDate, currentDate)}`
                    : format(tweet.createdAt, "• MMM d")}
                </time>
              </div>

              {tweet.replyTo && (
                <CardDescription>
                  Replying to{" "}
                  <Link
                    to='/$username'
                    params={{ username: tweet.replyTo.username }}
                  >
                    <span
                      data-navigates='false'
                      className='w-10 overflow-hidden overflow-ellipsis whitespace-nowrap text-blue-400 sm:w-fit'
                    >
                      @{tweet.replyTo.username}
                    </span>
                  </Link>
                </CardDescription>
              )}
            </div>

            <div className='flex'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className='hover:bg-background hover:text-foreground text-foreground opacity-50 hover:border-0'
                    variant='ghost'
                    size='icon-sm'
                    type='button'
                  >
                    <MessageCircleOffIcon size={15} />
                  </Button>
                </TooltipTrigger>

                <TooltipContent side='bottom' sideOffset={-2}>
                  Explain this post
                </TooltipContent>
              </Tooltip>

              <Popover
                open={popOverDisclosure.isOpen}
                onOpenChange={popOverDisclosure.toggle}
              >
                <Tooltip>
                  <PopoverTrigger asChild>
                    <TooltipTrigger data-testid='more' asChild>
                      <Button
                        data-tweet-navigates='false'
                        className='hover:bg-background hover:text-foreground text-foreground opacity-50 hover:border-0'
                        variant='ghost'
                        size='icon-sm'
                        type='button'
                      >
                        <EllipsisIcon size={15} />
                      </Button>
                    </TooltipTrigger>
                  </PopoverTrigger>

                  <TooltipContent side='bottom' sideOffset={-2}>
                    More
                  </TooltipContent>
                </Tooltip>

                <PopoverContent className='bg-background grid gap-2'>
                  {user && (
                    <Authorization
                      user={user}
                      resource='tweet'
                      action='delete'
                      data={tweet}
                      forbiddenFallback={
                        <Button
                          variant='secondary'
                          onClick={() => {
                            toggleFollowMutation.mutate({
                              targetUser: tweet.author,
                            });
                            popOverDisclosure.close();
                          }}
                          disabled={toggleFollowMutation.isPending}
                        >
                          {tweet.author.followed ? "Unfollow" : "Follow"}
                        </Button>
                      }
                    >
                      <DeleteTweet tweet={tweet} pageTweet={pageTweet} />
                    </Authorization>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-2'>
        <MDPreview data-navigates='true' value={tweet.content ?? ""} />

        <TweetMedia media={tweet.media} />
      </CardContent>

      <CardFooter className='flex justify-between'>
        <Tooltip>
          <TooltipTrigger data-testid='reply' asChild>
            <Button variant='ghost' asChild>
              <Link
                className='text-foreground'
                to='.'
                search={{ modal: { open: true, id: tweet.id } }}
              >
                <MessageCircleIcon />

                {tweet._count.replies ? (
                  <span>{nFormatter(tweet._count.replies, 0)}</span>
                ) : null}
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom' sideOffset={-2}>
            Reply
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger data-testid='repost' asChild>
            <Button
              variant='ghost'
              className={cn(tweet.reposted && "text-teal-400")}
              onClick={() => toggleRepostMutation.mutate({ tweet, pageTweet })}
            >
              <Repeat2Icon />
              {tweet._count.repost ? (
                <span>{nFormatter(tweet._count.repost, 0)}</span>
              ) : null}
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom' sideOffset={-2}>
            {tweet.reposted ? "Undo repost" : "Repost"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger data-testid='like' asChild>
            <Button
              variant='ghost'
              className={cn(tweet.liked && "text-rose-400")}
              onClick={() => toggleLikeMutation.mutate({ tweet, pageTweet })}
            >
              <HeartIcon />
              {tweet._count.likes ? (
                <span>{nFormatter(tweet._count.likes, 0)}</span>
              ) : null}
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom' sideOffset={-2}>
            {tweet.liked ? "Unlike" : "Like"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger data-testid='view' asChild>
            <Button variant='ghost'>
              <ChartColumnIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom' sideOffset={-2}>
            View
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger data-testid='share' asChild>
            <Button variant='ghost'>
              <ShareIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom' sideOffset={-2}>
            Share
          </TooltipContent>
        </Tooltip>
      </CardFooter>
    </Card>
  );
}
