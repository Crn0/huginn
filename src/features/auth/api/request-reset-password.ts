import type { Client } from "@/lib/api-client";

import z from "zod";
import { useClient } from "@/hooks/use-client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AuthenticationError, ValidationError } from "@/lib/errors";

export const requestInputSchema = z.object({
  email: z.email().trim().toLowerCase(),
});

export type RequestInputSchema = z.infer<typeof requestInputSchema>;

const requestResetPassword =
  (client: Client) => async (data: RequestInputSchema) =>
    client.callApi("auth/reset-password", {
      data,
      method: "POST",
    });

export type UseRequestResetPasswordOptions = UseMutationOptions<
  Response,
  ValidationError | AuthenticationError,
  RequestInputSchema
>;

export const useRequestResetPassword = (
  options: UseRequestResetPasswordOptions = {}
) => {
  const client = useClient();

  const { onSuccess, onError, ...rest } = options;

  const mutation = useMutation({
    ...rest,
    mutationFn: requestResetPassword(client),
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    onError: (...args) => {
      onError?.(...args);
    },
  });

  return mutation;
};
