import type { ApiClient } from "@/lib/api-client";
import type { Pagination, User } from "@/types/api";

import z from "zod";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { userKeys } from "./query-key-factory";
import { useClient } from "@/hooks/use-client";
import { buildResourcePath } from "@/lib/build-resource-path";

export const MAX_BY_LENGTH = 36 as const;
export const getUsersFilterSchema = z.object({
  searchTerm: z
    .string()
    .trim()
});

export type GetUserFilter = z.infer<typeof getUsersFilterSchema>;

export const getUsers =
  (client: ApiClient) =>
  async (page: string, by: string): Promise<Pagination<User[]>> => {
        const resource = buildResourcePath("users", page, { by });
    
    const res = await client.callApi(resource, {
      method: "GET",
      isAuth: true,
    });

    return res.json();
  };
 
export const useUsers = (searchTerm: string, enabled = true ) => {
  const client = useClient();

  return useQuery({
    enabled,
    queryKey: userKeys.lists(searchTerm),
    queryFn: () => getUsers(client)("", searchTerm),

  });
};

export const useInfiniteUsers = (searchTerm: string, enabled = true ) => {
  const client = useClient();

  return useInfiniteQuery({
    enabled,
    initialPageParam: "",
    queryKey: userKeys.infinite.lists(searchTerm),
    queryFn: ({ pageParam }) => getUsers(client)(pageParam, searchTerm),
    getNextPageParam: (pagination) => pagination.nextHref,
    getPreviousPageParam: (pagination) => pagination.prevHref,
  });
};
