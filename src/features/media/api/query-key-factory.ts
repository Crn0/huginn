export const mediaKeys = {
  all: ["infinite-media"] as const,
  lists: () => [...mediaKeys.all, "list"] as const,
  list: (username: string) => [...mediaKeys.lists(), username] as const,
};
