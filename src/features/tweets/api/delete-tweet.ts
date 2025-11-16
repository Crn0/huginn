import type { ApiClient } from "@/lib/api-client";
import type { ErrorType } from "@/lib/errors/errors.type";
import type { Pagination, Tweet } from "@/types/api";
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { tweetKeys } from "./query-key-factory";
import { useClient } from "@/hooks/use-client";

const filterDeletedTweet =
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
      ]);

      if (tweet.replyTo) {
        await queryClient.cancelQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "replies"),
        });
      }

      queryClient.setQueryData(
        tweetKeys.infinite.list("all", ""),
        filterDeletedTweet(tweet.id)
      );
      queryClient.setQueryData(
        tweetKeys.infinite.listByUser(username, "posts"),
        filterDeletedTweet(tweet.id)
      );

      if (tweet.replyTo) {
        queryClient.setQueryData(
          tweetKeys.infinite.listByUser(username, "replies"),
          filterDeletedTweet(tweet.id)
        );
      }
    },
    onSettled: (_data, _error, tweet) => {
      if (
        queryClient.isMutating({ mutationKey: tweetKeys.mutation.delete }) === 1
      ) {
        queryClient.invalidateQueries({
          queryKey: tweetKeys.infinite.list("all", ""),
        });
        queryClient.invalidateQueries({
          queryKey: tweetKeys.infinite.listByUser(username, "posts"),
        });

        if (tweet.replyTo) {
          queryClient.invalidateQueries({
            queryKey: tweetKeys.infinite.listByUser(username, "replies"),
          });
        }
      }
    },
    mutationFn: (tweet) => deleteTweet(client)(tweet),
  });
};
