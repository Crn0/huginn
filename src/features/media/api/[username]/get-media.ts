import type { Client } from "@/lib/api-client";
import type { Pagination, Media } from "@/types/api";

import { useInfiniteQuery } from "@tanstack/react-query";

import { buildResourcePath } from "@/lib/build-resource-path";
import { mediaKeys } from "../query-key-factory";
import { useClient } from "@/hooks/use-client";

export const getTweets =
  (client: Client) =>
  async (username: string, page: string): Promise<Pagination<Media[]>> => {
    const resource = buildResourcePath(`users/${username}/media`, page);

    const res = await client.callApi(resource, {
      isAuth: true,
      method: "GET",
    });

    return res.json();
  };

export const useInfiniteMedia = (
  username: string,
  { enabled = true }: { enabled?: boolean } = {}
) => {
  const client = useClient();

  return useInfiniteQuery({
    enabled,
    initialPageParam: "",
    queryKey: mediaKeys.list(username),
    queryFn: ({ pageParam }) => getTweets(client)(username, pageParam),
    getNextPageParam: (pagination) => pagination.nextHref,
    getPreviousPageParam: (pagination) => pagination.prevHref,
  });
};
