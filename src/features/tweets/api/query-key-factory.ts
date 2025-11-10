export const tweetKeys = {
  all: ["tweets"] as const,
  detail: (id: string) => [...tweetKeys.all, "detail", id] as const,

  infinite: {
    all: ["infinite-tweets"] as const,
    list: () => [...tweetKeys.infinite.all, "list"] as const,
    replies: (id: string) =>
      [...tweetKeys.infinite.all, id, "replies"] as const,
    listByUser: (username: string) =>
      [...tweetKeys.infinite.list(), username] as const,
    repliesByUser: (username: string) =>
      [...tweetKeys.infinite.listByUser(username), "replies"] as const,
  } as const,
};
