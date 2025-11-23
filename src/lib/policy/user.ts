import type { User } from "@/types/api";
import type { AuthUser } from "../auth";

export const userPolicy = {
  update: (user: AuthUser | User, targetUser: User) => user.id === targetUser.id,
  delete: (user: AuthUser | User, targetUser: User) => user.id === targetUser.id,
  follow: (user: AuthUser | User, targetUser: User) => user.id !== targetUser.id,
} as const;
