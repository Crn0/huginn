import type { Client } from "@/lib/api-client";
import type { AuthenticationError, ValidationError } from "@/lib/errors";

import z from "zod";
import { useClient } from "@/hooks/use-client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

export const PASSWORDRegex = /^[a-zA-Z0-9{_,.}]+$/;

export const MIN_PASSWORD_LENGTH = 8 as const;
export const MAX_PASSWORD_LENGTH = 64 as const;

export const resetPasswordInput = z
  .object({
    token: z.string(),
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

export type ResetPasswordInput = z.infer<typeof resetPasswordInput>;

export const resetPassword =
  (client: Client) => async (data: ResetPasswordInput) =>
    client.callApi("auth/reset-password", {
      data,
      method: "PATCH",
    });

export type UseResetPasswordOption = UseMutationOptions<
  Response,
  ValidationError | AuthenticationError,
  ResetPasswordInput
>;

export const useResetPassword = (options?: UseResetPasswordOption) => {
  const client = useClient();
  const { onSuccess, onError, ...restConfig } = options || {};

  return useMutation({
    ...restConfig,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    onError: (...args) => {
      onError?.(...args);
    },
    mutationFn: (data) => resetPassword(client)(data),
  });
};
