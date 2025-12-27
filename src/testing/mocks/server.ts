import { setupServer } from "msw/node";

import { authHandlers } from "./handlers/auth";
import { userMeHandlers } from "./handlers/user-me";
import { tweetHandlers } from "./handlers/tweet";

const handlers = [
  ...authHandlers,
  ...userMeHandlers,
  ...tweetHandlers,
] as const;

export const server = setupServer(...handlers);
