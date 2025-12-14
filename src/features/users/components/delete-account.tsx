import type { AuthUser } from "@/lib/auth";

import { useNavigate } from "@tanstack/react-router";

import { useDeleteAccount } from "../api/delete-account";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/avatar/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Authorization } from "@/lib/authorization";

export interface DeleteAccountProps {
  user: AuthUser;
}

export function DeleteAccount({ user }: DeleteAccountProps) {
  const { isOpen, open, close } = useDisclosure();
  const navigate = useNavigate();

  const deleteAccountMutation = useDeleteAccount({
    onSuccess: () => {
      navigate({ to: "/login", replace: true });
    },
  });

  return (
    <Card className='bg-background text-foreground w-full border-none'>
      <CardHeader>
        <div className='flex flex-1 gap-1'>
          <UserAvatar
            className='size-12 border-1'
            avatar={user.profile.avatarUrl}
            fallback={user.username}
          />
          <div className='flex flex-col'>
            <span className='font-bold'>{user.profile.displayName}</span>
            <span className='font-light opacity-50'>@{user.username}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle>This will delete your account</CardTitle>

        <CardDescription>
          You're about to start the process of deleting your Huginn account.
        </CardDescription>
      </CardContent>

      <CardFooter>
        <Authorization
          user={user}
          resource='user'
          action='delete'
          data={user}
          forbiddenFallback={
            <Dialog>
              <DialogTrigger asChild>
                <Button variant='destructive' className='w-full'>
                  Delete
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Account</DialogTitle>

                  <DialogDescription>
                    Demo account cannot delete their account.
                  </DialogDescription>
                </DialogHeader>

                <DialogClose asChild>
                  <Button variant='secondary'>Cancel</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          }
        >
          <Dialog open={isOpen || deleteAccountMutation.isPending}>
            <DialogTrigger asChild>
              <Button
                variant='destructive'
                className='w-full'
                onClick={() => open()}
              >
                Delete
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>

                <DialogDescription>
                  Are you sure you to delete your account?
                </DialogDescription>
              </DialogHeader>

              <Button
                variant='destructive'
                className='w-full'
                onClick={deleteAccountMutation.mutate}
                disabled={deleteAccountMutation.isPending}
              >
                Confirm
              </Button>
              <DialogClose asChild>
                <Button
                  variant='secondary'
                  onClick={close}
                  disabled={deleteAccountMutation.isPending}
                >
                  Cancel
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </Authorization>
      </CardFooter>
    </Card>
  );
}
