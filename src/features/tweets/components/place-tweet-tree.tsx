import type { Tweet, TweetReply, User } from "@/types/api";
import type { AuthUser } from "@/lib/auth";

import { Fragment} from "react"

import { Separator } from "@/components/ui/separator";
import { Tweet as TweetComponent } from "./tweet";


export interface PlaceTweetTreeProps {
    user: AuthUser | User
    tweet: Tweet | TweetReply | TweetReply["replies"][0],
    pageTweet?: Tweet,
    replies?: TweetReply["replies"] | Tweet[] | TweetReply[]
    maxDepth?: number
    depthCount?: number
}


export function PlaceTweetTree({ user, tweet, pageTweet, replies = [], maxDepth = 1, depthCount=0}: PlaceTweetTreeProps) {
    return <>

        <TweetComponent user={user} tweet={tweet} pageTweet={pageTweet}/>

                {
         replies.length > 0 &&   replies.map((reply) => <Fragment key={reply?.id}>
   {
    depthCount <= maxDepth &&          <Separator
                      orientation='vertical'
                      className='ml-12 border-2 data-[orientation=vertical]:h-25'
                    />
   }

                    <PlaceTweetTree  user={user} tweet={reply} pageTweet={pageTweet} maxDepth={maxDepth} depthCount={depthCount += 1}/>

         </Fragment> )

        }

    </>
}