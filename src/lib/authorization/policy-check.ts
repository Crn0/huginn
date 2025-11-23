import { POLICIES } from "../policy";

import type { AuthUser } from "../auth/auth-user";
import type { User } from "@/types/api";
import type { Policy, PolicyCheckMap } from "../policy/policy.types";

export const policyCheck = <Resource extends keyof Policy>(
  user: AuthUser | User,
  resource: Resource,
  action: Policy[Resource]["action"],
  data: Policy[Resource]["dataType"]
) => {
  const policy = (POLICIES as PolicyCheckMap)[resource]?.[action];

  if (typeof policy === "boolean") return policy;

  if (typeof policy === "function") return policy(user, data);

  throw new Error(
    `Invalid resource-action pair: ${String(resource)}.${String(action)}`
  );
};
