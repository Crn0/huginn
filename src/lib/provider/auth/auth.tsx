import { useState } from "react";

import { AuthStoreContext } from "./auth-context";
import { authStore } from "./store";

export interface AuthStoreProviderProps {
  children: React.ReactNode;
}

export const AuthStoreProvider = ({ children }: AuthStoreProviderProps) => {
  const [store] = useState(() => authStore);

  return (
    <AuthStoreContext.Provider value={store}>
      {children}
    </AuthStoreContext.Provider>
  );
};
