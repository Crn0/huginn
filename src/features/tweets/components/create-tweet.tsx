import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import {
  ACCEPTED_ATTACHMENTS_TYPES,
  createTweetInputSchema,
  MAX_CONTENT_LENGTH,
  MAX_MEDIA_LENGTH,
  useCreateTweet,
  type CreateTweetInput,
} from "../api/create-tweet";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  ListIcon,
  MessageCircleOffIcon,
  SmileIcon,
} from "lucide-react";
import { GifIcon } from "@/components/ui/icon/gif";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MediaPreview } from "./media-preview";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import { useDisclosure } from "@/hooks/use-disclosure";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/utils/cn";
import { handleServerError } from "@/lib/handle-form-server-error";

export interface CreateTweetProps {
  username: string;
  onSuccess?: () => void;
}

export function CreateTweet({ username, onSuccess }: CreateTweetProps) {
  const mediaRef = useRef<HTMLInputElement | null>(null);

  const form = useForm({
    resolver: zodResolver(createTweetInputSchema),
    mode: "onBlur",
  });

  const emojiDisclosure = useDisclosure(false);

  const tweetMutation = useCreateTweet(username, {
    onError: (e) => handleServerError<CreateTweetInput>(e, form.setError),
    onSuccess: () => {
      form.reset();
      onSuccess?.();
    },
  });

  const onSubmit = (data: CreateTweetInput) => tweetMutation.mutate(data);

  const content = form.watch("content")
    ? JSON.stringify(form.watch("content"))
    : "";
  const media =
    form
      .watch("media")
      ?.map((m, i) => ({ id: `${m.name}-${m.lastModified}-${i}`, item: m })) ??
    [];

  return (
    <form
      id='create-tweet'
      className='grid gap-5 p-5'
      role='form'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <Controller
          name='content'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Label className='sr-only' htmlFor='content'>
                Content
              </Label>
              <InputGroup className='border-0 p-2 sm:p-5'>
                <InputGroupTextarea
                  {...field}
                  id='content'
                  placeholder="what's happening?"
                  value={field.value ?? ""}
                  aria-invalid={fieldState.invalid}
                  aria-disabled={content.length === MAX_CONTENT_LENGTH}
                />
                <InputGroupText
                  className={cn(
                    "tabular-nums",
                    content.length > MAX_CONTENT_LENGTH && "text-red-600"
                  )}
                >
                  {content.length ?? 0}/{MAX_CONTENT_LENGTH}
                </InputGroupText>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {media.length > 0 && (
          <Carousel className='w-full max-w-md sm:max-w-full'>
            <CarouselContent className='items-center-safe justify-center-safe'>
              {media.map(({ id, item }) => (
                <CarouselItem
                  key={id}
                  className={cn(
                    "sm:basis-2xl",
                    media.length > 2 && "flex basis-2/4 sm:basis-sm",
                    media.length === 2 && "basis-2/4 sm:basis-2/5"
                  )}
                >
                  <MediaPreview
                    media={item}
                    onRemove={() => {
                      form.setValue(
                        "media",
                        media.filter((m) => m.id !== id).map((m) => m.item)
                      );
                    }}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {media.length > 2 && (
              <>
                <CarouselPrevious className='left-4' type='button' />
                <CarouselNext className='right-4' type='button' />
              </>
            )}
          </Carousel>
        )}
      </FieldGroup>

      <FieldGroup className='flex-row justify-between'>
        <div className='flex gap-5'>
          <Controller
            control={form.control}
            name='media'
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Label className='sr-only' htmlFor='media'>
                  Avatar
                </Label>

                <Input
                  {...field}
                  id='media'
                  className='hidden'
                  type='file'
                  value=''
                  accept={ACCEPTED_ATTACHMENTS_TYPES.join(",")}
                  aria-invalid={fieldState.invalid}
                  aria-disabled={media.length > MAX_MEDIA_LENGTH}
                  disabled={media.length === MAX_MEDIA_LENGTH}
                  ref={(e) => {
                    mediaRef.current = e;
                    field.ref(e);
                  }}
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      const oldValue = field.value ?? [];

                      field.onChange([...oldValue, ...e.target.files]);
                    }
                  }}
                  multiple
                />
              </Field>
            )}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className='hover:bg-background hover:text-foreground hover:border-0'
                variant='ghost'
                size='icon-sm'
                type='button'
                onClick={() => mediaRef.current?.click()}
                disabled={media.length >= MAX_MEDIA_LENGTH}
              >
                <ImageIcon className='size-7 text-blue-400' />
              </Button>
            </TooltipTrigger>

            <TooltipContent side='bottom' sideOffset={-2}>
              Media
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className='hover:bg-background hover:text-foreground hover:border-0'
                variant='ghost'
                size='icon-sm'
                type='button'
                disabled={media.length >= MAX_MEDIA_LENGTH}
              >
                <GifIcon className='size-7 text-blue-400' />
              </Button>
            </TooltipTrigger>

            <TooltipContent side='bottom' sideOffset={-2}>
              Gif
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className='hover:bg-background hover:text-foreground hover:border-0'
                variant='ghost'
                size='icon-sm'
                type='button'
              >
                <MessageCircleOffIcon className='size-7 text-blue-400' />
              </Button>
            </TooltipTrigger>

            <TooltipContent side='bottom' sideOffset={-2}>
              Enhance your post with Grok"
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className='hover:bg-background hover:text-foreground hover:border-0'
                variant='ghost'
                size='icon-sm'
                type='button'
              >
                <ListIcon className='size-7 text-blue-400' />
              </Button>
            </TooltipTrigger>

            <TooltipContent side='bottom' sideOffset={-2}>
              Poll
            </TooltipContent>
          </Tooltip>

          <Popover
            onOpenChange={emojiDisclosure.toggle}
            open={emojiDisclosure.isOpen}
          >
            <Tooltip>
              <PopoverTrigger asChild>
                <TooltipTrigger className='hidden sm:block' asChild>
                  <Button
                    className='hover:bg-background hover:text-foreground hover:border-0'
                    variant='ghost'
                    size='icon-sm'
                    type='button'
                    disabled={content?.length >= MAX_CONTENT_LENGTH - 1}
                  >
                    <SmileIcon className='size-7 text-blue-400' />
                  </Button>
                </TooltipTrigger>
              </PopoverTrigger>

              <TooltipContent side='bottom' sideOffset={-2}>
                Emoji
              </TooltipContent>
            </Tooltip>

            <PopoverContent className='bg-background p-0'>
              <EmojiPicker
                className='h-[342px]'
                onEmojiSelect={({ emoji }) => {
                  form.setValue(
                    "content",
                    content ? `${JSON.parse(content)}${emoji}` : emoji
                  );

                  emojiDisclosure.close();
                }}
              >
                <EmojiPickerSearch className='text-foreground' />
                <EmojiPickerContent />
                <EmojiPickerFooter />
              </EmojiPicker>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Button
            variant='secondary'
            type='submit'
            form='create-tweet'
            disabled={
              tweetMutation.isPending ||
              (!content.length && !media.length) ||
              content.length > MAX_CONTENT_LENGTH ||
              media.length > MAX_MEDIA_LENGTH
            }
          >
            Post
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
