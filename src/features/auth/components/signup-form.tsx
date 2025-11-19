import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DISPLAY_NAME_LENGTH,
  PASSWORD_MAX_LENGTH,
  registerInputSchema,
  useRegister,
  type RegisterInput,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircleX, ShieldQuestionMark } from "lucide-react";
import { BirthdatePicker } from "@/components/ui/birthday-picker";
import { Spinner } from "@/components/ui/spinner";
import { handleServerError } from "@/lib/handle-form-server-error";
import { Label } from "@/components/ui/label";

export interface SignupFormProps {
  onSuccess: (...args: unknown[]) => void;
  close: () => void;
}

export function SignupForm({ onSuccess, close }: SignupFormProps) {
  const form = useForm({
    resolver: zodResolver(registerInputSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      birthday: "",
    },
  });

  const register = useRegister({
    onSuccess,
    onError: (e) => handleServerError<RegisterInput>(e, form.setError),
  });

  const onSubmit = (data: RegisterInput) => register.mutate(data);

  return (
    <Card className='[&_input]:selection:bg-input-background w-full bg-black text-white sm:max-w-md'>
      <CardHeader>
        <CardTitle>
          <h1>Create your account</h1>
        </CardTitle>

        <CardDescription>
          Enter your information below to create your account
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
          id='form-account-register'
          role='form'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name='displayName'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label className='sr-only' htmlFor='form-display-name'>
                    Display Name
                  </Label>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id='form-display-name'
                      placeholder='Name'
                      onChange={(e) => {
                        if (
                          e.currentTarget.value.length <= DISPLAY_NAME_LENGTH
                        ) {
                          field.onChange(e);
                        }
                      }}
                      aria-invalid={fieldState.invalid}
                      aria-disabled={
                        field.value?.length === DISPLAY_NAME_LENGTH
                      }
                    />
                    {!field.value?.length ? null : (
                      <InputGroupAddon
                        align='block-start'
                        className='flex justify-between'
                      >
                        <InputGroupText className='font-sans'>
                          Name
                        </InputGroupText>
                        <InputGroupText className='tabular-nums'>
                          {field.value.length}/{DISPLAY_NAME_LENGTH}
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
                      onChange={(e) => {
                        if (
                          e.currentTarget.value.length <= PASSWORD_MAX_LENGTH
                        ) {
                          field.onChange(e);
                        }
                      }}
                      aria-invalid={fieldState.invalid}
                      aria-disabled={
                        field.value?.length === PASSWORD_MAX_LENGTH
                      }
                    />
                    {field.value?.length ? (
                      <InputGroupAddon
                        align='block-start'
                        className='flex justify-between'
                      >
                        <InputGroupText className='font-sans'>
                          Password
                        </InputGroupText>

                        <InputGroupText className='tabular-nums'>
                          {field.value.length}/{PASSWORD_MAX_LENGTH}
                        </InputGroupText>
                      </InputGroupAddon>
                    ) : (
                      <Tooltip supportMobileTap>
                        <TooltipTrigger asChild>
                          <span>
                            <ShieldQuestionMark />
                            <span className='sr-only'>
                              Password requirements
                            </span>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span>
                            Password must be at least 8 characters long and at
                            most 64 characters
                          </span>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name='birthday'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <BirthdatePicker {...field} />
                  <InputGroupText>
                    This will not be shown publicly. Confirm your own age, even
                    if this account is for a business, a pet, or something else.
                  </InputGroupText>
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
        <Field orientation='responsive'>
          <Button
            type='submit'
            variant='secondary'
            form='form-account-register'
            disabled={register.isPending}
          >
            {register.isPending ? <Spinner /> : <span>Submit</span>}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
