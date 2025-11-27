import type { Tweet } from "@/types/api";

import { Trash2Icon } from "lucide-react";

import { useDeleteTweet } from "../api/delete-tweet";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteTweet({
  tweet,
  pageTweet,
  onSuccess,
}: {
  tweet: Tweet;
  pageTweet?: Tweet
  onSuccess?: () => void;
}) {
  const tweetMutation = useDeleteTweet(tweet.author.username, { onSuccess });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='secondary'
          className='bg-background text-destructive flex justify-baseline'
          disabled={tweetMutation.isPending}
        >
          <Trash2Icon />
          <span>Delete</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete tweet?</DialogTitle>
          <DialogDescription>
            This can't be undone and it will be removed from your profile, the
            timeline of any accounts that follow you, and from search results.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={tweetMutation.isPending}>Cancel</Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              variant='destructive'
              onClick={() => tweetMutation.mutate({tweet, pageTweet})}
              disabled={tweetMutation.isPending}
            >
              Delete
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
