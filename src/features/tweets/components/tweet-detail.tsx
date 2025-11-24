import type { Tweet, User } from "@/types/api";

import { format } from "date-fns";
import { useNavigate } from "@tanstack/react-router";
import {
  BookmarkIcon,
  EllipsisIcon,
  HeartIcon,
  MessageCircleIcon,
  MessageCircleOffIcon,
  Repeat2Icon,
  ShareIcon,
} from "lucide-react";

import { parse } from "../utils/parse";
import { linkifyHtml } from "../utils/linkify-html";
import { nFormatter } from "@/lib/number-formatter";

import { Authorization } from "@/lib/authorization";

import { useToggleLikeTweet } from "../api/like-tweet";
import { useToggleFollowUser } from "@/features/follow/api/follow";

import { UserAvatar } from "@/components/ui/avatar/user-avatar";
import {
  Card,
  CardContent,
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
import { Separator } from "@/components/ui/separator";
import { DeleteTweet } from "./delete-tweet";
import { ReplyTweet } from "./reply-tweet";

export interface TweetProps {
  user: User;
  tweet: Tweet;
}

export function TweetDetail({ user, tweet }: TweetProps) {
  const navigate = useNavigate();

  const toggleLikeMutation = useToggleLikeTweet(user.username);
  const toggleFollowMutation = useToggleFollowUser(user?.username);

  const author = tweet.author;
  const profile = author.profile;

  const onSuccess = () => {
    navigate({ to: "/home", replace: true });
  };

  return (
    <Card
      id={tweet.id}
      className='bg-background text-foreground w-full border-none'
    >
      <CardHeader>
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
          <div className='flex w-full justify-between'>
            <div className='text-foreground grid gap-1'>
              <span className='font-bold'>{profile.displayName}</span>
              <span className='font-light opacity-50'>@{author.username}</span>
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

              <Popover>
                <Tooltip>
                  <PopoverTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
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
                          onClick={() =>
                            toggleFollowMutation.mutate(tweet.author)
                          }
                          disabled={toggleFollowMutation.isPending}
                        >
                          {tweet.author.followed ? "Unfollow" : "Follow"}
                        </Button>
                      }
                    >
                      <DeleteTweet tweet={tweet} onSuccess={onSuccess} />
                    </Authorization>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-2'>
        <MDPreview parse={parse} value={linkifyHtml(tweet.content ?? "")} />

        <TweetMedia media={tweet.media} />
      </CardContent>

      <CardFooter className='border-border grid border-b'>
        <div className='mb-5'>
          <time className='font-light opacity-50' dateTime={tweet.createdAt}>
            {format(tweet.createdAt, "h:ss b • MMM d, yyyy")}
          </time>
        </div>

        <Separator />
        <div className='flex justify-between p-1'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' asChild>
                <Link
                  className='text-foreground'
                  to='/compose/post'
                  search={{ replyTo: tweet.id }}
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
            <TooltipTrigger asChild>
              <Button variant='ghost'>
                <Repeat2Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='bottom' sideOffset={-2}>
              Repost
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                className={cn(tweet.liked && "text-rose-400")}
                onClick={() => toggleLikeMutation.mutate(tweet)}
                disabled={toggleLikeMutation.isPending}
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
            <TooltipTrigger asChild>
              <Button variant='ghost'>
                <BookmarkIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='bottom' sideOffset={-2}>
              Bookmark
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost'>
                <ShareIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='bottom' sideOffset={-2}>
              Share
            </TooltipContent>
          </Tooltip>
        </div>
        <Separator />

        <div>
          <ReplyTweet
            username={user.username}
            tweet={tweet}
            showReplyToContent={false}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
