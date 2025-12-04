import { useUser } from "@/features/users/api/get-user";
import {
  useInfiniteUserTweets,
  type Scope,
} from "../api/[username]/get-tweets";

import { isRepost } from "../utils/is-repost";

import { ErrorComponent } from "@/components/errors/error-component";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { Spinner } from "@/components/ui/spinner";
import { LogoSplash } from "@/components/ui/logo-splash";
import { PlaceTweetTree } from "./place-tweet-tree";

export interface UserTweetListProps {
  username: string;
  scope: Scope;
  withReply?: boolean;
}

export function UserTweetList({ username, scope }: UserTweetListProps) {
  const userQuery = useUser(username);

  const tweetsQuery = useInfiniteUserTweets(
    username,
    scope === "likes" ? "likes" : "posts"
  );

  if (!userQuery.isSuccess) {
    return <LogoSplash />;
  }

  if (!tweetsQuery.data && tweetsQuery.isLoading)
    return (
      <div className='flex items-center-safe justify-center-safe'>
        <Spinner className='size-8 text-blue-400' />
      </div>
    );

  if (!tweetsQuery.isSuccess)
    return (
      <ErrorComponent error={tweetsQuery.error} reset={tweetsQuery.refetch} />
    );

  const user = userQuery.data;
  const tweets = tweetsQuery.data.pages?.flatMap(({ data }) => data);

  if (!tweets.length) {
    return (
      <div className='flex items-center-safe justify-center-safe'>
        <span>Nothing to see here — yet.</span>
      </div>
    );
  }

  return (
    <>
      <ul
        aria-label='tweets'
        className='flex flex-1 flex-col items-center-safe justify-center-safe gap-2'
      >
        {scope !== "replies" &&
          tweets.map((tweet) => {
            return (
              <li
                key={!isRepost(tweet) ? tweet.id : tweet.repostId}
                className='grid w-full sm:w-xl'
                aria-label={`comment-${tweet.content}-${tweet.id}`}
              >
                <PlaceTweetTree
                  user={user}
                  tweet={tweet}
                  replies={[]}
                />
              </li>
            );
          })}
        {scope === "replies" &&
          tweets.map((tweet) => {
            const replies = tweets.filter((tw) => tw.replyTo?.id === tweet.id);

            if (tweet.replyTo && replies.length <= 0) return;

            return (
              <li
                key={!isRepost(tweet) ? tweet.id : tweet.repostId}
                className='grid w-full gap-2 sm:w-xl'
                aria-label={`comment-${tweet.content}-${tweet.id}`}
              >
                <PlaceTweetTree
                  user={user}
                  tweet={tweet}
                  replies={scope !== "replies" ? [] : replies}
                  maxDepth={3}
                />
              </li>
            );
          })}
      </ul>

      {tweetsQuery.hasNextPage && (
        <InfiniteScroll
          testId='load-next-page'
          loadMore={() => tweetsQuery.fetchNextPage()}
          isLoading={tweetsQuery.isFetchingNextPage}
          canLoadMore={tweetsQuery.hasNextPage}
          delay={1000}
        />
      )}
    </>
  );
}
