export const userKeys = {
  all: ["users"] as const,
  infinite: (by: string) => ["infinite-users", { by }] as const,
  list: (by: string) => [...userKeys.all, "list", { by }] as const,
  detail: (username: string) => [...userKeys.all, "detail", username] as const,
};
