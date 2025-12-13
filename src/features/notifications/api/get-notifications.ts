import type { Client } from "@/lib/api-client";
import type { Pagination, Notification } from "@/types/api";

import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";

import { buildResourcePath } from "@/lib/build-resource-path";
import { notificationKeys } from "./query-key-factory";
import { useClient } from "@/hooks/use-client";

export const getNotifications =
  (client: Client) =>
  async (
    page: string
  ): Promise<Pagination<Notification[]> & { unreadCount: number }> => {
    const resource = buildResourcePath(`users/me/notifications`, page);

    const res = await client.callApi(resource, {
      isAuth: true,
      method: "GET",
    });

    return res.json();
  };

export const infiniteNotificationsOption = (client: Client, username: string) =>
  infiniteQueryOptions({
    initialPageParam: "",
    queryKey: notificationKeys.list(username),
    queryFn: ({ pageParam }) => getNotifications(client)(pageParam),
    getNextPageParam: (pagination) => pagination.nextHref,
    getPreviousPageParam: (pagination) => pagination.prevHref,
  });

export const useInfiniteNotifications = (
  username: string,
  { enabled = true }: { enabled?: boolean } = {}
) => {
  const client = useClient();

  return useInfiniteQuery({
    enabled,
    initialPageParam: "",
    queryKey: notificationKeys.list(username),
    queryFn: ({ pageParam }) => getNotifications(client)(pageParam),
    getNextPageParam: (pagination) => pagination.nextHref,
    getPreviousPageParam: (pagination) => pagination.prevHref,
  });
};
