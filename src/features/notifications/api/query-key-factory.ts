export const notificationKeys = {
  all: ["notifications"] as const,
  detail: (id: string) => [...notificationKeys.all, "detail", id] as const,

  mutation: {
    read: ["read-notifications"] as const,
  },

  lists: () => [...notificationKeys.all, "list"] as const,
  list: (username: string) => [...notificationKeys.lists(), username] as const,
};
