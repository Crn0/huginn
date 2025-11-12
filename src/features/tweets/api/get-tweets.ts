import type { Client } from "@/lib/api-client";
import type { Pagination, Tweet } from "@/types/api";

import { useInfiniteQuery } from "@tanstack/react-query";
import { tweetKeys } from "./query-key-factory";
import { useClient } from "@/hooks/use-client";

export const getTweets =
  (client: Client) =>
  async (page: string): Promise<Pagination<Tweet[]>> => {
    const resource = !page ? "tweets" : page;

    const res = await client.callApi(resource, {
      isAuth: true,
      method: "GET",
    });

    return res.json();
  };

export const useInfiniteTweets = () => {
  const client = useClient();

  return useInfiniteQuery({
    initialPageParam: "",
    queryKey: tweetKeys.infinite.list(),
    queryFn: ({ pageParam }) => getTweets(client)(pageParam),
    select: (data) => ({
      pages: [...data.pages].reverse(),
      pageParams: [...data.pageParams].reverse(),
    }),
    getNextPageParam: (pagination) => pagination.nextHref,
    getPreviousPageParam: (pagination) => pagination.prevHref,
  });
};
