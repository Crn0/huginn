import z from "zod";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { Client } from "../api-client";
import type { ConflictError, ValidationError } from "../errors";
import { useClient } from "@/hooks/use-client";

export const DISPLAY_NAME_LENGTH = 36 as const;

export const PASSWORD_MIN_LENGTH = 8 as const;

export const PASSWORD_MAX_LENGTH = 64 as const;

export const registerInputSchema = z.object({
  email: z.email().trim(),
  displayName: z
    .string()
    .trim()
    .min(1, { error: "Required" })
    .max(DISPLAY_NAME_LENGTH, {
      error: "Use no more than 36 characters for the 'display name'",
    }),
  birthday: z.coerce.date().transform((date) => date.toISOString()),
  password: z
    .string()
    .trim()
    .min(PASSWORD_MIN_LENGTH, {
      error: "Password must be at least 8 characters long",
    })
    .max(PASSWORD_MAX_LENGTH, {
      error: "Password must be at most 64 characters long",
    }),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

const registerWithEmailAndPassword =
  (client: Client) => async (data: RegisterInput) => {
    console.log(data);
    return client.callApi("auth/register", {
      data,
      method: "POST",
      credentials: "include",
    });
  };

export type UseRegisterOptions = UseMutationOptions<
  Response,
  ValidationError | ConflictError,
  RegisterInput
>;

export const useRegister = (options: UseRegisterOptions) => {
  const client = useClient();

  const { onSuccess, onError, ...rest } = options;

  return useMutation({
    ...rest,
    mutationFn: registerWithEmailAndPassword(client),
    onSuccess: (...args) => onSuccess?.(...args),
    onError: (...args) => {
      onError?.(...args);
    },
  });
};
