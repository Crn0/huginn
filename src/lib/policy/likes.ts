import type { User } from "@/types/api";
import type { AuthUser } from "../auth";

export const likePolicy = {
  view: (user: AuthUser, targetUser: User) => user.id === targetUser.id,
} as const;
