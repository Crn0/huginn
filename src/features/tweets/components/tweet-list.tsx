import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { useInfiniteTweets, type TweetFilter } from "../api/get-tweets";
import { Tweet } from "./tweet";
import { Spinner } from "@/components/ui/spinner";
import { ErrorComponent } from "@/components/errors/error-component";

export interface TweetListProps {
  filter: TweetFilter;
}

export function TweetList({ filter }: TweetListProps) {
  const tweetsQuery = useInfiniteTweets(filter);

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
        aria-label='tweets'
        className='flex flex-1 flex-col items-center-safe justify-center-safe gap-1'
      >
        {tweets.map((tweet) => (
          <li
            key={tweet.id}
            className='w-full sm:w-xl'
            aria-label={`comment-${tweet.content}-${tweet.id}`}
          >
            <Tweet key={tweet.id} tweet={tweet} />
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
