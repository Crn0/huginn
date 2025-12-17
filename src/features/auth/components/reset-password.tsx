import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  resetPasswordInput,
  useResetPassword,
  type ResetPasswordInput,
  type UseResetPasswordOption,
} from "../api/reset-password";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { handleServerError } from "@/lib/handle-form-server-error";

export interface ResetPasswordProps {
  token: string;
  onSuccess?: UseResetPasswordOption["onSuccess"];
}

export function ResetPassword({ token, onSuccess }: ResetPasswordProps) {
  const form = useForm({
    resolver: zodResolver(resetPasswordInput),
    defaultValues: {
      token,
      confirmPassword: "",
      password: "",
    },
  });

  const passwordMutation = useResetPassword({
    onSuccess,
    onError: (e) => handleServerError<ResetPasswordInput>(e, form.setError),
  });

  const onSubmit = (data: ResetPasswordInput) => {
    passwordMutation.mutate(data);
  };

  const password = form.watch("password") ?? "";

  return (
    <Card className='[&_input]:selection:bg-input-background w-full bg-black text-white sm:max-w-md'>
      <CardContent>
        <form
          id='form-update-username'
          role='form'
          className='grid gap-5'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name='password'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className='sr-only' htmlFor='form-password'>
                    Password
                  </FieldLabel>
                  <InputGroup className='border-border'>
                    <InputGroupInput
                      {...field}
                      id='form-password'
                      type='password'
                      placeholder='Password'
                      aria-invalid={fieldState.invalid}
                      aria-disabled={
                        field.value?.length === MAX_PASSWORD_LENGTH
                      }
                    />
                    {!field.value?.length ? null : (
                      <InputGroupAddon
                        align='block-start'
                        className='flex justify-between'
                      >
                        <InputGroupText className='font-sans'>
                          Password
                        </InputGroupText>
                        <InputGroupText className='tabular-nums'>
                          {field.value.length}/{MAX_PASSWORD_LENGTH}
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

          <FieldGroup>
            <Controller
              name='confirmPassword'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    className='sr-only'
                    htmlFor='form-confirm-password'
                  >
                    Confirm Password
                  </FieldLabel>
                  <InputGroup className='border-border'>
                    <InputGroupInput
                      {...field}
                      id='form-confirm-password'
                      type='password'
                      placeholder='Confirm Password'
                      aria-invalid={fieldState.invalid}
                      aria-disabled={
                        field.value?.length === MAX_PASSWORD_LENGTH
                      }
                    />
                    {!field.value?.length ? null : (
                      <InputGroupAddon
                        align='block-start'
                        className='flex justify-between'
                      >
                        <InputGroupText className='font-sans'>
                          Confirm Password
                        </InputGroupText>
                        <InputGroupText className='tabular-nums'>
                          {field.value.length}/{MAX_PASSWORD_LENGTH}
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

        <CardAction className='mt-5'>
          <Button
            type='submit'
            variant='secondary'
            form='form-update-username'
            className='text-foreground hover:text-foreground bg-blue-400 hover:bg-blue-400'
            disabled={
              passwordMutation.isPending ||
              password.length < MIN_PASSWORD_LENGTH
            }
          >
            {passwordMutation.isPending ? <Spinner /> : <span>Save</span>}
          </Button>
        </CardAction>
      </CardContent>
    </Card>
  );
}
