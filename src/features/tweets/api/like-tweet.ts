import type { ValidationError } from "@/lib/errors";
import type { ApiClient } from "@/lib/api-client";
import type { Notification, Pagination, Tweet } from "@/types/api";

import { useSearch } from "@tanstack/react-router";
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { tweetKeys } from "./query-key-factory";
import { notificationKeys } from "@/features/notifications/api/query-key-factory";
import {
  filterLikeTweet,
  transformLikeReplies,
  transformLikeTweet,
  transformLikeTweets,
} from "./mapper";

import { useClient } from "@/hooks/use-client";

export const likeTweet =
  (client: ApiClient) => async (tweet: Pick<Tweet, "id">) => {
    return client.callApi(`tweets/${tweet.id}/likes`, {
      isAuth: true,
      method: "POST",
    });
  };

export const unlikeTweet =
  (client: ApiClient) => async (tweet: Pick<Tweet, "id">) => {
    return client.callApi(`tweets/${tweet.id}/likes`, {
      isAuth: true,
      method: "DELETE",
    });
  };

export type UseToggleLikeTweetOptions = UseMutationOptions<
  Response,
  ValidationError,
  { tweet: Omit<Tweet, "with-replies">; pageTweet?: Tweet }
>;

export const useToggleLikeTweet = (
  username: string,
  options?: UseToggleLikeTweetOptions
) => {
  const queryClient = useQueryClient();
  const search = useSearch({ strict: false });
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
          queryKey: tweetKeys.infinite.list("following", ""),
        }),
        queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "posts"),
        }),
        queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "with-replies"),
        }),
        queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "likes"),
        }),
        queryClient.cancelQueries({
          queryKey: notificationKeys.list(username),
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

      if (pageTweet) {
        queryClient.setQueryData(
          tweetKeys.infinite.replies(pageTweet.id),
          transformLikeReplies(tweet)
        );
      }

      queryClient.setQueryData(tweetKeys.detail(tweet.id), transformLikeTweet);
      queryClient.setQueryData(
        tweetKeys.infinite.list("all", ""),
        transformLikeTweets(tweet)
      );
      queryClient.setQueryData(
        tweetKeys.infinite.list("following", ""),
        transformLikeTweets(tweet)
      );

      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "posts"),
        transformLikeTweets(tweet)
      );
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "with-replies"),
        transformLikeTweets(tweet)
      );
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "likes"),
        filterLikeTweet(tweet)
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
                tweet: transformLikeTweet(n.tweet),
              };
            });

            return { ...rest, data: newData };
          });

          return { ...prevPages, pages: newPages };
        }
      );

      if (search.f === "posts" && search.q) {
        queryClient.setQueryData(
          tweetKeys.infinite.list("all", search.q),
          transformLikeTweets(tweet)
        );
      }
    },
    onSettled: async (_data, _error, { tweet }) => {
      if (
        queryClient.isMutating({ mutationKey: tweetKeys.mutation.like }) === 1
      ) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: tweetKeys.detail(tweet.id),
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
            queryKey: tweetKeys.infinite.reply(),
          }),
          queryClient.invalidateQueries({
            queryKey: notificationKeys.list(username),
          }),
          search.f === "posts" && search.q
            ? queryClient.invalidateQueries({
                queryKey: tweetKeys.infinite.list("all", search.q),
              })
            : Promise.resolve(),
        ]);
      }
    },
    mutationFn: ({ tweet }) =>
      tweet.liked ? unlikeTweet(client)(tweet) : likeTweet(client)(tweet),
  });
};
