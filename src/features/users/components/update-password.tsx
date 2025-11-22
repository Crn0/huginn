import type { AuthUser } from "@/lib/auth";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  updatePasswordInput,
  useUpdatePassword,
  type UpdatePasswordInput,
  type UseUpdatePasswordOption,
} from "../api/update-password";
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

export interface UpdatePasswordProps {
  user: AuthUser;
  onSuccess?: UseUpdatePasswordOption["onSuccess"];
}

export function UpdatePassword({ user, onSuccess }: UpdatePasswordProps) {
  const form = useForm({
    resolver: zodResolver(updatePasswordInput),
    defaultValues: {
      oldPassword: "",
      confirmPassword: "",
      password: "",
    },
  });

  const passwordMutation = useUpdatePassword(user, {
    onSuccess,
    onError: (e) => {
      if (e.kind === "AUTHENTICATION_ERROR") {
        if (e.message === "Incorrect old password.") {
          form.setError("oldPassword", { message: e.message });
        }
      }
    },
  });

  const onSubmit = (data: UpdatePasswordInput) => {
    passwordMutation.mutate(data);
  };

  const password = form.watch("password") ?? "";

  return (
    <Card className='[&_input]:selection:bg-input-background bg-background text-foreground border-none'>
      <CardContent>
        <form
          id='form-update-username'
          role='form'
          className='grid gap-5'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name='oldPassword'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className='sr-only' htmlFor='form-old-password'>
                    Current Password
                  </FieldLabel>
                  <InputGroup className='border-border'>
                    <InputGroupInput
                      {...field}
                      id='form-old-password'
                      type='password'
                      placeholder='Current Password'
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
                          Current Password
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

          <Card className='bg-inherit text-inherit'>
            <CardContent className='grid gap-5'>
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
            </CardContent>
          </Card>
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
