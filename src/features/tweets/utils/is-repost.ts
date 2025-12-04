import type { Repost } from "@/types/api";

export const isRepost = (tweet: unknown): tweet is Repost  => {
  return (tweet as Repost).isRepost;
};
