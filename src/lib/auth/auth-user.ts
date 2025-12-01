import z from "zod";
import { queryOptions, useQuery } from "@tanstack/react-query";

import { queryConfig } from "@/lib/react-query";
import { type ApiClient } from "@/lib/api-client";
import { errorHandler } from "@/lib/errors/error-handler";
import { ValidationError } from "../errors";
import type { ErrorType } from "../errors/errors.type";
import { useClient } from "@/hooks/use-client";

export const authUserSchema = z.object({
  id: z.uuidv7(),
  email: z.email().trim(),
  username: z.string(),
  profile: z.object({
    displayName: z.string(),
    bio: z.string().nullable(),
    location: z.string().nullable(),
    website: z.url().nullable(),
    birthday: z.coerce.date().nullable(),

    avatarUrl: z.url().nullable(),
    bannerUrl: z.url().nullable(),
  }),

  _count: z.object({
    followedBy: z.coerce.number().default(0),
    following: z.coerce.number().default(0),
    tweets: z.coerce.number().default(0),
  }),

  createdAt: z.coerce.date().transform((d) => d.toISOString()),
  accountLevel: z.enum(["DEMO", "USER", "ADMIN"]),

  openIds: z.array(
    z.object({
      name: z.enum(["GOOGLE"]),
    })
  ),
});

export type AuthUser = z.infer<typeof authUserSchema>;

export const getAuthUser = (client?: ApiClient) => async () => {
  if (!client) {
    throw new Error("ApiClient is required");
  }

  const res = await client.callApi("users/me", {
    isAuth: true,
    method: "GET",
  });

  const data = await res.clone().json();

  const parsedUser = authUserSchema.safeParse(data);

  if (!parsedUser.success) {
    const parsedError = parsedUser.error;

    const message = `Validation failed: ${parsedError.issues.length} errors detected in user data`;
    const zodError = new ValidationError(message, parsedError.issues);

    throw errorHandler(zodError);
  }

  return parsedUser.data;
};

export const authUserQueryOptions = (client?: ApiClient) =>
  queryOptions<AuthUser, ErrorType>({
    ...queryConfig,
    queryKey: ["authenticated-user"],
    queryFn: getAuthUser(client),
  });

export const useAuthUser = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const client = useClient();

  return useQuery({
    ...authUserQueryOptions(client),
    enabled,
  });
};
