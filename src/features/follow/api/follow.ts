import type { ValidationError } from "@/lib/errors";
import type { ApiClient } from "@/lib/api-client";
import type { Pagination, User, TweetAuthor, Notification } from "@/types/api";

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { authUserQueryOptions } from "@/lib/auth";
import { userKeys } from "@/features/users/api/query-key-factory";
import { followKeys } from "./query-key-factory";
import { tweetKeys } from "@/features/tweets/api/query-key-factory";
import { notificationKeys } from "@/features/notifications/api/query-key-factory";

import { useClient } from "@/hooks/use-client";

export const followUser = (client: ApiClient) => async (followId: string) => {
  return client.callApi(`users/me/follow`, {
    isAuth: true,
    method: "POST",
    data: {
      followId,
    },
  });
};

export const unFollowUser = (client: ApiClient) => async (followId: string) => {
  return client.callApi(`users/me/follow/${followId}`, {
    isAuth: true,
    method: "DELETE",
  });
};

export type UseToggleFollowOptions = UseMutationOptions<
  Response,
  ValidationError,
  { targetUser: User | TweetAuthor; tweetPage?: { id: string } }
>;

export const useToggleFollowUser = (
  username: string,
  options?: UseToggleFollowOptions
) => {
  const queryClient = useQueryClient();
  const client = useClient();

  return useMutation({
    ...options,
    mutationKey: followKeys.mutation,
    onMutate: async ({ targetUser, tweetPage }) => {
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: userKeys.detail(targetUser.username),
        }),
        queryClient.cancelQueries({
          queryKey: notificationKeys.list(username),
        }),
        tweetPage
          ? queryClient.cancelQueries({
              queryKey: tweetKeys.detail(tweetPage.id),
            })
          : Promise.resolve(),
      ]);

      queryClient.setQueryData(
        userKeys.detail(targetUser.username),
        (user: User) => {
          if (!user) return user;

          return {
            ...user,
            followed: !user.followed,
            _count: {
              ...user?._count,
              followedBy: !targetUser.followed
                ? (user._count.followedBy += 1)
                : (user._count.followedBy -= 1),
            },
          };
        }
      );

      queryClient.setQueryData(
        notificationKeys.list(username),
        (
          prevPages: InfiniteData<
            Pagination<Notification[]> & { unreadCount: number }
          >
        ) => {
          const newPages = prevPages.pages.map(({ data, ...rest }) => {
            const newData = data.map((n) => {
              if (n.type === "FOLLOW") return n;

              return {
                ...n,
                tweet: {
                  ...n.tweet,
                  author: {
                    ...n.tweet.author,
                    followed: !!n.tweet.author.followed,
                  },
                },
              };
            });

            return { ...rest, data: newData };
          });

          return { ...prevPages, pages: newPages };
        }
      );
    },
    onSettled: async (_data, _error, { targetUser, tweetPage }) => {
      if (queryClient.isMutating({ mutationKey: followKeys.mutation }) === 1) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: authUserQueryOptions().queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: userKeys.detail(username),
          }),
          queryClient.invalidateQueries({
            queryKey: userKeys.detail(targetUser.username),
          }),
          queryClient.invalidateQueries({
            queryKey: userKeys.infinite.list(),
          }),
          queryClient.invalidateQueries({
            queryKey: followKeys.list(username, "following"),
          }),
          queryClient.invalidateQueries({
            queryKey: tweetKeys.infinite.list("all", ""),
          }),
          queryClient.invalidateQueries({
            queryKey: tweetKeys.infinite.list("following", ""),
          }),
          queryClient.invalidateQueries({
            queryKey: tweetKeys.infinite.listByUser(username, "posts"),
          }),
          queryClient.invalidateQueries({
            queryKey: tweetKeys.infinite.listByUser(username, "with-replies"),
          }),
          queryClient.invalidateQueries({
            queryKey: tweetKeys.infinite.listByUser(username, "likes"),
          }),
          queryClient.invalidateQueries({
            queryKey: notificationKeys.list(username),
          }),
          tweetPage
            ? queryClient.invalidateQueries({
                queryKey: tweetKeys.detail(tweetPage.id),
              })
            : Promise.resolve(),
        ]);
      }
    },
    mutationFn: ({ targetUser }) =>
      targetUser.followed
        ? unFollowUser(client)(targetUser.id)
        : followUser(client)(targetUser.id),
  });
};
