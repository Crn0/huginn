import type { ValidationError } from "@/lib/errors";
import type { ApiClient } from "@/lib/api-client";
import type { Tweet } from "@/types/api";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { tweetKeys } from "./query-key-factory";
import { useClient } from "@/hooks/use-client";
import { filterLikeTweet, transformLikeReplies, transformLikeTweet, transformLikeTweets } from "./mapper";

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
  { tweet: Tweet, pageTweet?: Tweet }
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
    onMutate: async ({ tweet, pageTweet }) => {

      await Promise.all([
        queryClient.cancelQueries({
          queryKey: tweetKeys.detail(tweet.id),
        }),
        queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.list("all", ""),
        }),
        queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "posts"),
        }),
        queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "likes"),
        }),
        !pageTweet ? Promise.resolve() : queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.replies(pageTweet.id),
        })
      ]);

      if (pageTweet) {

              queryClient.setQueryData(
       tweetKeys.infinite.replies(pageTweet.id),
        transformLikeReplies(tweet)
      );
      }

      queryClient.setQueryData(tweetKeys.detail(tweet.id), transformLikeTweet)
      queryClient.setQueryData(
        tweetKeys.infinite.list("all", ""),
        transformLikeTweets(tweet)
      );
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "posts"),
        transformLikeTweets(tweet)
      );
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "likes"),
        filterLikeTweet(tweet)
      );
    },
    onSettled: (_data, _error, { tweet }) => {
      if (
        queryClient.isMutating({ mutationKey: tweetKeys.mutation.like }) === 1
      ) {
        queryClient.invalidateQueries({
          queryKey: tweetKeys.detail(tweet.id)
        });
        queryClient.invalidateQueries({
          queryKey: tweetKeys.infinite.list("all", ""),
        });
        queryClient.invalidateQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "posts"),
        });
        queryClient.invalidateQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "likes"),
        });
          queryClient.invalidateQueries({
            queryKey: tweetKeys.infinite.reply()
          });
      }
    },
    mutationFn: ({ tweet }) => 
      tweet.liked ? unlikeTweet(client)(tweet) : likeTweet(client)(tweet),
  });
};
