import type { ValidationError } from "@/lib/errors";
import type { ApiClient } from "@/lib/api-client";

import z from "zod";
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { tweetKeys } from "./query-key-factory";
import { useClient } from "@/hooks/use-client";
import { createTweetInputSchema } from "./create-tweet";

export const replyTweetInputSchema = createTweetInputSchema.extend({
  replyTo: z.uuidv7(),
});

export type ReplyTweetInput = z.infer<typeof replyTweetInputSchema>;

export const replyToTweet =
  (client: ApiClient) => async (data: ReplyTweetInput) => {
    const formData = new FormData();
    const { replyTo, ...rest } = data;

    Object.entries(rest).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        return value.forEach((v) => formData.append(key, v));
      }

      if (typeof value === "string") {
        formData.append(key, value);
      }
    });

    const res = await client.callApi(`tweets/${replyTo}/replies`, {
      data: formData,
      method: "POST",
      isAuth: true,
    });

    return res.json();
  };

type UseReplyTweetOption = UseMutationOptions<
  { id: string },
  ValidationError,
  ReplyTweetInput
>;

export const useReplyTweet = (
  username: string,
  options?: UseReplyTweetOption
) => {
  const queryClient = useQueryClient();
  const client = useClient();
  const { onSuccess, onError, ...restConfig } = options || {};

  return useMutation({
    ...restConfig,
    mutationKey: tweetKeys.mutation.reply,
    onSuccess: (data, variables, context) => {
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
        queryKey: tweetKeys.infinite.replies(variables.replyTo),
      });
      onSuccess?.(data, variables, context);
    },
    onError: (...args) => {
      onError?.(...args);
    },
    mutationFn: (data) => replyToTweet(client)(data),
  });
};
