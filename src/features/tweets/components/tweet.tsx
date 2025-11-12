import type { Tweet } from "@/types/api";
import { MessageCircleOffIcon } from "lucide-react";

import { dateDiffInDays } from "@/lib/date";
import { formatDate, formatDistance } from "@/utils/format-date";
import { parse } from "../utils/parse";
import { linkifyHtml } from "../utils/linkify-html";

import { UserAvatar } from "@/components/ui/avatar/user-avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MDPreview } from "@/components/ui/md-preview/md-preview";
import { TweetMedia } from "./tweet-media";

export interface TweetProps {
  tweet: Tweet;
}

export function Tweet({ tweet }: TweetProps) {
  const author = tweet.author;
  const profile = author.profile;

  const laterDate = new Date(tweet.createdAt);
  const currentDate = new Date();

  return (
    <Card id={tweet.id} className='bg-background text-foreground w-sm sm:w-lg'>
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
            <div className='text-foreground flex gap-1'>
              <span className='font-bold'>{profile.displayName}</span>
              <span className='font-light opacity-50'>@{author.username}</span>

              <time
                className='font-light opacity-50'
                dateTime={tweet.createdAt}
              >
                {dateDiffInDays(laterDate, currentDate) < 1
                  ? formatDistance(laterDate, currentDate, {
                      isUnitFirstChar: true,
                    })
                  : formatDate(tweet.createdAt, "MMM cc")}
              </time>
            </div>

            <div>
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
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-2'>
        <MDPreview parse={parse} value={linkifyHtml(tweet.content ?? "")} />

        <TweetMedia media={tweet.media} />
      </CardContent>
    </Card>
  );
}
