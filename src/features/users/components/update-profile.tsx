import { useRef, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { CircleXIcon, ImageDownIcon } from "lucide-react";
import {
  BIO_LENGTH,
  LOCATION_LENGTH,
  SUPPORTED_FILE_TYPES,
  updateProfileInputSchema,
  useUpdateProfile,
  WEBSITE_LENGTH,
  type UpdateProfileInput,
} from "../api/update-profile";
import { DISPLAY_NAME_LENGTH, type AuthUser } from "@/lib/auth";
import { Controller, useForm } from "react-hook-form";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/avatar/user-avatar";
import { UserBanner } from "@/components/ui/avatar/user-banner";
import { BirthdatePicker } from "@/components/ui/birthday-picker";
import { EditMediaDialog } from "@/components/ui/edit-media/edit-media-dialog";
import { useDisclosure, type UseDisclosure } from "@/hooks/use-disclosure";
import {
  Content,
  Dialog,
  DialogClose,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface UpdateProfileProps {
  user: AuthUser;
  renderButtonTrigger: (
    disclosure: Pick<UseDisclosure, "open" | "toggle">
  ) => ReactNode;
}

const fileType = SUPPORTED_FILE_TYPES.join(",");

export function UpdateProfile({
  user,
  renderButtonTrigger,
}: UpdateProfileProps) {
  const { profile } = user;
  const form = useForm({
    resolver: zodResolver(updateProfileInputSchema),
    defaultValues: {
      displayName: profile.displayName,
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      website: profile.website ?? undefined,
      birthday: profile.birthday ?? "",
      avatar: null,
      banner: null,
    },
  });
  const { isOpen, open, close, toggle } = useDisclosure();

  const [avatarObjectUrl, setAvatarBannerObjectUrl] = useState<string | null>(
    null
  );
  const [bannerObjectUrl, setBannerObjectUrl] = useState<string | null>(null);

  const profileMutation = useUpdateProfile(user.username, {
    onSuccess: () => {
      close();
    },
  });
  const avatarRef = useRef<HTMLInputElement | null>(null);
  const bannerRef = useRef<HTMLInputElement | null>(null);

  const avatarDisclosure = useDisclosure(false);
  const bannerDisclosure = useDisclosure(false);

  const avatarFile = form.watch("avatar");
  const bannerFile = form.watch("banner");

  const onSubmit = (data: UpdateProfileInput) => {
    profileMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} defaultOpen={false}>
      <DialogTrigger asChild>
        {renderButtonTrigger({ open, toggle })}
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <Content className='bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid h-dvh w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-black shadow-lg duration-200 sm:h-auto sm:w-md sm:rounded-lg sm:p-6'>
          <DialogHeader className='p-1'>
            <div className='flex items-center-safe justify-between'>
              <DialogTitle className='flex items-center-safe gap-5'>
                <DialogClose asChild>
                  <Button
                    className='bg-black hover:bg-white/25'
                    variant='secondary'
                    size='icon-sm'
                    onClick={close}
                  >
                    <span className='sr-only'>Close</span>
                    <CircleXIcon color='white' />
                  </Button>
                </DialogClose>
                <span>Edit Profile</span>
              </DialogTitle>

              <Button
                type='submit'
                variant='secondary'
                form='form-profile-update'
                disabled={profileMutation.isPending}
              >
                {profileMutation.isPending ? <Spinner /> : <span>Save</span>}
              </Button>
            </div>
          </DialogHeader>
          <form
            id='form-profile-update'
            role='form'
            className='grid gap-5'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup className='grid gap-0'>
              <Controller
                control={form.control}
                name='banner'
                render={({ field, fieldState }) => (
                  <Field className='w-full' data-invalid={fieldState.invalid}>
                    <Label className='sr-only' htmlFor='form-banner'>
                      Banner
                    </Label>

                    <Input
                      {...field}
                      id='form-banner'
                      type='file'
                      className='hidden'
                      aria-invalid={fieldState.invalid}
                      value=''
                      accept={fileType}
                      ref={(e) => {
                        bannerRef.current = e;
                        field.ref(e);
                      }}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          field.onChange(e.target.files[0]);
                          bannerDisclosure.open();
                        }
                      }}
                    />

                    <div className='grid h-full'>
                      <UserBanner
                        banner={bannerObjectUrl ?? user.profile.bannerUrl}
                        className='col-start-1 row-start-1 h-50 w-full place-self-center-safe self-center-safe'
                      />

                      <EditMediaDialog
                        isOpen={bannerDisclosure.isOpen}
                        aspect={4 / 1}
                        cropShape='rect'
                        imageFile={bannerFile}
                        setPreviewUrl={setBannerObjectUrl}
                        setCroppedImageFile={(file) => {
                          form.setValue("banner", file);
                          bannerDisclosure.close();
                        }}
                        cancel={() => {
                          form.setValue("banner", null);
                          bannerDisclosure.close();
                        }}
                        done={bannerDisclosure.close}
                        renderButtonTrigger={() => (
                          <Button
                            size='icon'
                            type='button'
                            className='text-foreground z-50 col-start-1 row-start-1 place-self-center-safe self-center-safe rounded-full bg-black/50'
                            onClick={() => {
                              bannerRef.current?.click();
                            }}
                          >
                            <ImageDownIcon />
                          </Button>
                        )}
                      />

                      {bannerObjectUrl && (
                        <Button
                          size='icon'
                          type='button'
                          className='text-foreground z-50 col-start-1 row-start-1 ml-20 place-self-center-safe self-center-safe rounded-full bg-black/50'
                          onClick={() => {
                            field.onChange(null);
                            setBannerObjectUrl(null);
                          }}
                        >
                          <CircleXIcon />
                        </Button>
                      )}
                    </div>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name='avatar'
                render={({ field, fieldState }) => (
                  <Field
                    className='-mt-10 w-25'
                    data-invalid={fieldState.invalid}
                  >
                    <Label className='sr-only' htmlFor='form-avatar'>
                      Avatar
                    </Label>

                    <Input
                      {...field}
                      id='form-avatar'
                      type='file'
                      aria-invalid={fieldState.invalid}
                      value=''
                      accept={fileType}
                      ref={(e) => {
                        avatarRef.current = e;
                        field.ref(e);
                      }}
                      className='hidden'
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          avatarDisclosure.open();
                          field.onChange(e.target.files[0]);
                        }
                      }}
                    />

                    <div className='grid'>
                      <UserAvatar
                        className='col-start-1 row-start-1 h-20 w-20 place-self-center-safe self-center-safe'
                        fallbackClassName='text-[2rem]'
                        avatar={avatarObjectUrl ?? user.profile.avatarUrl}
                        fallback={user.username}
                      />

                      <EditMediaDialog
                        isOpen={avatarDisclosure.isOpen}
                        aspect={4 / 4}
                        cropShape='rect'
                        imageFile={avatarFile}
                        setPreviewUrl={setAvatarBannerObjectUrl}
                        setCroppedImageFile={(file) => {
                          form.setValue("avatar", file);
                          avatarDisclosure.close();
                        }}
                        cancel={() => {
                          form.setValue("avatar", null);
                          avatarDisclosure.close();
                        }}
                        done={avatarDisclosure.close}
                        renderButtonTrigger={() => (
                          <Button
                            size='icon'
                            className='text-foreground z-50 col-start-1 row-start-1 place-self-center-safe self-center-safe rounded-full bg-black/50'
                            onClick={() => {
                              avatarRef.current?.click();
                            }}
                          >
                            <ImageDownIcon />
                          </Button>
                        )}
                      />
                    </div>
                  </Field>
                )}
              />
            </FieldGroup>

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
                name='bio'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Label className='sr-only' htmlFor='form-bio'>
                      Display Name
                    </Label>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id='form-bio'
                        placeholder='Bio'
                        onChange={(e) => {
                          if (e.currentTarget.value.length <= BIO_LENGTH) {
                            field.onChange(e);
                          }
                        }}
                        value={field.value ?? undefined}
                        aria-invalid={fieldState.invalid}
                        aria-disabled={field.value?.length === BIO_LENGTH}
                      />
                      {!field.value?.length ? null : (
                        <InputGroupAddon
                          align='block-start'
                          className='flex justify-between'
                        >
                          <InputGroupText className='font-sans'>
                            Bio
                          </InputGroupText>
                          <InputGroupText className='tabular-nums'>
                            {field.value.length}/{BIO_LENGTH}
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
                name='location'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Label className='sr-only' htmlFor='form-location'>
                      Display Name
                    </Label>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id='form-location'
                        placeholder='Location'
                        onChange={(e) => {
                          if (e.currentTarget.value.length <= LOCATION_LENGTH) {
                            field.onChange(e);
                          }
                        }}
                        value={field.value ?? undefined}
                        aria-invalid={fieldState.invalid}
                        aria-disabled={field.value?.length === LOCATION_LENGTH}
                      />
                      {!field.value?.length ? null : (
                        <InputGroupAddon
                          align='block-start'
                          className='flex justify-between'
                        >
                          <InputGroupText className='font-sans'>
                            Location
                          </InputGroupText>
                          <InputGroupText className='tabular-nums'>
                            {field.value.length}/{LOCATION_LENGTH}
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
                name='website'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Label className='sr-only' htmlFor='form-website'>
                      Display Name
                    </Label>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id='form-website'
                        placeholder='Website'
                        onChange={(e) => {
                          if (!field.value?.length) {
                            form.clearErrors("website");
                          }

                          if (e.currentTarget.value.length <= WEBSITE_LENGTH) {
                            field.onChange(e);
                          }
                        }}
                        onBlur={() => {
                          if (!field.value?.length) {
                            form.clearErrors("website");
                            field.onChange(null);
                          }
                        }}
                        value={field.value ?? undefined}
                        aria-invalid={fieldState.invalid}
                        aria-disabled={field.value?.length === WEBSITE_LENGTH}
                      />
                      {!field.value?.length ? null : (
                        <InputGroupAddon
                          align='block-start'
                          className='flex justify-between'
                        >
                          <InputGroupText className='font-sans'>
                            Website
                          </InputGroupText>
                          <InputGroupText className='tabular-nums'>
                            {field.value.length}/{WEBSITE_LENGTH}
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
                name='birthday'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <BirthdatePicker
                      {...field}
                      defaultDate={user.profile.birthday}
                    />
                    <InputGroupText>
                      This should be the date of birth of the person using the
                      account. Even if you're making an account for your
                      business, event, or cat.
                    </InputGroupText>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </Content>
      </DialogPortal>
    </Dialog>
  );
}
