import type { User } from "@/types/user.types";

export type Action = "view" | "create" | "update" | "delete";

export type PolicyAction<Resource extends keyof Policy> =
  | boolean
  | ((user: User, data: Policy[Resource]["dataType"]) => boolean);

export type PolicyCheckMap = {
  [Resource in keyof Policy]: {
    [Action in Policy[Resource]["action"]]: PolicyAction<Resource>;
  };
};

export interface Policy {
  user: {
    dataType: User;
    action: "view" | "update" | "delete";
  };
}
