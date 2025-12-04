export const tweetKeys = {
  all: ["tweets"] as const,
  detail: (id: string) => [...tweetKeys.all, "detail", id] as const,

  mutation: {
    create: ["add-tweets"] as const,
    reply: ["reply-tweets"] as const,
    delete: ["delete-tweets"] as const,
    update: ["update-tweets"] as const,
    like: ["like-tweets"] as const,
    repost: ["repost-tweets"] as const,
  },

  infinite: {
    all: ["infinite-tweets"] as const,
    lists: () => [...tweetKeys.infinite.all, "list"] as const,
    list: (scope: string, search: string) =>
      [...tweetKeys.infinite.lists(), { scope, search }] as const,
    reply: () => [...tweetKeys.infinite.all, "replies"] as const,
    replies: (id: string) => [...tweetKeys.infinite.reply(), id] as const,
    listByUser: (username: string, scope: string) =>
      [...tweetKeys.infinite.lists(), username, { scope }] as const,
  } as const,
};
