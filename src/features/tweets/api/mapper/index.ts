import type { Pagination, Tweet, TweetReply, User } from "@/types/api";
import type { InfiniteData } from "@tanstack/react-query";

import { isTweetReply } from "../../utils/is-tweet-reply";

export const transformUserTweetCount = (action: "create" | "delete") => <TUser extends Pick<User, "_count">>(user?: TUser) => {
  if (!user) return;

  return {
    ...user,
    _count: { ...user?._count, tweets: action === "create" ? (user._count.tweets += 1)  : (user._count.tweets -= 1) },
  };
};

export const transformTweetReplyCount = (action: "create" | "delete") => (tweet?: Tweet | TweetReply) => {
  if (!tweet) return;

  return {
    ...tweet,
    _count: { ...tweet?._count, replies: action === "create" ? (tweet._count.replies += 1)  : (tweet._count.replies -= 1) },
  };
};


export const transformLikeTweet = (tweet: Tweet) =>  !tweet ? tweet :  ({...tweet, liked: !tweet.liked, _count: { likes: !tweet.liked ? tweet._count.likes += 1 : tweet._count.likes -= 1} })

export const transformLikeTweets =
  (target: Tweet) => (prevPages?: InfiniteData<Pagination<Tweet[]>>) => {
    if (prevPages) {
      const newPages = prevPages.pages.map(({ data, ...rest }) => {
        const newData = data.map((tweet) =>
          tweet.id !== target.id ? tweet :  transformLikeTweet(tweet)
        );

        return { ...rest, data: newData };
      });

      return { ...prevPages, pages: newPages };
    }

    return prevPages;
  };

export const transformLikeReplies = (tweet:   Tweet | TweetReply) => (data: { pagesParam: string[], pages: Pagination<TweetReply[]>[]}) =>  {
                const newTweet = {
                  ...tweet,
                  liked: !tweet.liked,
                  _count: { likes: !tweet.liked ? tweet._count.likes += 1 : tweet._count.likes -= 1}
                }
                     

                const newPages = !isTweetReply(newTweet) ? data.pages.map(({ data: pageData, ...rest}) => {
                  return {
                    ...rest,
                    data: pageData.map((tw) => {
                      return {
                        ...tw,
                        replies: tw.replies.map((rTw) => {

                      if (rTw.id !== newTweet.id) {
                        return tw
                      }

                      return newTweet
                        })
                      }
                    })
                  }
                }) : data.pages.map(({ data: pageData, ...rest}) => {
                  return {
                    ...rest,
                    data: pageData.map((tw) => {

                      if (tw.id !== newTweet.id) {
                        return tw
                      }

                      return newTweet
                    })
                  }
                })
                
                return {
                  ...data,
                  pages: newPages
                }
              }

export const filterLikeTweet =
  (target: Tweet) => (prevPages?: InfiniteData<Pagination<Tweet[]>>) => {
    if (prevPages) {
      const newPages = prevPages.pages.map(({ data, ...rest }) => {
        const newData = data.filter((tweet) => tweet.id !== target.id);

        return { ...rest, data: newData };
      });

      return { ...prevPages, pages: newPages };
    }

    return prevPages;
  };

  export const filterDeletedTweet = (tweet: Tweet, target: Tweet) => tweet.id !== target.id && tweet.replyTo?.id !== target.id
  
 export const filterDeletedTweets =
    (target: Tweet) => (prevPages?: InfiniteData <Pagination<Tweet[]>>) => {
      if (prevPages) {
        const newPages = prevPages.pages.map(({ data, ...rest }) => {
          const newData = data.filter(
            (tweet) => filterDeletedTweet(tweet, target)
          ).map((tweet) => {
            return tweet.id !== target.replyTo?.id ? tweet : transformTweetReplyCount("delete")(tweet)
          })

  
          return { ...rest, data: newData };
        });
  
        return { ...prevPages, pages: newPages };
      }
  
      return prevPages;
    };

   export const filterDeletedReplies =
    (target: TweetReply["replies"][0]) => (prevPages?: InfiniteData <Pagination<TweetReply[]>>) => {
      if (prevPages) {
        const newPages = prevPages.pages.map(({ data, ...rest }) => {
          const newData = data.map(
            (tweet) => ({ ...transformTweetReplyCount("delete")(tweet), replies: tweet.replies.filter((reply) => {
              return reply.id !== target.id
            })})
          );
  
          return { ...rest, data: newData };
        });
  
        return { ...prevPages, pages: newPages };
      }
  
      return prevPages;
    };
  
  