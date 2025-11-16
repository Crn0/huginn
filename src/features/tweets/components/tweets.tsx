import { Link } from "@/components/ui/link";
import type { TweetFilter } from "../api/get-tweets";

import { CreateTweet } from "./create-tweet";
import { TweetList } from "./tweet-list";
import { FeatherIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export type TweetsProps = {
  username: string;
  filter: TweetFilter;
};

export function Tweets({ username, filter }: TweetsProps) {
  return (
    <>
      <div className='hidden sm:block'>
        <CreateTweet username={username} />
      </div>
      <div className='fixed right-5 bottom-25 z-50 sm:hidden'>
        <Button
          variant='outline'
          size='icon-lg'
          className='text-foreground rounded-full bg-blue-400'
          asChild
        >
          <Link to='/compose/post'>
            <FeatherIcon />
          </Link>
        </Button>
      </div>

      <TweetList filter={filter} />
    </>
  );
}
