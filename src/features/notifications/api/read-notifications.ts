import type { ApiClient } from "@/lib/api-client";
import type { ValidationError } from "@/lib/errors";

import z from "zod";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { useClient } from "@/hooks/use-client";
import { notificationKeys } from "./query-key-factory";

export const readNotificationInput = z.object({
  readIds: z.array(z.uuidv7({ error: "Invalid ID" })),
});

export type ReadNotificationInput = z.infer<typeof readNotificationInput>;

export const readNotifications =
  (client: ApiClient) => async (data: ReadNotificationInput) =>
    client.callApi("notifications/read", {
      data: data,
      method: "POST",
      isAuth: true,
    });

type UseReadNotificationsOption = UseMutationOptions<
  Response,
  ValidationError,
  ReadNotificationInput
>;

export const useReadNotifications = (
  username: string,
  options?: UseReadNotificationsOption
) => {
  const queryClient = useQueryClient();
  const client = useClient();
  const { onSuccess, onError, ...restConfig } = options || {};

  return useMutation({
    ...restConfig,
    mutationKey: notificationKeys.mutation.read,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(username),
      });
      onSuccess?.(data, variables, context);
    },
    onError: (...args) => {
      onError?.(...args);
    },
    mutationFn: (data) => readNotifications(client)(data),
  });
};
