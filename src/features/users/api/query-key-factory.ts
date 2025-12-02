export const userKeys = {
  all: ["users"] as const,
  infinite: {
    all: ["infinite-users"] as const,
    list: () => [...userKeys.infinite.all, "list"] as const,
    lists: (by: string) => [...userKeys.infinite.list(), { by }] as const,
  },
  list: () => [...userKeys.all, "list"] as const,
  lists: (by: string) => [...userKeys.list(), { by }] as const,
  detail: (username: string) => [...userKeys.all, "detail", username] as const,
};
