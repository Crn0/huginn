export interface AuthStoreState {
  token: string | null;
  isAuthenticated: boolean;
  actions: {
    login: (token: string | null) => void;
    logout: () => void;
  };
}
