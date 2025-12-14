/* eslint-disable @typescript-eslint/no-unused-vars */
import type { User } from "@/types/api";
import type { AuthUser } from "../auth";

export const userPolicy = {
  update: (user: AuthUser | User, targetUser: User) =>
    user.id === targetUser.id,
  updatePassword: (user: AuthUser, _: User) => user.accountLevel !== "DEMO",
  delete: (user: AuthUser, _: User) => user.accountLevel !== "DEMO",
  follow: (user: AuthUser | User, targetUser: User) =>
    user.id !== targetUser.id,
} as const;
