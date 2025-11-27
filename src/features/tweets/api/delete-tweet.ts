import type { ApiClient } from "@/lib/api-client";
import type { ErrorType } from "@/lib/errors/errors.type";
import type { Tweet } from "@/types/api";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { tweetKeys } from "./query-key-factory";
import { userKeys } from "@/features/users/api/query-key-factory";
import { mediaKeys } from "@/features/media/api/query-key-factory";
import { authUserQueryOptions } from "@/lib/auth";

import { isTweetReplies } from "../utils/is-tweet-replies";
import { transformUserTweetCount, filterDeletedReplies, filterDeletedTweets, transformTweetReplyCount } from "./mapper";

import { useClient } from "@/hooks/use-client";

export const deleteTweet = (client: ApiClient) => async (tweet: Tweet) => {
  return client.callApi(`tweets/${tweet.id}`, {
    isAuth: true,
    method: "DELETE",
  });
};

export type UseDeleteTweetOptions = UseMutationOptions<
  Response,
  ErrorType,
  { tweet: Tweet, pageTweet?: Tweet }
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
    onMutate: async ({tweet, pageTweet}) => {
      await Promise.all([
                queryClient.cancelQueries({
            queryKey: userKeys.detail(username),
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
        !tweet.replyTo ? Promise.resolve() : queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.replies(tweet.replyTo.id)
        }),
        !tweet.liked ? Promise.resolve() :         queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "likes"),
        }),
         username !== tweet.author.username ? Promise.resolve() :  queryClient.cancelQueries({
            queryKey: authUserQueryOptions().queryKey,
          }),
          !pageTweet ? Promise.resolve() : queryClient.cancelQueries({
            queryKey: tweetKeys.infinite.replies(pageTweet.id)
          }),
          !tweet.media.length ? Promise.resolve() : queryClient.cancelQueries({
            queryKey: mediaKeys.list(username)
          })
      ]);

      if (username === tweet.author.username) {
        queryClient.setQueryData(authUserQueryOptions().queryKey, transformUserTweetCount("delete"));
      }

      if (pageTweet) {
        queryClient.setQueryData(tweetKeys.infinite.replies(pageTweet.id), !isTweetReplies(tweet) ? filterDeletedTweets(tweet) : filterDeletedReplies(tweet))
      }

      if (tweet.replyTo) {
        console.log(tweet.content, tweet.replyTo.id)
         queryClient.setQueryData(
        tweetKeys.detail(tweet.replyTo.id),
        transformTweetReplyCount("delete")
      );
      }

      if (tweet.liked) {
              queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "likes"),
        filterDeletedTweets(tweet)
      );
      }

      queryClient.setQueryData(userKeys.detail(username), transformUserTweetCount("delete"));
      queryClient.setQueryData(
        tweetKeys.infinite.list("all", ""),
        filterDeletedTweets(tweet)
      );
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "posts"),
        filterDeletedTweets(tweet)
      );
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "replies"),
        filterDeletedTweets(tweet)
      );
    },
    onSettled: (_data, _error, {tweet}) => {
      if (
        queryClient.isMutating({ mutationKey: tweetKeys.mutation.delete }) === 1
      ) {
             queryClient.invalidateQueries({
            queryKey: userKeys.detail(username),
          });

        if (username === tweet.author.username) {
          queryClient.invalidateQueries({
            queryKey: authUserQueryOptions().queryKey,
          });
        }


        if (tweet.media.length > 0) {
          queryClient.invalidateQueries({
            queryKey: mediaKeys.list(username),
          });
        }

        if (tweet.liked) {
                  queryClient.invalidateQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "likes"),
        });
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
        queryClient.invalidateQueries({
            queryKey: tweetKeys.infinite.reply()
          });
      }
    },
    mutationFn: ({tweet}) => deleteTweet(client)(tweet),
  });
};
