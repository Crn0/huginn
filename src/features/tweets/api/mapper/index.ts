import type { Pagination, Tweet, TweetReply, User } from "@/types/api";
import type { InfiniteData } from "@tanstack/react-query";

import { isTweetReply } from "../../utils/is-tweet-reply";
import { isRepost } from "../../utils/is-repost";

export const transformUserTweetCount =
  (action: "create" | "delete") =>
  <TUser extends Pick<User, "_count">>(user?: TUser) => {
    if (!user) return;

    return {
      ...user,
      _count: {
        ...user?._count,
        tweets:
          action === "create"
            ? (user._count.tweets += 1)
            : (user._count.tweets -= 1),
      },
    };
  };

export const transformTweetReplyCount =
  (action: "create" | "delete") => (tweet?: Omit<Tweet, "replies"> | TweetReply) => {
    if (!tweet) return;

    return {
      ...tweet,
      _count: {
        ...tweet?._count,
        replies:
          action === "create"
            ? (tweet._count.replies += 1)
            : (tweet._count.replies -= 1),
      },
    };
  };

export const transformTweetRepostCount =
  (action: "create" | "delete") => (tweet?: Omit<Tweet, "replies"> | TweetReply) => {
    if (!tweet) return;

    return {
      ...tweet,
      _count: {
        ...tweet?._count,
        repost:
          action === "create"
            ? (tweet._count.repost += 1)
            : (tweet._count.repost -= 1),
      },
    };
  };

export const transformRepostTweet = (tweet: Omit<Tweet, "replies">) => {
  if (!tweet) return tweet

  let count = tweet._count.repost

  return {
    ...tweet,
    reposted: !tweet.reposted,
    _count: {
      ...tweet._count,
      repost:  !tweet.reposted ? count += 1 : count -= 1
    },
  }
}

export const transformLikeTweet = (tweet: Omit<Tweet, "replies">) => {
  if (!tweet) return tweet

  let count = tweet._count.likes

  return {
    ...tweet,
    liked: !tweet.liked,
    _count: {
      ...tweet._count,
      likes:  !tweet.liked ? count += 1 : count -= 1
    },
  }
}
export const transformRepostTweets =
  (target: Omit<Tweet, "replies">) => (prevPages?: InfiniteData<Pagination<Tweet[]>>) => {
    if (prevPages) {
      const newPages = prevPages.pages.map(({ data, ...rest }) => {
        const newData = data.map((tweet) =>
          tweet.id !== target.id ? tweet : transformRepostTweet(tweet)
        );

        return { ...rest, data: newData };
      });

      return { ...prevPages, pages: newPages };
    }

    return prevPages;
  };

export const transformLikeTweets =
  (target: Omit<Tweet, "replies">) => (prevPages?: InfiniteData<Pagination<Tweet[]>>) => {
    if (prevPages) {
      const newPages = prevPages.pages.map(({ data, ...rest }) => {
        const newData = data.map((tweet) =>
          tweet.id !== target.id ? tweet : transformLikeTweet(tweet)
        );

        return { ...rest, data: newData };
      });

      return { ...prevPages, pages: newPages };
    }

    return prevPages;
  };

export const transformLikeReplies =
  (tweet: Omit<Tweet, "replies"> | TweetReply) =>
  (data: { pagesParam: string[]; pages: Pagination<TweetReply[]>[] }) => {
    const newTweet = {
      ...tweet,
      liked: !tweet.liked,
      _count: {
        likes: !tweet.liked
          ? (tweet._count.likes += 1)
          : (tweet._count.likes -= 1),
      },
    };

    const newPages = !isTweetReply(newTweet)
      ? data.pages.map(({ data: pageData, ...rest }) => {
          return {
            ...rest,
            data: pageData.map((tw) => {
              return {
                ...tw,
                replies: tw.replies.map((rTw) => {
                  if (rTw.id !== newTweet.id) {
                    return tw;
                  }

                  return newTweet;
                }),
              };
            }),
          };
        })
      : data.pages.map(({ data: pageData, ...rest }) => {
          return {
            ...rest,
            data: pageData.map((tw) => {
              if (tw.id !== newTweet.id) {
                return tw;
              }

              return newTweet;
            }),
          };
        });

    return {
      ...data,
      pages: newPages,
    };
  };

