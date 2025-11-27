import type { Client } from "@/lib/api-client";
import type { Pagination, TweetReply } from "@/types/api";

import { useInfiniteQuery } from "@tanstack/react-query";

import { buildResourcePath } from "@/lib/build-resource-path";
import { tweetKeys } from "./query-key-factory";
import { useClient } from "@/hooks/use-client";

export const getReplies =
  (client: Client) =>
  async (id: string, page: string): Promise<Pagination<TweetReply[]>> => {
    const resource = buildResourcePath(`tweets/${id}/replies`, page, );

    const res = await client.callApi(resource, {
      isAuth: true,
      method: "GET",
    });

    return res.json();
  };

export const useInfiniteReplies = (
    id: string,
  { enabled = true }: { enabled?: boolean } = {}
) => {
  const client = useClient();

  return useInfiniteQuery({
    enabled,
    initialPageParam: "",
    queryKey: tweetKeys.infinite.replies(id),
    queryFn: ({ pageParam }) => getReplies(client)(id, pageParam),
    getNextPageParam: (pagination) => pagination.nextHref,
    getPreviousPageParam: (pagination) => pagination.prevHref,
  });
};
