import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { env } from "@/configs/env";

import { debug, debugError } from "@/lib/logger";
import { tweetSocket } from "@/lib/socket/tweet";

export const useTweetSocket = (userId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (env.NODE_ENV === "test" || !userId) return;

    if (!tweetSocket.connected) {
      tweetSocket.connect();
    }

    const onConnect = () => {
      debug(`user connecting to tweet room ${userId}`);
    };

    const onNotification = ({
      entity,
    }: {
      entity: ["infinite-tweets", "list"];
    }) => {
      queryClient.invalidateQueries({ queryKey: entity });
    };

    const onConnectError = (e: unknown) => {
      debugError(e);
    };

    tweetSocket.on("connect", onConnect);

    tweetSocket.on("tweet", onNotification);
    tweetSocket.on("connect_error", onConnectError);

    return () => {
      tweetSocket.off("tweet");
      tweetSocket.off("connect_error", onConnectError);
    };
  }, [userId, queryClient]);

  return tweetSocket;
};
