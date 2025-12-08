import type { AuthUser } from "@/lib/auth";

import { useTweet } from "../api/get-tweet";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ReplyTweet } from "./reply-tweet";
import { CreateTweet } from "./create-tweet";
import { Spinner } from "@/components/ui/spinner";

export interface ComposeProps {
  user: AuthUser;
  isOpen: boolean;
  close: () => void;
  replyTo: string;
}

export function TweetModalRoute({
  user,
  close,
  isOpen,
  replyTo,
}: ComposeProps) {
  const tweetQuery = useTweet(replyTo as string, {
    enabled: isOpen && !!replyTo,
  });

  const tweet = tweetQuery.data;

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent
        className='h-full w-full max-w-sm border-0 sm:h-fit sm:max-w-lg sm:border'
        showCloseButton
      >
        <div className='bg-background flex flex-col'>
          {tweet && (
            <ReplyTweet
              formId='reply-tweet-modal-form'
              username={user.username}
              tweet={tweet}
              onSuccess={close}
            />
          )}
          {!tweet && tweetQuery.isEnabled && tweetQuery.isLoading && (
            <div className='grid place-content-center-safe'>
              <Spinner className='text-spinner' />
            </div>
          )}
          {!tweetQuery.isEnabled && (
            <CreateTweet
              formId='create-tweet-modal-form'
              username={user.username}
              onSuccess={close}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
