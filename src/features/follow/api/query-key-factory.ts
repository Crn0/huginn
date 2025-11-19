export const followKeys = {
  all: ["follow"] as const,

  mutation: ["follow-user"] as const,

  lists: () => [...followKeys.all, "list"] as const,
  list: (username: string, scope: "following" | "followers") =>
    [...followKeys.lists(), username, { scope }] as const,
};
