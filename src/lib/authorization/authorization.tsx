import { policyCheck } from "./policy-check";

import type { User } from "@/types/user.types";
import type { PropsWithChildren, ReactNode } from "react";
import type { Policy } from "../policy/policy.types";

export interface AuthorizationProps<Resource extends keyof Policy>
  extends PropsWithChildren {
  user: User;
  resource: Resource;
  action: Policy[Resource]["action"];
  data: Policy[Resource]["dataType"];
  forbiddenFallback?: ReactNode;
}

export function Authorization<Resource extends keyof Policy>({
  user,
  resource,
  action,
  data,
  children,
  forbiddenFallback = null,
}: AuthorizationProps<Resource>) {
  const canAccess = policyCheck(user, resource, action, data);

  return canAccess ? children : forbiddenFallback;
}
