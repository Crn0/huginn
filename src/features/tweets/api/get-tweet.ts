import type { Client } from "@/lib/api-client";
import type { ErrorType } from "@/lib/errors/errors.type";
import type { Tweet } from "@/types/api";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { tweetKeys } from "./query-key-factory";
import { useClient } from "@/hooks/use-client";

export const getTweet =
  (client: Client) =>
  async (id: string): Promise<Tweet> => {
    const res = await client.callApi(`tweets/${id}`, {
      isAuth: true,
      method: "GET",
    });

    return res.json();
  };

export const getAuthUserQueryOptions = (client: Client, id: string) =>
  queryOptions<Tweet, ErrorType>({
    queryKey: tweetKeys.detail(id),
    queryFn: () => getTweet(client)(id),
  });

export const useTweet = (
  id: string,
  { enabled = true }: { enabled?: boolean } = {}
) => {
  const client = useClient();

  return useQuery({
    ...getAuthUserQueryOptions(client, id),
    enabled,
  });
};
