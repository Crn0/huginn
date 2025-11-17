import type { Client } from "@/lib/api-client";
import type { Pagination, Tweet } from "@/types/api";

import { useInfiniteQuery } from "@tanstack/react-query";

import { buildResourcePath } from "@/lib/build-resource-path";
import { tweetKeys } from "../query-key-factory";
import { useClient } from "@/hooks/use-client";

export type Scope = "posts" | "replies" | "likes";

export const getTweets =
  (client: Client) =>
  async (
    username: string,
    page: string,
    scope: Scope
  ): Promise<Pagination<Tweet[]>> => {
    const resource = buildResourcePath(`users/${username}/tweets`, page, {
      scope,
    });

    const res = await client.callApi(resource, {
      isAuth: true,
      method: "GET",
    });

    return res.json();
  };

export const useInfiniteUserTweets = (
  username: string,
  scope: Scope,
  { enabled = true }: { enabled?: boolean } = {}
) => {
  const client = useClient();

  return useInfiniteQuery({
    enabled,
    initialPageParam: "",
    queryKey: tweetKeys.infinite.listByUser(username, scope),
    queryFn: ({ pageParam }) => getTweets(client)(username, pageParam, scope),
    getNextPageParam: (pagination) => pagination.nextHref,
    getPreviousPageParam: (pagination) => pagination.prevHref,
  });
};
