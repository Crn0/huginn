import { useInfiniteMedia } from "../api/[username]/get-media";

import { Spinner } from "@/components/ui/spinner";
import { ErrorComponent } from "@/components/errors/error-component";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import {  Media } from "@/components/ui/media";

export function MediaList({ username }: { username: string }) {
  const mediaQuery = useInfiniteMedia(username);

  if (!mediaQuery.data && mediaQuery.isLoading)
    return (
      <div className='flex items-center-safe justify-center-safe'>
        <Spinner className='size-8 text-blue-400' />
      </div>
    );

  if (!mediaQuery.isSuccess)
    return (
      <ErrorComponent error={mediaQuery.error} reset={mediaQuery.refetch} />
    );

  const media = mediaQuery.data.pages?.flatMap(({ data }) => data);

  if (!media.length) {
    return (
      <div className='flex items-center-safe justify-center-safe'>
        <span>Nothing to see here — yet.</span>
      </div>
    );
  }

  return (
    <>
      <ul
        aria-label='media'
        className="grid grid-cols-2 xl:grid-cols-4 gap-1 flex-1"
      >
        {media.map((m) => (
          <li key={m.id} className=' w-full max-w-lg'>
            <Media media={m} />
          </li>
        ))}
      </ul>

      {mediaQuery.hasNextPage && (
        <InfiniteScroll
          testId='load-next-page'
          loadMore={() => mediaQuery.fetchNextPage()}
          isLoading={mediaQuery.isFetchingNextPage}
          canLoadMore={mediaQuery.hasNextPage}
          delay={1000}
        />
      )}
    </>
  );
}
