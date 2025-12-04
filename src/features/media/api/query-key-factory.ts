export const mediaKeys = {
  all: ["infinite-media"] as const,
  lists: () => [...mediaKeys.all, "list"] as const,
  list: (search: string) => [...mediaKeys.lists(), { search }] as const,
  listByUser: (username: string) =>
    [...mediaKeys.lists(), { username }] as const,
};
