export interface AuthStoreState {
  token: string | null;
  isAuthenticated: boolean;
  isSilentLogin: boolean;
  actions: {
    login: (token: string | null) => void;
    logout: () => void;
    setIsSilentLogin: () => void;
  };
}
