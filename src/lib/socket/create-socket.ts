import { io, type SocketOptions, type ManagerOptions } from "socket.io-client";

import { env } from "@/configs/env";

export function createSocket(
  namespace: string,
  options: Partial<ManagerOptions & SocketOptions> = {}
) {
  const serverUrl = env.SERVER_URL.replace(/\/$/, "");
  const formattedNamespace = namespace.startsWith("/")
    ? namespace
    : `/${namespace}`;

  return io(`${serverUrl}${formattedNamespace}`, {
    autoConnect: false,
    ...options,
  });
}
