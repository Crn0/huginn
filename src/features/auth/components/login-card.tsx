import { useNavigate, useSearch } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { useDisclosure } from "@/hooks/use-disclosure";
import { AuthCard } from "./auth-card";
import { Link } from "@/components/ui/link";
import { CardAction } from "@/components/ui/card";
import { LoginForm } from "./login-form";
import { useAuthActions } from "@/hooks/use-auth-store";

export function LoginCard() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_auth/login" });
  const setToken = useAuthActions().login;
  const { isOpen, open, close } = useDisclosure(false);

  const redirectTo = search.redirectTo ?? "/home";

  const onSuccess = ({ token }: { token: string }) => {
    setToken(token);

    navigate({ to: redirectTo, replace: true });
  };

  return !isOpen ? (
    <AuthCard
      title='Sign in to Huginn'
      content={
        <div className='grid gap-2'>
          <Button variant='secondary' className='w-full' onClick={open}>
            Continue with Huginn
          </Button>
        </div>
      }
      footer={
        <>
          <span>Don't have an account?</span>
          <CardAction>
            <Link to='/signup' preload={false}>
              Sign up
            </Link>
          </CardAction>
        </>
      }
    ></AuthCard>
  ) : (
    <LoginForm onSuccess={onSuccess} close={close} />
  );
}
