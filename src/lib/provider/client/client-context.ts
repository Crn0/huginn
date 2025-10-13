import type { ClientProviderState } from "./client.types";

import { createContext } from "react";

export const ClientContext = createContext<ClientProviderState | null>(null);
