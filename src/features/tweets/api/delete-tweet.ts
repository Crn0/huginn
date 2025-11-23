import type { ApiClient } from "@/lib/api-client";
import type { ErrorType } from "@/lib/errors/errors.type";
import type { Pagination, Tweet, User } from "@/types/api";
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { tweetKeys } from "./query-key-factory";
import { userKeys } from "@/features/users/api/query-key-factory";
import { mediaKeys } from "@/features/media/api/query-key-factory";
import { authUserQueryOptions } from "@/lib/auth";

import { useClient } from "@/hooks/use-client";

const filterDeletedTweet =
  (id: string) => (prevPages?: InfiniteData<Pagination<Tweet[]>>) => {
    if (prevPages) {
      const newPages = prevPages.pages.map(({ data, ...rest }) => {
        const newData = data.filter(
          (tweet) => tweet.id !== id && tweet.replyTo?.id !== id
        );

        return { ...rest, data: newData };
      });

      return { ...prevPages, pages: newPages };
    }

    return prevPages;
  };

const transformUser = <TUser extends Pick<User, "_count">>(user?: TUser) => {
  if (!user) return;

  return {
    ...user,
    _count: { ...user?._count, tweets: (user._count.tweets -= 1) },
  };
};

export const deleteTweet = (client: ApiClient) => async (tweet: Tweet) => {
  return client.callApi(`tweets/${tweet.id}`, {
    isAuth: true,
    method: "DELETE",
  });
};

export type UseDeleteTweetOptions = UseMutationOptions<
  Response,
  ErrorType,
  Tweet
>;

export const useDeleteTweet = (
  username: string,
  options?: UseDeleteTweetOptions
) => {
  const queryClient = useQueryClient();
  const client = useClient();

  return useMutation({
    ...options,
    mutationKey: tweetKeys.mutation.delete,
    onMutate: async (tweet) => {
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.list("all", ""),
        }),
        queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "posts"),
        }),
        queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "replies"),
        }),
      ]);

      if (username === tweet.author.username) {
        const authKey = authUserQueryOptions().queryKey;
        const userKey = userKeys.detail(username);

        await Promise.all([
          queryClient.cancelQueries({
            queryKey: authKey,
          }),
          queryClient.cancelQueries({
            queryKey: userKey,
          }),
        ]);

        queryClient.setQueryData(authKey, transformUser);
        queryClient.setQueryData(userKey, transformUser);
      }

      queryClient.setQueryData(
        tweetKeys.infinite.list("all", ""),
        filterDeletedTweet(tweet.id)
      );
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "posts"),
        filterDeletedTweet(tweet.id)
      );
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "replies"),
        filterDeletedTweet(tweet.id)
      );
    },
    onSettled: (_data, _error, tweet) => {
      if (
        queryClient.isMutating({ mutationKey: tweetKeys.mutation.delete }) === 1
      ) {
        if (username === tweet.author.username) {
          const authKey = authUserQueryOptions().queryKey;
          const userKey = userKeys.detail(username);

          queryClient.invalidateQueries({
            queryKey: authKey,
          });
          queryClient.invalidateQueries({
            queryKey: userKey,
          });
        }


      if (tweet.media.length > 0) {
        queryClient.invalidateQueries({
          queryKey: mediaKeys.list(username) 
        })


      }

        queryClient.invalidateQueries({
          queryKey: tweetKeys.infinite.list("all", ""),
        });
        queryClient.invalidateQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "posts"),
        });
        queryClient.invalidateQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "replies"),
        });
      }
    },
    mutationFn: (tweet) => deleteTweet(client)(tweet),
  });
};
