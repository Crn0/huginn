import type { AuthStoreState } from "./auth.types";

import { useState } from "react";
import { createStore } from "zustand";
import { devtools } from "zustand/middleware";

import { AuthStoreContext } from "./auth-context";

export interface AuthStoreProviderProps {
  children: React.ReactNode;
}

export const AuthStoreProvider = ({ children }: AuthStoreProviderProps) => {
  const [store] = useState(() =>
    createStore(
      devtools<AuthStoreState>((set) => ({
        token: null,
        isAuthenticated: false,
        actions: {
          login: (token) => set(() => ({ token, isAuthenticated: !!token })),
          logout: () => set(() => ({ token: null, isAuthenticated: false })),
        },
      }))
    )
  );

  return (
    <AuthStoreContext.Provider value={store}>
      {children}
    </AuthStoreContext.Provider>
  );
};
