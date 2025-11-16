import { userPolicy as user } from "./user";
import { tweetPolicy as tweet } from "./tweet";

export const POLICIES = {
  user,
  tweet,
} as const;
