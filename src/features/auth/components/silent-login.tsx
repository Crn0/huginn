import { useEffect } from "react";
import { useLocation, useNavigate, useSearch } from "@tanstack/react-router";

import { useAuthActions } from "@/hooks/use-auth-store";

import { LogoSplash } from "@/components/ui/logo-splash";

export function SilentLogin({
  children,
  token,
}: {
  children: React.ReactNode;
  token: string | null;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const search = useSearch({ from: "__root__" });

  const redirectTo = search.redirectTo ?? "/home";
  const login = useAuthActions().login;
  const setIsSilentLogin = useAuthActions().setIsSilentLogin;

  useEffect(() => {
    if (token) {
      login(token);

      navigate({ to: redirectTo, replace: true });
    } else {
      setIsSilentLogin();

      navigate({
        to: ["/login", "/signup", "/forgot-password"].includes(
          location.pathname
        )
          ? location.pathname
          : "/login",
        replace: true,
      });
    }
  }, [token, login, navigate, redirectTo, setIsSilentLogin, location.pathname]);

  if (token) return <LogoSplash />;

  return children;
}
