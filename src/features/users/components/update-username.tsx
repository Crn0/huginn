import type { AuthUser } from "@/lib/auth";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  MAX_USERNAME_LENGTH,
  updateUsernameInput,
  useUpdateUsername,
  type UpdateUsernameInput,
  type UseUpdateUsernameOption,
} from "../api/update-username";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export interface UpdateUsernameProps {
  user: AuthUser;
  onSuccess?: UseUpdateUsernameOption["onSuccess"];
}

export function UpdateUsername({ user, onSuccess }: UpdateUsernameProps) {
  const form = useForm({
    resolver: zodResolver(updateUsernameInput),
    defaultValues: {
      username: user.username,
    },
  });

  const usernameMutation = useUpdateUsername({ onSuccess });

  const onSubmit = (data: UpdateUsernameInput) => {
    usernameMutation.mutate(data);
  };

  const username = form.watch("username");

  return (
    <Card className='[&_input]:selection:bg-input-background bg-background border-none text-white'>
      <CardContent>
        <form
          id='form-update-username'
          role='form'
          className='grid gap-5'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name='username'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label className='sr-only' htmlFor='form-username'>
                    Username
                  </Label>
                  <InputGroup className='border-border'>
                    <InputGroupInput
                      {...field}
                      id='form-display-name'
                      placeholder='Username'
                      onChange={(e) => {
                        if (
                          e.currentTarget.value.length <= MAX_USERNAME_LENGTH
                        ) {
                          field.onChange(e);
                        }
                      }}
                      aria-invalid={fieldState.invalid}
                      aria-disabled={
                        field.value?.length === MAX_USERNAME_LENGTH
                      }
                    />
                    {!field.value?.length ? null : (
                      <InputGroupAddon
                        align='block-start'
                        className='flex justify-between'
                      >
                        <InputGroupText className='font-sans'>
                          Username
                        </InputGroupText>
                        <InputGroupText className='tabular-nums'>
                          {field.value.length}/{MAX_USERNAME_LENGTH}
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
              usernameMutation.isPending ||
              !username?.length ||
              username === user.username
            }
          >
            {usernameMutation.isPending ? <Spinner /> : <span>Save</span>}
          </Button>
        </CardAction>
      </CardContent>
    </Card>
  );
}
