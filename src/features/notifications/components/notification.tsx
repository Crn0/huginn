import type { AuthUser } from "@/lib/auth";
import type { Notification as NotificationType } from "@/types/api";

import { UserRoundIcon } from "lucide-react";

import { format } from "@/utils/format-date";

import { UserAvatar } from "@/components/ui/avatar/user-avatar";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { NotificationTweet } from "./notification-tweet";
import { Link } from "@/components/ui/link";

export interface NotificationProps {
  user: AuthUser;
  notification: NotificationType;
}

export function Notification({ user, notification }: NotificationProps) {
  if (notification.type !== "FOLLOW") {
    return <NotificationTweet user={user} tweet={notification.tweet} />;
  }

  return (
    <Link to='/$username' params={{ username: notification.sender.username }}>
      <Card className='bg-background text-foreground rounded-none border-t-0 border-r-0 border-b-1 border-l-0'>
        <CardHeader>
          <div className='flex justify-between gap-1'>
            <div className='flex gap-1'>
              {notification.type === "FOLLOW" && (
                <UserRoundIcon className='size-10 text-blue-400' />
              )}

              <UserAvatar
                className='size-10 border-2'
                avatar={notification.sender.profile.avatarUrl}
                fallback={notification.sender.username}
              />
            </div>

            <time
              dateTime={notification.createdAt}
              className='font-light opacity-50'
            >
              {format(notification.createdAt, "MMM d")}
            </time>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex gap-2'>
            <span className='font-bold'>{notification.sender.username}</span>
            <span>followed you</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
