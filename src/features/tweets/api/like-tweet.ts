import type { ValidationError } from "@/lib/errors";
import type { ApiClient } from "@/lib/api-client";
import type { Pagination, Tweet } from "@/types/api";

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { tweetKeys } from "./query-key-factory";
import { useClient } from "@/hooks/use-client";

const transformLikedTweet =
  (id: string) => (prevPages?: InfiniteData<Pagination<Tweet[]>>) => {
    if (prevPages) {
      const newPages = prevPages.pages.map(({ data, ...rest }) => {
        const newData = data.map((tweet) =>
          tweet.id !== id ? tweet : { ...tweet, liked: !tweet.liked }
        );

        return { ...rest, data: newData };
      });

      return { ...prevPages, pages: newPages };
    }

    return prevPages;
  };

const filterunlikedTweet =
  (id: string) => (prevPages?: InfiniteData<Pagination<Tweet[]>>) => {
    if (prevPages) {
      const newPages = prevPages.pages.map(({ data, ...rest }) => {
        const newData = data.filter((tweet) => tweet.id !== id);

        return { ...rest, data: newData };
      });

      return { ...prevPages, pages: newPages };
    }

    return prevPages;
  };

export const likeTweet = (client: ApiClient) => async (tweet: Tweet) => {
  return client.callApi(`tweets/${tweet.id}/likes`, {
    isAuth: true,
    method: "POST",
  });
};

export const unlikeTweet = (client: ApiClient) => async (tweet: Tweet) => {
  return client.callApi(`tweets/${tweet.id}/likes`, {
    isAuth: true,
    method: "DELETE",
  });
};

export type UseToggleLikeTweetOptions = UseMutationOptions<
  Response,
  ValidationError,
  Tweet
>;

export const useToggleLikeTweet = (
  username: string,
  options?: UseToggleLikeTweetOptions
) => {
  const queryClient = useQueryClient();
  const client = useClient();

  return useMutation({
    ...options,
    mutationKey: tweetKeys.mutation.like,
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
        queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "likes"),
        }),
      ]);

      queryClient.setQueryData(
        tweetKeys.infinite.list("all", ""),
        transformLikedTweet(tweet.id)
      );
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "posts"),
        transformLikedTweet(tweet.id)
      );
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "replies"),
        transformLikedTweet(tweet.id)
      );
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "likes"),
        filterunlikedTweet(tweet.id)
      );
    },
    onSettled: () => {
      if (
        queryClient.isMutating({ mutationKey: tweetKeys.mutation.like }) === 1
      ) {
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
    mutationFn: (tweet) =>
      tweet.liked ? unlikeTweet(client)(tweet) : likeTweet(client)(tweet),
  });
};
