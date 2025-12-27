import { createFileRoute } from "@tanstack/react-router";

import { notificationKeys } from "@/features/notifications/api/query-key-factory";
import { authUserQueryOptions, useAuthUser } from "@/lib/auth";
import { infiniteNotificationsOption } from "@/features/notifications/api/get-notifications";

import { tryCatch } from "@/lib/try-catch";
import { readNotifications } from "@/features/notifications/api/read-notifications";

import { ErrorComponent } from "@/components/errors/error-component";
import { ContentLayout } from "@/components/layouts/content-layout";
import { Notifications } from "@/features/notifications/components/notifications";
import { LogoSplash } from "@/components/ui/logo-splash";

export const Route = createFileRoute("/_protected/notifications")({
  loader: async ({ context: { queryClient, client } }) => {
    const user = await queryClient.ensureQueryData({
      ...authUserQueryOptions(),
    });

    const notifications =
      (
        await queryClient.ensureInfiniteQueryData({
          ...infiniteNotificationsOption(client, user.id),
        })
      ).pages.flatMap(({ data }) => data.filter((n) => !n.isRead)) ?? [];

    const readIds = notifications.map(({ id }) => id);

    if (readIds.length > 0) {
      await tryCatch(readNotifications(client)({ readIds }));

      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(user.username),
      });
    }
  },
  errorComponent: ErrorComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const userQuery = useAuthUser();

  if (!userQuery.isSuccess) {
    return <LogoSplash />;
  }

  const user = userQuery.data;

  return (
    <ContentLayout
      headerClassName='p-5 fixed top-0 left-20 sm:static w-full '
      contentClassName='border-t-1 border-border'
      headerChildren={
        <>
          <div className='flex flex-col justify-center-safe gap-1'>
            <span className='overflow-hidden text-xl overflow-ellipsis whitespace-nowrap'>
              Notifications
            </span>
          </div>
        </>
      }
    >
      <Notifications user={user} />
    </ContentLayout>
  );
}
