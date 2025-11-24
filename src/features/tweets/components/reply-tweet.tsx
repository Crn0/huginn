import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import {
  ACCEPTED_ATTACHMENTS_TYPES,
  MAX_CONTENT_LENGTH,
  MAX_MEDIA_LENGTH,
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
import {
  replyTweetInputSchema,
  useReplyTweet,
  type ReplyTweetInput,
} from "../api/reply-tweet";
import type { Tweet } from "@/types/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/avatar/user-avatar";
import { Link } from "@/components/ui/link";
import { dateDiffInDays } from "@/lib/date";
import { formatDate, formatDistance } from "@/utils/format-date";
import { MDPreview } from "@/components/ui/md-preview/md-preview";
import { parse } from "../utils/parse";
import linkifyHtml from "linkify-html";
import { TweetMedia } from "./tweet-media";
import { Separator } from "@/components/ui/separator";

export interface ReplyTweetProps {
  username: string;
  tweet: Tweet;
  onSuccess?: () => void;
  showReplyToContent?: boolean;
}

export function ReplyTweet({ username, tweet, onSuccess, showReplyToContent = true }: ReplyTweetProps) {
  const mediaRef = useRef<HTMLInputElement | null>(null);
  
  const form = useForm({
    resolver: zodResolver(replyTweetInputSchema),
    mode: "onBlur"
  });

  const emojiDisclosure = useDisclosure(false);

  const tweetMutation = useReplyTweet(username, {
    onError: (e) => handleServerError<ReplyTweetInput>(e, form.setError),
    onSuccess: () => {
      form.reset();
      onSuccess?.();
    },
  });

  const onSubmit = (data: ReplyTweetInput) => tweetMutation.mutate(data);

  const content = JSON.stringify(form.watch("content")) ?? ""
  const media =
    form
      .watch("media")
      ?.map((m, i) => ({ id: `${m.name}-${m.lastModified}-${i}`, item: m })) ??
    [];

  const laterDate = new Date(tweet.createdAt);
  const currentDate = new Date();

  return (
    <>
      <Card
        id={tweet.id}
        className='bg-background text-foreground w-full border-none'
      >
        {
          showReplyToContent &&<>
                  <CardHeader>
          <div className='flex gap-2'>
            <div>
              <Link
                to='/$username'
                params={{ username: tweet.author.username }}
              >
                <UserAvatar
                  className='h-13 w-13 border-2'
                  avatar={tweet.author.profile.avatarUrl}
                  fallback={tweet.author.username}
                />
              </Link>
            </div>
            <div className='flex w-full justify-between'>
              <div className='text-foreground flex gap-1'>
                <span className='font-bold'>
                  {tweet.author.profile.displayName}
                </span>
                <span className='font-light opacity-50'>
                  @{tweet.author.username}
                </span>

                <time
                  className='font-light opacity-50'
                  dateTime={tweet.createdAt}
                >
                  {dateDiffInDays(laterDate, currentDate) < 1
                    ? formatDistance(laterDate, currentDate, {
                        isUnitFirstChar: true,
                      })
                    : formatDate(tweet.createdAt, "MMM cc")}
                </time>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className='flex flex-col gap-2'>
          <MDPreview parse={parse} value={linkifyHtml(tweet.content ?? "")} />

          <TweetMedia media={tweet.media} />
        </CardContent></>
        }
        {username !== tweet.author.username && (
          <CardFooter>
            <CardDescription>
              Replying to{" "}
              <span className='text-blue-400'>@{tweet.author.username}</span>
            </CardDescription>
          </CardFooter>
        )}
      </Card>

        {
          showReplyToContent &&      <Separator
        orientation='vertical'
        className='ml-[2rem] border-2 data-[orientation=vertical]:h-25'
      />
        }

      <form
        id='create-tweet'
        className='grid gap-5 p-5'
        role='form'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <Input
            type='hidden'
            {...form.register("replyTo", { value: tweet.id })}
          />

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
                    placeholder="Post your reply"
                    value={field.value ?? ""}
                    aria-invalid={fieldState.invalid}
                    aria-disabled={content.length === MAX_CONTENT_LENGTH}
                  />
                  <InputGroupText className='tabular-nums'>
                    {content.length ?? 0}/{MAX_CONTENT_LENGTH}
                  </InputGroupText>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
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
                  disabled={media.length === MAX_MEDIA_LENGTH}
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
                    form.setValue("content", content ? content + emoji : emoji);

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
                tweetMutation.isPending || (!content.length && !media.length) || content.length > MAX_CONTENT_LENGTH
              }
            >
              Post
            </Button>
          </div>
        </FieldGroup>
      </form>
    </>
  );
}
