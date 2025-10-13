import type { User } from "@/types/user.types";

export const userPolicy = {
  update: (user: User, targetUser: User) => user.id === targetUser.id,
  delete: (user: User, targetUser: User) => user.id === targetUser.id,
} as const;
