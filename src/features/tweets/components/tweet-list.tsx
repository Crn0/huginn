import { useParams } from "@tanstack/react-router";

import { useAuthUser } from "@/lib/auth";
import { useUser } from "@/features/users/api/get-user";
import { useInfiniteTweets, type TweetFilter } from "../api/get-tweets";

import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { ErrorComponent } from "@/components/errors/error-component";
import { LogoSplash } from "@/components/ui/logo-splash";
import { Spinner } from "@/components/ui/spinner";
import { Tweet } from "./tweet";

export interface TweetListProps {
  filter: TweetFilter;
  enabled?: boolean
}

export function TweetList({ filter, enabled = true }: TweetListProps) {
  const params = useParams({ strict: false });

  const authUserQuery = useAuthUser();
  const userQuery = useUser(params.username ?? "", !!params.username);

  const tweetsQuery = useInfiniteTweets(filter, { enabled });

  if (!authUserQuery.isSuccess || userQuery.isLoading) {
    return <LogoSplash />;
  }

  if (!tweetsQuery.data && tweetsQuery.isLoading) {
    return (
      <div className='flex items-center-safe justify-center-safe'>
        <Spinner className='text-spinner size-8' />
      </div>
    );
  }

  if (tweetsQuery.isError) {
    return (
      <ErrorComponent error={tweetsQuery.error} reset={tweetsQuery.refetch} defaultMessage/>
    );
  }

  const user = userQuery.data ?? authUserQuery.data;
  const tweets = tweetsQuery.data?.pages?.flatMap(({ data }) => data) ?? [];

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
            <Tweet key={tweet.id} user={user} tweet={tweet} />
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
