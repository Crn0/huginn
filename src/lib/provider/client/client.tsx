import { useState } from "react";

import { env } from "@/configs/env";
import { ClientContext } from "./client-context";
import { refreshToken } from "@/lib/auth";
import { ApiClient } from "@/lib/api-client";
import { useAuthActions, useAuthToken } from "@/hooks/use-auth-store";

export interface ClientStoreProviderProps {
  children: React.ReactNode;
}

const BASE_URL = `${env.SERVER_URL}/api/v1` as const;

export const ClientProvider = ({ children }: ClientStoreProviderProps) => {
  const setToken = useAuthActions().login;
  const getToken = useAuthToken;

  const [client] = useState(
    () => new ApiClient(BASE_URL, { getToken, setToken, refreshToken })
  );

  return (
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
  );
};
