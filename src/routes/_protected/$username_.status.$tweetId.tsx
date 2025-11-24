import { NotFound } from '@/components/errors/not-found'
import { ContentLayout } from '@/components/layouts/content-layout'
import { LogoSplash } from '@/components/ui/logo-splash'
import { Spinner } from '@/components/ui/spinner'
import { useTweet } from '@/features/tweets/api/get-tweet'
import { Tweet } from '@/features/tweets/components/tweet'
import { TweetDetail } from '@/features/tweets/components/tweet-detail'
import { useUser } from '@/features/users/api/get-user'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/$username_/status/$tweetId')({
  component: RouteComponent,
  params: { parse: (p) => p }
})

function RouteComponent() {
  const { username, tweetId } = Route.useParams()

  const userQuery = useUser(username)
  const tweetQuery = useTweet(tweetId)

  if (userQuery.isError || tweetQuery.isError) {
    return <NotFound />
  }

  if (!userQuery.isSuccess || !tweetQuery.isSuccess) {
    return <div className='text-spinner justify-center-safe items-center-safe h-full flex'>
      <Spinner className='size-10'/>
    </div>
  }

  const user = userQuery.data

  const tweet = tweetQuery.data


  return <ContentLayout contentClassName='overflow-hidden'>
    <TweetDetail user={user} tweet={tweet}/>
  </ContentLayout>
}
