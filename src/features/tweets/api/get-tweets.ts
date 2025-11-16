import type { Client } from "@/lib/api-client";
import type { Pagination, Tweet } from "@/types/api";

import { useInfiniteQuery } from "@tanstack/react-query";

import { buildResourcePath } from "@/lib/build-resource-path";
import { tweetKeys } from "./query-key-factory";
import { useClient } from "@/hooks/use-client";

export type TweetFilter =
  | {
      scope: "all";
      search?: string;
    }
  | {
      scope: "following";
    };

export const getTweets =
  (client: Client) =>
  async (page: string, filter: TweetFilter): Promise<Pagination<Tweet[]>> => {
    const resource = buildResourcePath("tweets", page, filter);

    const res = await client.callApi(resource, {
      isAuth: true,
      method: "GET",
    });

    return res.json();
  };

export const useInfiniteTweets = (
  filter: TweetFilter,
  { enabled = true }: { enabled?: boolean } = {}
) => {
  const client = useClient();

  const scope = filter.scope ?? "all";
  const search = filter.scope === "all" ? (filter.search ?? "") : "";

  return useInfiniteQuery({
    enabled,
    initialPageParam: "",
    queryKey: tweetKeys.infinite.list(scope, search),
    queryFn: ({ pageParam }) => getTweets(client)(pageParam, { scope, search }),
    getNextPageParam: (pagination) => pagination.nextHref,
    getPreviousPageParam: (pagination) => pagination.prevHref,
  });
};
