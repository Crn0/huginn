import z from "zod";
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type { ApiClient } from "@/lib/api-client";
import type { ValidationError } from "@/lib/errors";
import { useClient } from "@/hooks/use-client";
import { authUserQueryOptions, DISPLAY_NAME_LENGTH } from "@/lib/auth";
import { userKeys } from "./query-key-factory";

export const BIO_LENGTH = 160 as const;
export const LOCATION_LENGTH = 30 as const;
export const WEBSITE_LENGTH = 160 as const;
export const MAX_FILE_SIZE = 10_000_000; // 10mb

export const SUPPORTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

export type SupportedFile = (typeof SUPPORTED_FILE_TYPES)[number];

const mediaSchema = z
  .instanceof(File)
  .refine(
    (file) => SUPPORTED_FILE_TYPES.includes(file.type),
    "Only .jpg, .jpeg, .png, .webp and gif formats are supported."
  )
  .refine((file) => file.size <= MAX_FILE_SIZE, "Max media size is 10MB.");

export const updateProfileInputSchema = z.object({
  displayName: z.string().trim().min(1, "Required").max(DISPLAY_NAME_LENGTH),
  bio: z.string().trim().max(BIO_LENGTH).nullish(),
  location: z.string().trim().max(LOCATION_LENGTH).nullable(),
  website: z.url().max(WEBSITE_LENGTH).refine((v) => !/^http:\/\//.test(v), { error: "Invalid URL" })
    .optional().nullish(),
  birthday: z.coerce
    .date()
    .refine((birthday) => new Date() > birthday, {
      error: "Birthday must be in the past",
    })
    .transform((date) => date.toISOString()),
  avatar: mediaSchema.nullable(),
  banner: mediaSchema.nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

export const updateProfile =
  (client: ApiClient) => async (data: UpdateProfileInput) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (["avatar", "banner"].includes(key) && value instanceof File) {
        formData.append(key, value);
      }

      if (typeof value === "string") {
        formData.append(key, value);
      }
    });

    const res = await client.callApi("users/me/profile", {
      data: formData,
      method: "PATCH",
      isAuth: true,
    });

    return res.json();
  };

type UseUpdateProfileOptions = UseMutationOptions<
  { id: string },
  ValidationError,
  UpdateProfileInput
>;

export const useUpdateProfile = (
  username: string,
  options?: UseUpdateProfileOptions
) => {
  const queryClient = useQueryClient();
  const client = useClient();
  const { onSuccess, onError, ...restConfig } = options || {};

  return useMutation({
    ...restConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: authUserQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(username) });
      queryClient.invalidateQueries({ queryKey: userKeys.list() });

      onSuccess?.(...args);
    },
    onError: (...args) => {
      onError?.(...args);
    },
    mutationFn: (data) => updateProfile(client)(data),
  });
};
