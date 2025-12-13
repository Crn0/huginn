import type { Socket } from "socket.io-client";

import { getToken } from "@/lib/provider/auth/store";

import { createSocket } from "./create-socket";

interface ServerToClientEvents {
  notification: ({
    entity,
    id,
  }: {
    entity: ["notifications", "list", string];
    id: string;
  }) => void;
}

export const namespace = "/notifications" as const;

export const notificationSocket = createSocket(namespace, {
  auth: (cb) =>
    cb({
      accessToken: getToken(),
    }),
}) as Socket<ServerToClientEvents>;
