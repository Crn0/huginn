import { useContext } from "react";

import { ClientContext } from "@/lib/provider";

export const useClient = () => {
  const client = useContext(ClientContext);

  if (!client) {
    throw new Error("useClient must be used within a ClientProviderState");
  }
  return client;
};
