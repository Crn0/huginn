import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { env } from "@/configs/env";
import { notificationSocket } from "@/lib/socket/notification";

import { debug, debugError } from "@/lib/logger";

export const useNotificationSocket = (userId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (env.NODE_ENV === "test" || !userId) return;

    if (!notificationSocket.connected) {
      notificationSocket.connect();
    }

    const onConnect = () => {
      debug(`user connecting to room ${userId}`);
    };

    const onNotification = ({
      entity,
    }: {
      entity: ["notifications", "list", string];
    }) => {
      queryClient.invalidateQueries({ queryKey: entity });
    };

    const onConnectError = (e: unknown) => {
      debugError(e);
    };

    notificationSocket.on("connect", onConnect);

    notificationSocket.on("notification", onNotification);
    notificationSocket.on("connect_error", onConnectError);

    return () => {
      notificationSocket.off("notification");
      notificationSocket.off("connect_error", onConnectError);
    };
  }, [userId, queryClient]);

  return notificationSocket;
};
