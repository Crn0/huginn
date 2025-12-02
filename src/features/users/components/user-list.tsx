import { useSearch } from "@tanstack/react-router";
import { useAuthUser } from "@/lib/auth";
import { useInfiniteUsers } from "../api/get-users";

import { LogoSplash } from "@/components/ui/logo-splash";
import { Spinner } from "@/components/ui/spinner";
import { ErrorComponent } from "@/components/errors/error-component";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { User } from "./user";

export function UserList () {
  const search = useSearch({ strict: false });

  const authUserQuery = useAuthUser();
  const usersQuery = useInfiniteUsers(search.q ?? "", !!search.q)

  if (!authUserQuery.isSuccess) {
    return <LogoSplash />;
  }

  if (!usersQuery.data && usersQuery.isLoading) {
    return (
      <div className='flex items-center-safe justify-center-safe'>
        <Spinner className='text-spinner size-8' />
      </div>
    );
  }

  if (usersQuery.isError) {
    return (
      <ErrorComponent error={usersQuery.error} reset={usersQuery.refetch} defaultMessage/>
    );
  }

  const authUser = authUserQuery.data;
  const users = usersQuery.data?.pages?.flatMap(({ data }) => data) ?? [];

  if (!users.length && !search.q) {
    return (
      <div className='flex items-center-safe justify-center-safe'>
        <span>Nothing to see here — yet.</span>
      </div>
    );
  }

  if (!users.length && search.q) {
    return (
      <div className='flex items-center-safe justify-center-safe'>
        <span>No results for {`"${search.q}"`}</span>
      </div>
    );
  }

  return (
    <>
      <ul
        aria-label='users'
        className='flex flex-1 flex-col items-center-safe justify-center-safe gap-1'
      >
        {users.map((user) => (
          <li
            key={user.id}
            className='w-full sm:w-xl'
          >
            <User key={user.id} authUser={authUser}  user={user} />
          </li>
        ))}
      </ul>

      {usersQuery.hasNextPage && (
        <InfiniteScroll
          testId='load-next-page'
          loadMore={() => usersQuery.fetchNextPage()}
          isLoading={usersQuery.isFetchingNextPage}
          canLoadMore={usersQuery.hasNextPage}
          delay={1000}
        />
      )}
    </>
  );
}
