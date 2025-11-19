import type { ValidationError } from "@/lib/errors";
import type { ApiClient } from "@/lib/api-client";
import type {
  Pagination,
  FollowUser,
  User,
  TweetAuthor,
  Tweet,
} from "@/types/api";

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { authUserQueryOptions } from "@/lib/auth";
import { useClient } from "@/hooks/use-client";
import { userKeys } from "@/features/users/api/query-key-factory";
import { followKeys } from "./query-key-factory";
import { tweetKeys } from "@/features/tweets/api/query-key-factory";

const transformUser =
  (action: "add" | "sub", isAuthUser: boolean) =>
  <TUser extends { _count: { following: number; followedBy: number } }>(
    user?: TUser
  ) => {
    if (!user || !user._count) return;

    if (!isAuthUser) {
      const followedByCount =
        action === "add"
          ? (user._count.followedBy += 1)
          : (user._count.followedBy -= 1);

      return {
        ...user,
        _count: { ...user._count, followedBy: followedByCount },
      };
    }

    const followingCount =
      action === "add"
        ? (user._count.following += 1)
        : (user._count.following -= 1);

    return { ...user, _count: { ...user._count, following: followingCount } };
  };

const transformFollowTweetAuthor = (
  prevPages?: InfiniteData<Pagination<Tweet[]>>
) => {
  if (prevPages) {
    const newPages = prevPages.pages.map(({ data, ...rest }) => {
      const newData = data.map((tweet) => ({
        ...tweet,
        author: {
          ...tweet.author,
          followed: !!tweet.author.followed,
        },
      }));

      return { ...rest, data: newData };
    });

    return { ...prevPages, pages: newPages };
  }

  return prevPages;
};

const filterFollowUsers =
  (id: string) => (prevPages?: InfiniteData<Pagination<FollowUser[]>>) => {
    if (prevPages) {
      const newPages = prevPages.pages.map(({ data, ...rest }) => {
        const newData = data.filter((u) => u.id !== id);

        return { ...rest, data: newData };
      });

      return { ...prevPages, pages: newPages };
    }

    return prevPages;
  };

export const followUser = (client: ApiClient) => async (username: string) => {
  return client.callApi(`users/me/follow`, {
    isAuth: true,
    method: "POST",
    data: {
      username,
    },
  });
};

export const unFollowUser = (client: ApiClient) => async (username: string) => {
  return client.callApi(`users/me/follow/${username}`, {
    isAuth: true,
    method: "DELETE",
  });
};

export type UseToggleFollowOptions = UseMutationOptions<
  Response,
  ValidationError,
  User | TweetAuthor
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
    onMutate: async (targetUser) => {
      const authUserKey = authUserQueryOptions().queryKey;

      await Promise.all([
        queryClient.cancelQueries({
          queryKey: authUserKey,
        }),
        queryClient.cancelQueries({
          queryKey: userKeys.detail(targetUser.username),
        }),
        queryClient.cancelQueries({
          queryKey: followKeys.list(username, "following"),
        }),
        queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.list("all", ""),
        }),
        queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "posts"),
        }),
        queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "replies"),
        }),
        queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "likes"),
        }),
      ]);

      queryClient.setQueryData(
        authUserKey,
        transformUser(!targetUser.followed ? "add" : "sub", true)
      );

      queryClient.setQueryData(
        userKeys.detail(username),
        transformUser(!targetUser.followed ? "add" : "sub", false)
      );

      queryClient.setQueryData(
        userKeys.detail(targetUser.username),
        transformUser(!targetUser.followed ? "add" : "sub", false)
      );

      queryClient.setQueryData(
        followKeys.list(username, "following"),
        filterFollowUsers(targetUser.id)
      );

      queryClient.setQueryData(
        tweetKeys.infinite.list("all", ""),
        transformFollowTweetAuthor
      );
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "posts"),
        transformFollowTweetAuthor
      );
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "replies"),
        transformFollowTweetAuthor
      );
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "likes"),
        transformFollowTweetAuthor
      );
    },
    onSettled: (_data, _error, targetUser) => {
      if (queryClient.isMutating({ mutationKey: followKeys.mutation }) === 1) {
        queryClient.invalidateQueries({
          queryKey: authUserQueryOptions().queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: userKeys.detail(username),
        });
        queryClient.invalidateQueries({
          queryKey: userKeys.detail(targetUser.username),
        });
        queryClient.invalidateQueries({
          queryKey: followKeys.list(username, "following"),
        });
        queryClient.invalidateQueries({
          queryKey: tweetKeys.infinite.list("all", ""),
        });
        queryClient.invalidateQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "posts"),
        });
        queryClient.invalidateQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "replies"),
        });
        queryClient.invalidateQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "likes"),
        });
      }
    },
    mutationFn: (targetUser) =>
      targetUser.followed
        ? unFollowUser(client)(targetUser.username)
        : followUser(client)(targetUser.username),
  });
};
