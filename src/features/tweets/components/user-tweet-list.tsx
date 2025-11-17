import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { Tweet } from "./tweet";
import { Spinner } from "@/components/ui/spinner";
import { ErrorComponent } from "@/components/errors/error-component";
import {
  useInfiniteUserTweets,
  type Scope,
} from "../api/[username]/get-tweets";
import { Separator } from "@/components/ui/separator";

export interface TweetListProps {
  username: string;
  scope: Scope;
  withReply?: boolean;
}

export function UserTweetList({ username, scope, withReply }: TweetListProps) {
  const tweetsQuery = useInfiniteUserTweets(username, scope);

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

  const renderedParentTweetIds = new Set<string>()


  return (
    <>
      <ul
        aria-label='tweets'
        className='flex flex-1 flex-col items-center-safe justify-center-safe gap-2'
      >
        {tweets.map((tweet) => (
          <li
            key={tweet.id}
            className='grid w-full sm:w-xl'
            aria-label={`comment-${tweet.content}-${tweet.id}`}
          >
            {withReply && tweet.replyTo &&  (() => {
              if (renderedParentTweetIds.has(tweet.id)) return null

              renderedParentTweetIds.add(tweet.replyTo.id)

              return (
              <>
                <Tweet tweet={tweet.replyTo} />
                <Separator
                  orientation='vertical'
                  className='ml-12 border-2 data-[orientation=vertical]:h-25'
                />
              </>
            )
            })()}

            {
              !renderedParentTweetIds.has(tweet.id) && <Tweet tweet={tweet} />
            }
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
