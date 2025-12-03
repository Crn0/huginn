import type { ApiClient } from "@/lib/api-client";
import type { ValidationError } from "@/lib/errors";

import z from "zod";
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { useClient } from "@/hooks/use-client";

import { authUserQueryOptions } from "@/lib/auth";
import { userKeys } from "./query-key-factory";

export const usernameRegex = /^[a-zA-Z0-9{_,.}]+$/;

export const MIN_USERNAME_LENGTH = 3 as const;
export const MAX_USERNAME_LENGTH = 15 as const;

export const updateUsernameInput = z.object({
  username: z
    .string()
    .min(
      MIN_USERNAME_LENGTH,
      "Username must be at least 3 characters and no more than 15 characters long"
    )
    .max(
      MAX_USERNAME_LENGTH,
      "Username must be at least 3 characters and no more than 15 characters long"
    )
    .refine((val) => usernameRegex.test(val), {
      message:
        "Username can only contain letters (A-Z, a-z), numbers (0-9), and the characters: _ , .",
    }),
});

export type UpdateUsernameInput = z.infer<typeof updateUsernameInput>;

export const updateUsername =
  (client: ApiClient) => async (data: UpdateUsernameInput) => {
    const res = await client.callApi("users/me/username", {
      data,
      method: "PATCH",
      isAuth: true,
    });

    return res.json();
  };

export type UseUpdateUsernameOption = UseMutationOptions<
  { id: string },
  ValidationError,
  UpdateUsernameInput
>;

export const useUpdateUsername = (options?: UseUpdateUsernameOption) => {
  const queryClient = useQueryClient();
  const client = useClient();
  const { onSuccess, onError, ...restConfig } = options || {};

  return useMutation({
    ...restConfig,
    onSuccess: (...args) => {
      const [, { username }] = args;

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
    mutationFn: (data) => updateUsername(client)(data),
  });
};
