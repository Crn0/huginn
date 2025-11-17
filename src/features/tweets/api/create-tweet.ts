import { useClient } from "@/hooks/use-client";
import type { ApiClient } from "@/lib/api-client";
import type { ValidationError } from "@/lib/errors";
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import z from "zod";
import { tweetKeys } from "./query-key-factory";

export const MAX_CONTENT_LENGTH = 1000 as const;
export const MAX_MEDIA_LENGTH = 4;
export const MAX_FILE_SIZE = 10_000_000; // 10mb

export const ACCEPTED_ATTACHMENTS_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
] as const;

const isAcceptedMediaFile = (type: string) => {
  if (
    ![
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
    ].includes(type)
  )
    return false;

  return true;
};

const tweetMediaSchema = z
  .array(z.instanceof(File))
  .max(MAX_MEDIA_LENGTH, {
    message: `You can only upload ${MAX_MEDIA_LENGTH} files at a time!`,
  })
  .refine(
    (files) =>
      Array.from(files).every((file) => isAcceptedMediaFile(file.type)),
    "Only .jpg, .jpeg, .png, .webp, epub and pdf formats are supported."
  )
  .refine(
    (files) => Array.from(files).every((file) => file?.size <= MAX_FILE_SIZE),
    "Max image size is 10MB"
  );

export const createTweetInputSchema = z.object({
  content: z
    .string()
    .trim()
    .max(MAX_CONTENT_LENGTH, {
      error: `Content must contain at most ${MAX_CONTENT_LENGTH} characters.`,
    })
    .nullish(),
  media: tweetMediaSchema.optional(),
});

export type CreateTweetInput = z.infer<typeof createTweetInputSchema>;

export const createTweet =
  (client: ApiClient) => async (data: CreateTweetInput) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        return value.forEach((v) => formData.append(key, v));
      }

      if (typeof value === "string") {
        formData.append(key, value);
      }
    });

    const res = await client.callApi("tweets", {
      data: formData,
      method: "POST",
      isAuth: true,
    });

    return res.json();
  };

type UseUpdateProfileOptions = UseMutationOptions<
  { id: string },
  ValidationError,
  CreateTweetInput
>;

export const useCreateTweet = (
  username: string,
  options?: UseUpdateProfileOptions
) => {
  const queryClient = useQueryClient();
  const client = useClient();
  const { onSuccess, onError, ...restConfig } = options || {};

  return useMutation({
    ...restConfig,
    mutationKey: tweetKeys.mutation.create,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: tweetKeys.infinite.listByUser(username, "posts"),
      });
      queryClient.invalidateQueries({
        queryKey: tweetKeys.infinite.list("all", ""),
      });
      onSuccess?.(...args);
    },
    onError: (...args) => {
      onError?.(...args);
    },
    mutationFn: (data) => createTweet(client)(data),
  });
};
