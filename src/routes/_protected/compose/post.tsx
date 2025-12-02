import { createFileRoute } from "@tanstack/react-router";

import { ErrorComponent } from "@/components/errors/error-component";
import { LogoSplash } from "@/components/ui/logo-splash";
import { useTweet } from "@/features/tweets/api/get-tweet";
import { CreateTweet } from "@/features/tweets/components/create-tweet";
import { ReplyTweet } from "@/features/tweets/components/reply-tweet";
import { useAuthUser } from "@/lib/auth";

export const Route = createFileRoute("/_protected/compose/post")({
  errorComponent: ErrorComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const { replyTo } = Route.useSearch();

  const navigate = Route.useNavigate();
  const userQuery = useAuthUser();
  const tweetQuery = useTweet(replyTo as string, { enabled: !!replyTo });

  if (!userQuery.isSuccess) {
    return <LogoSplash />;
  }

  const user = userQuery.data;
  const tweet = tweetQuery.data;

  const onSuccess = () => navigate({ to: "/home" });

  if (!tweet) {
    return <CreateTweet username={user.username} onSuccess={onSuccess} />;
  }

  return (
    <ReplyTweet username={user.username} tweet={tweet} onSuccess={onSuccess} />
  );
}
