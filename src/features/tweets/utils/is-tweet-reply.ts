import type { TweetReply } from "@/types/api";

export const isTweetReply = (tweet: unknown): tweet is TweetReply => {

    return typeof( tweet as TweetReply).replies?.length === "number"
} 