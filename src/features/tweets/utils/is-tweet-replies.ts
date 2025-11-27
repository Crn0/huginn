import type { TweetReply } from "@/types/api";

export const isTweetReplies = (tweet: unknown): tweet is TweetReply["replies"][0] => Object.prototype.hasOwnProperty.call((tweet as TweetReply["replies"][0]).replyTo, "content") === false