import type { AuthUser } from "../auth";
import type { Tweet, User } from "@/types/api";

export const tweetPolicy = {
  update: (user: AuthUser | User, tweet: Tweet) => user.id === tweet?.author.id,
  delete: (user: AuthUser | User, tweet: Tweet) => user.id === tweet?.author.id,
} as const;
