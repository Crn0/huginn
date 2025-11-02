import type { ApiClient } from "@/lib/api-client";

import z from "zod";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { userKeys } from "./query-key-factory";
import { useClient } from "@/hooks/use-client";
import { authUserSchema } from "@/lib/auth";

export const getUser = (client: ApiClient) => async (username: string) => {
  const res = await client.callApi(`users/${username}`, {
    method: "GET",
    isAuth: true,
  });

  return res.json();
};

const userProfileSchema = authUserSchema.shape.profile.omit({
  birthday: true,
});

const userSchema = authUserSchema
  .omit({
    email: true,
    profile: true,
    accountLevel: true,
    openIds: true,
  })
  .extend({ profile: userProfileSchema });

export type User = z.infer<typeof userSchema>;

export const userQueryOption = (client: ApiClient) => (username: string) =>
  queryOptions({
    queryKey: userKeys.detail(username),
    queryFn: async () => {
      const user = await getUser(client)(username);

      return userSchema.parse(user);
    },
  });

export const useUser = (username: string, enabled = true) => {
  const client = useClient();

  return useQuery({
    enabled,
    queryKey: userKeys.detail(username),
    queryFn: async () => {
      const user = await getUser(client)(username);

      return userSchema.parse(user);
    },
  });
};
