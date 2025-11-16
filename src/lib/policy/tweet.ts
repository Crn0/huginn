import type { AuthUser } from "../auth";
import type { Tweet } from "@/types/api";

export const tweetPolicy = {
  update: (user: AuthUser, tweet: Tweet) => user.id === tweet?.author.id,
  delete: (user: AuthUser, tweet: Tweet) => user.id === tweet?.author.id,
} as const;
