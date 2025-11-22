import type { ApiClient } from "@/lib/api-client";
import type { AuthenticationError, ValidationError } from "@/lib/errors";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { useClient } from "@/hooks/use-client";
import { useAuthActions } from "@/hooks/use-auth-store";

export const deleteAccount = (client: ApiClient) => async () =>
  client.callApi("users/me", {
    method: "DELETE",
    isAuth: true,
  });

export type UseDeleteAccountOption = UseMutationOptions<
  Response,
  ValidationError | AuthenticationError,
  never
>;

export const useDeleteAccount = (options?: UseDeleteAccountOption) => {
  const queryClient = useQueryClient();
  const client = useClient();
  const { logout, setIsSilentLogin } = useAuthActions();
  const { onSuccess, onError, ...restConfig } = options || {};

  return useMutation({
    ...restConfig,
    onSuccess: (...args) => {
      queryClient.clear();
      logout();
      setIsSilentLogin();
      onSuccess?.(...args);
    },
    onError: (...args) => {
      onError?.(...args);
    },
    mutationFn: () => deleteAccount(client)(),
  });
};
