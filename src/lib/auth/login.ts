import z from "zod";
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type { Client } from "../api-client";
import type { ValidationError, AuthenticationError } from "../errors";
import { authUserQueryOptions } from "./auth-user";
import { useClient } from "@/hooks/use-client";

export const loginInputSchema = z.object({
  email: z.email().trim(),
  password: z.string().trim().min(1, { error: "Required" }),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export interface LoginResponse {
  token: string;
}

const loginWithEmailAndPassword =
  (client: Client) =>
  async (data: LoginInput): Promise<LoginResponse> => {
    const res = await client.callApi("auth/login", {
      data,
      method: "POST",
      credentials: "include",
    });

    return res.json();
  };

export type UseLoginOptions = UseMutationOptions<
  LoginResponse,
  ValidationError | AuthenticationError,
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
        queryKey: authUserQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    onError: (...args) => {
      onError?.(...args);
    },
  });

  return mutation;
};
