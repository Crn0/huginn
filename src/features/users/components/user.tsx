import type { AuthUser } from "@/lib/auth";
import type { User } from "@/types/api";

import { useNavigate } from "@tanstack/react-router";
import { useToggleFollowUser } from "@/features/follow/api/follow";

import { Card, CardAction, CardHeader } from "@/components/ui/card";
import { Authorization } from "@/lib/authorization";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/avatar/user-avatar";
import { MDPreview } from "@/components/ui/md-preview/md-preview";
import { Link } from "@/components/ui/link";

export interface UserProps {
  authUser: AuthUser;
  user: User;
}

export function User({ authUser, user }: UserProps) {
  const navigate = useNavigate();

  const toggleFollowMutation = useToggleFollowUser(authUser.username);

  const onNavigate = (
    e:
      | React.MouseEvent<HTMLElement, MouseEvent>
      | React.KeyboardEvent<HTMLElement>
  ) => {
    if (
      e.type === "keydown" &&
      (e as React.KeyboardEvent<HTMLElement>).key !== "Enter"
    )
      return;

    const target = e.target as Element;

    const targetParent = target.parentElement;

    const selection = window.getSelection()?.toString() ?? "";

    if (selection.length > 0) return;

    if (
      targetParent &&
      targetParent.getAttribute("data-navigates") !== "true" &&
      target.getAttribute("data-navigates") !== "true"
    ) {
      return;
    }

    navigate({
      to: "/$username",
      params: { username: user.username },
    });
  };

  return (
    <Card
      data-navigates='true'
      className='bg-background text-foreground w-full border-none'
      onClick={onNavigate}
      onKeyDown={onNavigate}
    >
      <CardHeader className='p-0'>
        <div
          data-navigates='true'
          className='flex gap-1'
          onClick={onNavigate}
          onKeyDown={onNavigate}
        >
          <div>
            <Link to='/$username' params={{ username: user.username }}>
              <UserAvatar
                className='h-15 w-15'
                avatar={user.profile.avatarUrl}
                fallback={user.username}
              />
            </Link>
          </div>
          <div
            data-navigates='true'
            className='flex flex-col items-start'
            onClick={onNavigate}
            onKeyDown={onNavigate}
          >
            <span className='w-50 overflow-hidden font-bold text-ellipsis whitespace-nowrap sm:w-fit'>
              {user.profile.displayName}
            </span>
            <span className='w-50 overflow-hidden font-light text-ellipsis whitespace-nowrap opacity-50 sm:w-fit'>
              @{user.username}
            </span>

            {user.profile.bio && (
              <div
                data-navigates='true'
                className='text-balance wrap-break-word'
                onClick={onNavigate}
                onKeyDown={onNavigate}
              >
                <MDPreview data-navigates='true' value={user.profile.bio} />
              </div>
            )}
          </div>
        </div>

        <Authorization
          user={authUser}
          resource='user'
          action='follow'
          data={user}
        >
          <CardAction className='px-5'>
            <Button
              variant='secondary'
              onClick={() => toggleFollowMutation.mutate(user)}
              disabled={toggleFollowMutation.isPending}
            >
              {user.followed ? "Unfollow" : "Follow"}
            </Button>
          </CardAction>
        </Authorization>
      </CardHeader>
    </Card>
  );
}
