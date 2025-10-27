import type { AuthStoreState } from "./auth.types";

import { createStore } from "zustand";
import { devtools } from "zustand/middleware";

export const authStore = createStore(
  devtools<AuthStoreState>((set) => ({
    token: null,
    isAuthenticated: false,
    actions: {
      login: (token) => set(() => ({ token, isAuthenticated: !!token })),
      logout: () => set(() => ({ token: null, isAuthenticated: false })),
    },
  }))
);

export const getToken = () => authStore.getState().token;

export const getIsAuthenticated = () => authStore.getState().isAuthenticated;

export const setToken = authStore.getState().actions.login;
