import type { AuthUser } from "@/lib/auth";
import type { Tweet } from "@/types/api";

import { useInfiniteReplies } from "../api/get-replies";

import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { ErrorComponent } from "@/components/errors/error-component";
import { Spinner } from "@/components/ui/spinner";
import { PlaceTweetTree } from "./place-tweet-tree";

export interface TweetReplyListProps {
  user: AuthUser;
  parent: Tweet;
}

export function TweetReplyList({ user, parent }: TweetReplyListProps) {
  const tweetsQuery = useInfiniteReplies(parent.id);

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
        aria-label='replies'
        className='flex flex-1 flex-col items-center-safe justify-center-safe gap-2'
      >
        {tweets.map((tweet) => (
          <li
            key={tweet.id}
            className='grid w-full gap-2 sm:w-xl'
            aria-label={`comment-${tweet.content}-${tweet.id}`}
          >
            <PlaceTweetTree
              user={user}
              tweet={tweet}
              pageTweet={parent}
              replies={
                typeof tweet.replies[0] === "undefined"
                  ? []
                  : [tweet.replies[0]]
              }
            />
          </li>
        ))}
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
