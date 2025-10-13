import type { StoreApi } from "zustand";
import type { AuthStoreState } from "./auth.types";

import { createContext } from "react";

export const AuthStoreContext = createContext<StoreApi<AuthStoreState> | null>(
  null
);
