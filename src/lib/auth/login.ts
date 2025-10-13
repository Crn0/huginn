import z from "zod";
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type { Client } from "../api-client";
import type { ValidationError } from "../errors";
import { getAuthUserQueryOptions } from "./get-auth-user";
import { useClient } from "@/hooks/use-client";
import { passwordRegex } from "./regex";

export const loginInputSchema = z.object({
  email: z.email().trim(),
  displayName: z.string().trim().max(36, {
    message: "Use no more than 36 characters for the 'display name'",
  }),
  birthday: z.coerce.date(),
  password: z.string().refine((val) => passwordRegex.test(val), {
    message:
      "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number and no spaces",
  }),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

const loginWithEmailAndPassword =
  (client: Client) => async (data: LoginInput) => {
    const res = await client.callApi("auth/register", {
      data,
      method: "POST",
      credentials: "include",
    });

    return res.json();
  };

export interface LoginResponse {
  token: string;
}

export type UseLoginOptions = UseMutationOptions<
  LoginResponse,
  ValidationError,
  LoginInput
>;

export const useLogin = (options: UseLoginOptions = {}) => {
  const queryClient = useQueryClient();
  const client = useClient();

  const { onSuccess, onError, ...rest } = options;

  const mutation = useMutation({
    ...rest,
    mutationFn: loginWithEmailAndPassword(client),
    onSuccess: (...args) => {
      queryClient.removeQueries({
        queryKey: getAuthUserQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    onError: (...args) => {
      onError?.(...args);
    },
  });

  return mutation;
};
