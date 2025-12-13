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
import {
  transformUserTweetCount,
  filterDeletedReplies,
  filterDeletedTweets,
  transformTweetReplyCount,
} from "./mapper";

import { useClient } from "@/hooks/use-client";
import { useSearch } from "@tanstack/react-router";

export const deleteTweet =
  (client: ApiClient) => async (tweet: Pick<Tweet, "id">) => {
    return client.callApi(`tweets/${tweet.id}`, {
      isAuth: true,
      method: "DELETE",
    });
  };

export type UseDeleteTweetOptions = UseMutationOptions<
  Response,
  ErrorType,
  { tweet: Omit<Tweet, "with-replies">; pageTweet?: Tweet }
>;

export const useDeleteTweet = (
  username: string,
  options?: UseDeleteTweetOptions
) => {
  const queryClient = useQueryClient();
  const search = useSearch({ strict: false });
  const client = useClient();

  return useMutation({
    ...options,
    mutationKey: tweetKeys.mutation.delete,
    onMutate: async ({ tweet, pageTweet }) => {
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
          queryKey: tweetKeys.infinite.listByUser(username, "with-replies"),
        }),
        tweet.replyTo
          ? queryClient.cancelQueries({
              queryKey: tweetKeys.infinite.replies(tweet.replyTo.id),
            })
          : Promise.resolve(),
        tweet.liked
          ? queryClient.cancelQueries({
              queryKey: tweetKeys.infinite.listByUser(username, "likes"),
            })
          : Promise.resolve(),
        username === tweet.author.username
          ? queryClient.cancelQueries({
              queryKey: authUserQueryOptions().queryKey,
            })
          : Promise.resolve(),
        pageTweet
          ? queryClient.cancelQueries({
              queryKey: tweetKeys.infinite.replies(pageTweet.id),
            })
          : Promise.resolve(),
        tweet.media.length
          ? queryClient.cancelQueries({
              queryKey: mediaKeys.listByUser(username),
            })
          : Promise.resolve(),
        search.f === "posts" && search.q
          ? queryClient.cancelQueries({
              queryKey: tweetKeys.infinite.list("all", search.q),
            })
          : Promise.resolve(),
      ]);

      if (username === tweet.author.username) {
        queryClient.setQueryData(
          authUserQueryOptions().queryKey,
          transformUserTweetCount("delete")
        );
      }

      if (pageTweet) {
        queryClient.setQueryData(
          tweetKeys.infinite.replies(pageTweet.id),
          !isTweetReplies(tweet)
            ? filterDeletedTweets(tweet)
            : filterDeletedReplies(tweet)
        );
      }

      if (tweet.replyTo) {
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
      queryClient.setQueryData(
        userKeys.detail(username),
        transformUserTweetCount("delete")
      );
      queryClient.setQueryData(
        tweetKeys.infinite.list("all", ""),
        filterDeletedTweets(tweet)
      );
      queryClient.setQueryData(
        tweetKeys.infinite.list("following", ""),
        filterDeletedTweets(tweet)
      );
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "posts"),
        filterDeletedTweets(tweet)
      );
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "with-replies"),
        filterDeletedTweets(tweet)
      );

      if (search.f === "posts" && search.q) {
        queryClient.setQueryData(
          tweetKeys.infinite.list("all", search.q),
          filterDeletedTweets(tweet)
        );
      }
    },
    onSettled: async (_data, _error, { tweet }) => {
      if (
        queryClient.isMutating({ mutationKey: tweetKeys.mutation.delete }) === 1
      ) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: userKeys.detail(username),
          }),
          username === tweet.author.username
            ? queryClient.invalidateQueries({
                queryKey: authUserQueryOptions().queryKey,
              })
            : Promise.resolve(),

          tweet.media.length > 0
            ? queryClient.invalidateQueries({
                queryKey: mediaKeys.listByUser(username),
              })
            : Promise.resolve(),
          tweet.liked
            ? queryClient.invalidateQueries({
                queryKey: tweetKeys.infinite.listByUser(username, "likes"),
              })
            : Promise.resolve(),
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
            queryKey: tweetKeys.infinite.reply(),
          }),
        ]);

        if (search.f === "posts" && search.q) {
          queryClient.invalidateQueries({
            queryKey: tweetKeys.infinite.list("all", search.q),
          });
        }
      }
    },
    mutationFn: ({ tweet }) => deleteTweet(client)(tweet),
  });
};
