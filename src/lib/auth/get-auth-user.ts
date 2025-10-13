import z from "zod";
import { queryOptions, useQuery } from "@tanstack/react-query";

import { queryConfig } from "@/lib/react-query";
import { type ApiClient } from "@/lib/api-client";
import { errorHandler } from "@/lib/errors/error-handler";
import { ValidationError } from "../errors";
import type { ErrorType } from "../errors/errors.type";
import { useClient } from "@/hooks/use-client";

export const authUserSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  email: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().nullable(),
});

export type AuthUser = z.infer<typeof authUserSchema>;

export const getUser = (client?: ApiClient) => async () => {
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

export const getAuthUserQueryOptions = (client?: ApiClient) =>
  queryOptions<AuthUser, ErrorType>({
    ...queryConfig,
    queryKey: ["authenticated-user"],
    queryFn: getUser(client),
  });

export const useGetAuthUser = ({
  enabled = true,
}: { enabled?: boolean } = {}) => {
  const client = useClient();

  return useQuery({
    ...getAuthUserQueryOptions(client),
    enabled,
  });
};