export const transformRepostReplies =
  (tweet: Omit<Tweet, "replies"> | TweetReply) =>
  (data: { pagesParam: string[]; pages: Pagination<TweetReply[]>[] }) => {
    const newTweet = {
      ...tweet,
      reposted: !tweet.reposted,
      _count: {
        repost: !tweet.reposted
          ? (tweet._count.repost += 1)
          : (tweet._count.repost -= 1),
      },
    };

    const newPages = !isTweetReply(newTweet)
      ? data.pages.map(({ data: pageData, ...rest }) => {
          return {
            ...rest,
            data: pageData.map((tw) => {
              return {
                ...tw,
                replies: tw.replies.map((rTw) => {
                  if (rTw.id !== newTweet.id) {
                    return tw;
                  }

                  return newTweet;
                }),
              };
            }),
          };
        })
      : data.pages.map(({ data: pageData, ...rest }) => {
          return {
            ...rest,
            data: pageData.map((tw) => {
              if (tw.id !== newTweet.id) {
                return tw;
              }

              return newTweet;
            }),
          };
        });

    return {
      ...data,
      pages: newPages,
    };
  };

export const filterRepostTweet =
  (target: Omit<Tweet, "replies">) => (prevPages?: InfiniteData<Pagination<Tweet[]>>) => {
    if (prevPages) {
      const newPages = prevPages.pages.map(({ data, ...rest }) => {
        const newData = data.filter((tweet) => {
          if ( isRepost(tweet) && isRepost(target)) {
            return target.id !== tweet.id
          }

        if ( isRepost(tweet) && !isRepost(target)) {
            return target.id !== tweet.id
          }

          return true
        }).map((tweet) => {
          if (target.id === tweet.id ) {

            return transformRepostTweet(tweet)
          }


          return tweet
        });


        return { ...rest, data: newData };
      });

      return { ...prevPages, pages: newPages };
    }

    return prevPages;
  };

export const filterLikeTweet =
  (target: Omit<Tweet, "replies">) => (prevPages?: InfiniteData<Pagination<Tweet[]>>) => {
    if (prevPages) {
      const newPages = prevPages.pages.map(({ data, ...rest }) => {
        const newData = data.filter((tweet) => tweet.id !== target.id);

        return { ...rest, data: newData };
      });

      return { ...prevPages, pages: newPages };
    }

    return prevPages;
  };

export const filterTargetTweet = (tweet: Omit<Tweet, "replies">, target: Omit<Tweet, "replies">) =>  tweet.id !== target.id;

export const filterDeletedTweet = (tweet: Omit<Tweet, "replies">, target: Omit<Tweet, "replies">) =>
  filterTargetTweet(tweet, target) && tweet.replyTo?.id !== target.id;

export const filterDeletedTweets =
  (target: Omit<Tweet, "replies">) => (prevPages?: InfiniteData<Pagination<Tweet[]>>) => {
    if (prevPages) {
      const newPages = prevPages.pages.map(({ data, ...rest }) => {
        const newData = data
          .filter((tweet) => filterDeletedTweet(tweet, target))
          .map((tweet) => {
            return tweet.id !== target.replyTo?.id
              ? tweet
              : transformTweetReplyCount("delete")(tweet);
          });

        return { ...rest, data: newData };
      });

      return { ...prevPages, pages: newPages };
    }

    return prevPages;
  };

export const filterDeletedReplies =
  (target: Omit<Tweet, "replies">) =>
  (prevPages?: InfiniteData<Pagination<TweetReply[]>>) => {
    if (prevPages) {
      const newPages = prevPages.pages.map(({ data, ...rest }) => {
        const newData = data.map((tweet) => ({
          ...transformTweetReplyCount("delete")(tweet),
          replies: tweet.replies.filter((reply) => {
            return reply.id !== target.id;
          }),
        }));

        return { ...rest, data: newData };
      });

      return { ...prevPages, pages: newPages };
    }

    return prevPages;
  };
