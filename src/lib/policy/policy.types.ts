import type { AuthUser } from "../auth";
import type { User, Tweet } from "@/types/api";

export type Action = "view" | "create" | "update" | "follow" | "delete";

export type PolicyAction<Resource extends keyof Policy> =
  | boolean
  | ((user: AuthUser, data: Policy[Resource]["dataType"]) => boolean);

export type PolicyCheckMap = {
  [Resource in keyof Policy]: {
    [Action in Policy[Resource]["action"]]: PolicyAction<Resource>;
  };
};

export interface Policy {
  user: {
    dataType: User;
    action: "view" | "update" | "follow" | "delete";
  };
  tweet: {
    dataType: Tweet;
    action: "view" | "update" | "delete";
  };
  like: {
    dataType: User;
    action: "view";
  };
}
