import type { Socket } from "socket.io-client";

import { getToken } from "@/lib/provider/auth/store";

import { createSocket } from "./create-socket";

type BaseTweetEvent<Type extends string> = {
  type: Type;
  entity: ["infinite-tweets", "list"];
  id: string;
};

type TweetEvent = BaseTweetEvent<"create"> | BaseTweetEvent<"delete">;

interface ServerToClientEvents {
  tweet: (e: TweetEvent) => void;
}

export const namespace = "/tweets" as const;

export const tweetSocket = createSocket(namespace, {
  auth: (cb) =>
    cb({
      accessToken: getToken(),
    }),
}) as Socket<ServerToClientEvents>;
