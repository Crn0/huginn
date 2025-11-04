import type { AuthStoreState } from "@/lib/provider";

import { useContext } from "react";
import { useStore } from "zustand";

import { AuthStoreContext } from "@/lib/provider";

export const useAuthStore = <T>(selector: (state: AuthStoreState) => T): T => {
  const store = useContext(AuthStoreContext);

  if (!store) {
    throw new Error("useAuthStore must be used within a AuthStoreProvider");
  }
  return useStore(store, selector);
};

export const useAuthActions = () => useAuthStore((state) => state.actions);

export const useAuthToken = () => useAuthStore((state) => state.token);

export const useIsAuthenticatedToken = () =>
  useAuthStore((state) => state.isAuthenticated);

export const useIsSilentLogin = () =>
  useAuthStore((state) => state.isSilentLogin);
