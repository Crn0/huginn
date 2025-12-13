import type { AuthUser } from "@/lib/auth";

import { useInfiniteNotifications } from "../api/get-notifications";
import { Spinner } from "@/components/ui/spinner";
import { Notification } from "./notification";

export interface NotificationsProps {
  user: AuthUser;
}

export function Notifications({ user }: NotificationsProps) {
  const notificationsQuery = useInfiniteNotifications(user.username);

  if (!notificationsQuery.isSuccess) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  const notifications = notificationsQuery.data.pages.flatMap(
    ({ data }) => data
  );

  if (notifications.length <= 0) {
    return (
      <div className='flex flex-col items-center-safe justify-center-safe px-5'>
        <span className='text-4xl font-bold'>Nothing to see here — yet</span>
        <span className='font-light opacity-80'>
          When someone mentions you, you’ll find it here.
        </span>
      </div>
    );
  }

  return (
    <ul>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          user={user}
          notification={notification}
        />
      ))}
    </ul>
  );
}
