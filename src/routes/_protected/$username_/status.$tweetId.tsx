import { createFileRoute } from "@tanstack/react-router";

import { NotFound } from "@/components/errors/not-found";
import { ContentLayout } from "@/components/layouts/content-layout";
import { LogoSplash } from "@/components/ui/logo-splash";
import { Spinner } from "@/components/ui/spinner";
import { useTweet } from "@/features/tweets/api/get-tweet";
import { TweetDetail } from "@/features/tweets/components/tweet-detail";
import { TweetReplyList } from "@/features/tweets/components/tweet-reply-list";
import { useUser } from "@/features/users/api/get-user";
import { useAuthUser } from "@/lib/auth";
import { ErrorComponent } from "@/components/errors/error-component";

export const Route = createFileRoute("/_protected/$username_/status/$tweetId")({
        errorComponent: ErrorComponent,
  component: RouteComponent,
  params: { parse: (p) => p },
});

function RouteComponent() {
  const { username, tweetId } = Route.useParams();

  const authUserQuery = useAuthUser();
  const userQuery = useUser(username);
  const tweetQuery = useTweet(tweetId, {
    enabled: !!authUserQuery.isSuccess && !!userQuery.isSuccess,
  });

  if (!authUserQuery.isSuccess) {
    return <LogoSplash />;
  }

  if (userQuery.isError || tweetQuery.isError) {
    return <NotFound />;
  }

  if (!userQuery.isSuccess || !tweetQuery.isSuccess) {
    return (
      <div className='text-spinner flex h-full items-center-safe justify-center-safe'>
        <Spinner className='size-10' />
      </div>
    );
  }

  const user = authUserQuery.data;

  const tweet = tweetQuery.data;

  return (
    <ContentLayout contentClassName='overflow-hidden'>
      <TweetDetail user={user} tweet={tweet} />

      <TweetReplyList user={user} parent={tweet} />
    </ContentLayout>
  );
}
