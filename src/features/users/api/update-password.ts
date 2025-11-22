import type { ApiClient } from "@/lib/api-client";
import type { AuthenticationError, ValidationError } from "@/lib/errors";

import z from "zod";
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { useClient } from "@/hooks/use-client";
import { useAuthActions } from "@/hooks/use-auth-store";

import { authUserQueryOptions, type AuthUser } from "@/lib/auth";
import { userKeys } from "./query-key-factory";

export const PASSWORDRegex = /^[a-zA-Z0-9{_,.}]+$/;

export const MIN_PASSWORD_LENGTH = 8 as const;
export const MAX_PASSWORD_LENGTH = 64 as const;

export const updatePasswordInput = z
  .object({
    oldPassword: z
      .string()
      .trim()
      .min(1, { error: "Old password is required" }),
    confirmPassword: z.string().trim(),
    password: z
      .string()
      .trim()
      .min(MIN_PASSWORD_LENGTH, {
        message: "Password must be at least 8 characters long",
      })
      .max(MAX_PASSWORD_LENGTH, {
        message: "Password must be at most 64 characters long",
      }),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordInput>;

export const updatePassword =
  (client: ApiClient) => async (data: UpdatePasswordInput) =>
    client.callApi("users/me/password", {
      data,
      method: "PATCH",
      isAuth: true,
      credentials: "include",
    });

export type UseUpdatePasswordOption = UseMutationOptions<
  Response,
  ValidationError | AuthenticationError,
  UpdatePasswordInput
>;

export const useUpdatePassword = (
  user: AuthUser,
  options?: UseUpdatePasswordOption
) => {
  const queryClient = useQueryClient();
  const client = useClient();
  const { logout, setIsSilentLogin } = useAuthActions();
  const { onSuccess, onError, ...restConfig } = options || {};

  return useMutation({
    ...restConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: authUserQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(user.username),
      });
      logout();
      setIsSilentLogin();
      onSuccess?.(...args);
    },
    onError: (...args) => {
      onError?.(...args);
    },
    mutationFn: (data) => updatePassword(client)(data),
  });
};
