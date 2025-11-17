import type { User } from "@/types/api";
import type { AuthUser } from "../auth";

export const userPolicy = {
  update: (user: AuthUser, targetUser: User) => user.id === targetUser.id,
  delete: (user: AuthUser, targetUser: User) => user.id === targetUser.id,
} as const;
