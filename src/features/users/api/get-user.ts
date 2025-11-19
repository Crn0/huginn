import type { ApiClient } from "@/lib/api-client";
import type { User } from "@/types/api";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { userKeys } from "./query-key-factory";
import { useClient } from "@/hooks/use-client";

export const getUser =
  (client: ApiClient) =>
  async (username: string): Promise<User> => {
    const res = await client.callApi(`users/${username}`, {
      method: "GET",
      isAuth: true,
    });

    return res.json();
  };

export const userQueryOption = (client: ApiClient) => (username: string) =>
  queryOptions({
    queryKey: userKeys.detail(username),
    queryFn: () => getUser(client)(username),
  });

export const useUser = (username: string, enabled = true) => {
  const client = useClient();

  return useQuery({
    enabled,
    queryKey: userKeys.detail(username),
    queryFn: () => getUser(client)(username),
  });
};
