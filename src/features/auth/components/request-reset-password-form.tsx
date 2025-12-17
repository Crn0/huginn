import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  requestInputSchema,
  useRequestResetPassword,
  type RequestInputSchema,
  type UseRequestResetPasswordOptions,
} from "../api/request-reset-password";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export interface RequestResetPasswordFormProps {
  onSuccess: UseRequestResetPasswordOptions["onSuccess"];
}

export function RequestResetPasswordForm({
  onSuccess,
}: RequestResetPasswordFormProps) {
  const form = useForm({
    resolver: zodResolver(requestInputSchema),
    defaultValues: {
      email: "",
    },
  });

  const reset = useRequestResetPassword({
    onSuccess,
    onError: (e) => {
      form.setError("email", { message: e.message });
    },
  });

  const onSubmit = (data: RequestInputSchema) => reset.mutate(data);

  return (
    <Card className='[&_input]:selection:bg-input-background w-full bg-black text-white sm:max-w-md'>
      <CardHeader>
        <CardTitle>
          <h1>Reset your password</h1>
        </CardTitle>

        <CardDescription>
          To reset your password, enter your email below and submit. An email
          will be sent to you with instructions about how to complete the
          process.
        </CardDescription>
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
              disabled={reset.isPending}
            >
              {reset.isPending ? <Spinner /> : <span>Submit</span>}
            </Button>
          </Field>
        </FieldGroup>
      </CardFooter>
    </Card>
  );
}
