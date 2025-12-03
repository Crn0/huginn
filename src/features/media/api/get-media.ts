import type { Client } from "@/lib/api-client";
import type { Pagination, Media } from "@/types/api";

import { useInfiniteQuery } from "@tanstack/react-query";

import { buildResourcePath } from "@/lib/build-resource-path";
import { mediaKeys } from "./query-key-factory";
import { useClient } from "@/hooks/use-client";

export const getMedia =
  (client: Client) =>
  async (search: string, page: string): Promise<Pagination<Media[]>> => {
    const resource = buildResourcePath("media", page, { search });

    const res = await client.callApi(resource, {
      isAuth: true,
      method: "GET",
    });

    return res.json();
  };

export const useInfiniteMedia = (
  search: string,
  { enabled = true }: { enabled?: boolean } = {}
) => {
  const client = useClient();

  return useInfiniteQuery({
    enabled,
    initialPageParam: "",
    queryKey: mediaKeys.list(search),
    queryFn: ({ pageParam }) => getMedia(client)(search, pageParam),
    getNextPageParam: (pagination) => pagination.nextHref,
    getPreviousPageParam: (pagination) => pagination.prevHref,
  });
};
