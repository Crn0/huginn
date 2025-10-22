import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { useDisclosure } from "@/hooks/use-disclosure";
import { AuthCard } from "./auth-card";
import { Link } from "@/components/ui/link";
import { CardAction, CardDescription } from "@/components/ui/card";
import { SignupForm } from "./signup-form";

export function SignupCard() {
  const navigate = useNavigate();
  const { isOpen, open, close } = useDisclosure(false);

  const onSuccess = () => navigate({ to: "/login", replace: true });

  return !isOpen ? (
    <AuthCard
      title='Join Huginn today'
      content={
        <div className='grid gap-2'>
          <Button variant='secondary' className='w-full' onClick={open}>
            Create Account
          </Button>
          <CardDescription>
            By signing up, you agree to the{" "}
            <span className='text-blue-500'>Terms of Service</span> and{" "}
            <span className='text-blue-500'>Privacy Policy</span>, including{" "}
            <span className='text-blue-500'>Cookie Use</span>.
          </CardDescription>
        </div>
      }
      footer={
        <>
          <span>Have an account already?</span>
          <CardAction>
            <Link to='/login' preload={false}>
              Log in
            </Link>
          </CardAction>
        </>
      }
    ></AuthCard>
  ) : (
    <SignupForm onSuccess={onSuccess} close={close} />
  );
}
