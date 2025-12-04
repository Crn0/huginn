import type { ValidationError } from "@/lib/errors";
import type { ApiClient } from "@/lib/api-client";
import type { Tweet } from "@/types/api";

import { useSearch } from "@tanstack/react-router";
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { tweetKeys } from "./query-key-factory";
import { useClient } from "@/hooks/use-client";
import {
  filterRepostTweet,
  transformRepostReplies,
  transformRepostTweet,
  transformRepostTweets,
} from "./mapper";

export const repostTweet = (client: ApiClient) => async (tweet: Pick<Tweet, "id">) => {
  return client.callApi(`tweets/${tweet.id}/repost`, {
    isAuth: true,
    method: "POST",
  });
};

export const unRepostTweet = (client: ApiClient) => async (tweet: Pick<Tweet, "id">) => {
  return client.callApi(`tweets/${tweet.id}/repost`, {
    isAuth: true,
    method: "DELETE",
  });
};

export type UseToggleRepostTweetOptions = UseMutationOptions<
  Response,
  ValidationError,
  { tweet: Omit<Tweet, "replies">; pageTweet?: Tweet }
>;

export const useToggleRepostTweet = (
  username: string,
  options?: UseToggleRepostTweetOptions
) => {
  const queryClient = useQueryClient();
  const search = useSearch({ strict: false });
  const client = useClient();

  return useMutation({
    ...options,
    mutationKey: tweetKeys.mutation.repost,
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
          queryKey: tweetKeys.infinite.listByUser(username, "following"),
        }),
        queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "likes"),
        }),
        pageTweet
          ? queryClient.cancelQueries({
              queryKey: tweetKeys.infinite.replies(pageTweet.id),
            })
          : Promise.resolve(),
        search.f === "posts" && search.q
          ? queryClient.cancelQueries({
              queryKey: tweetKeys.infinite.list("all", search.q),
            })
          : Promise.resolve(),
      ]);

      if (pageTweet && pageTweet.id !== tweet.id) {
        queryClient.setQueryData(
          tweetKeys.infinite.replies(pageTweet.id),
          transformRepostReplies(tweet)
        );
      }

      queryClient.setQueryData(tweetKeys.detail(tweet.id), transformRepostTweet);
      queryClient.setQueryData(
        tweetKeys.infinite.list("all", ""),
        transformRepostTweets(tweet)
      );
                    queryClient.setQueryData(tweetKeys.infinite.list("following", ""), transformRepostTweets(tweet));
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "posts"),
        filterRepostTweet(tweet)
      );
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "likes"),
        transformRepostTweets(tweet)
      );

      if (search.f === "posts" && search.q) {
        queryClient.setQueryData(
          tweetKeys.infinite.list("all", search.q),
          transformRepostTweets(tweet)
        );
      }
    },
    onSettled: (_data, _error, { tweet }) => {
      if (
        queryClient.isMutating({ mutationKey: tweetKeys.mutation.repost }) === 1
      ) {
        queryClient.invalidateQueries({
          queryKey: tweetKeys.detail(tweet.id),
        });
        queryClient.invalidateQueries({
          queryKey: tweetKeys.infinite.list("all", ""),
        });
                queryClient.invalidateQueries({
          queryKey: tweetKeys.infinite.list("following", ""),
        });
        queryClient.invalidateQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "posts"),
        });
        queryClient.invalidateQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "likes"),
        });
        queryClient.invalidateQueries({
          queryKey: tweetKeys.infinite.reply(),
        });

        if (search.f === "posts" && search.q) {
          queryClient.invalidateQueries({
            queryKey: tweetKeys.infinite.list("all", search.q),
          });
        }
      }
    },
    mutationFn: ({ tweet }) =>
      tweet.reposted ? unRepostTweet(client)(tweet) : repostTweet(client)(tweet),
   
  });
};
