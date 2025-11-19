import { userPolicy as user } from "./user";
import { tweetPolicy as tweet } from "./tweet";
import { likePolicy as like } from "./likes";

export const POLICIES = {
  user,
  tweet,
  like,
} as const;
