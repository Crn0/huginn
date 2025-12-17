import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginInputSchema,
  useLogin,
  type LoginInput,
  type UseLoginOptions,
} from "@/lib/auth";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { handleServerError } from "@/lib/handle-form-server-error";
import { Label } from "@/components/ui/label";
import { CircleX } from "lucide-react";
import { Link } from "@/components/ui/link";

export interface LoginFormProps {
  onSuccess: UseLoginOptions["onSuccess"];
  close: () => void;
}

export function LoginForm({ onSuccess, close }: LoginFormProps) {
  const form = useForm({
    resolver: zodResolver(loginInputSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const login = useLogin({
    onSuccess,
    onError: (e) =>
      handleServerError<LoginInput>(e, form.setError, [
        { path: "email", showMessage: false },
        { path: "password", showMessage: true },
      ]),
  });

  const onSubmit = (data: LoginInput) => login.mutate(data);

  return (
    <Card className='[&_input]:selection:bg-input-background w-full bg-black text-white sm:max-w-md'>
      <CardHeader>
        <CardTitle>
          <h1>Sign in to Huginn</h1>
        </CardTitle>

        <CardDescription>
          Enter your email below to sign in to your account
        </CardDescription>

        <CardAction>
          <Button
            className='bg-black hover:bg-white/25'
            variant='secondary'
            size='icon-sm'
            onClick={close}
          >
            <span className='sr-only'>Close</span>
            <CircleX color='white' />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <form
          id='form-account-login'
          role='form'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name='email'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label className='sr-only' htmlFor='form-email'>
                    Email
                  </Label>

                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id='form-email'
                      placeholder='Email'
                      aria-invalid={fieldState.invalid}
                    />
                    {!field.value?.length ? null : (
                      <InputGroupAddon align='block-start'>
                        <InputGroupText className='font-sans'>
                          Email
                        </InputGroupText>
                      </InputGroupAddon>
                    )}
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name='password'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label className='sr-only' htmlFor='form-password'>
                    Password
                  </Label>

                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id='form-password'
                      type='password'
                      placeholder='Password'
                      aria-invalid={fieldState.invalid}
                    />
                    {!field.value?.length ? null : (
                      <InputGroupAddon
                        align='block-start'
                        className='flex justify-between'
                      >
                        <InputGroupText className='font-sans'>
                          Password
                        </InputGroupText>
                      </InputGroupAddon>
                    )}
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter>
        <FieldGroup>
          <Field orientation='responsive'>
            <Button
              type='submit'
              variant='secondary'
              form='form-account-login'
              disabled={login.isPending}
            >
              {login.isPending ? <Spinner /> : <span>Submit</span>}
            </Button>

            <Button
              type='button'
              variant='secondary'
              disabled={login.isPending}
              asChild
            >
              <Link to='/forgot-password'>Forgot password ?</Link>
            </Button>
          </Field>

          <Field orientation='horizontal'>
            <span>Don't have an account?</span>
            <CardAction>
              <Link to='/signup'>Sign up</Link>
            </CardAction>
          </Field>
        </FieldGroup>
      </CardFooter>
    </Card>
  );
}
