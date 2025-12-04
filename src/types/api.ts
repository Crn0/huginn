export type BaseEntity = {
  id: string;
  createdAt: string;
};

export type Entity<T> = {
  [K in keyof T]: T[K];
} & BaseEntity;

export type Pagination<T extends unknown[]> = {
  data: T;
  nextHref: string | null;
  prevHref: string | null;
  nextCursor: string | null;
  prevCursor: string | null;
  total: number;
};

export type User = Entity<{
  username: string;
  followed: boolean;
  profile: {
    displayName: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
  };
  _count: {
    followedBy: number;
    following: number;
    tweets: number;
  };
}>;

export type FollowUser = Omit<User, "updatedAt" | "_count" | "profile"> & {
  profile: Pick<User["profile"], "displayName" | "avatarUrl" | "bio">;
};

export type TweetAuthor = Pick<User, "id" | "username" | "followed"> & {
  profile: Pick<User["profile"], "displayName" | "avatarUrl" | "bannerUrl">;
};

export type Reposter =  Omit<TweetAuthor, "followed" | "profile"> & { profile: Pick<TweetAuthor["profile"], "displayName"> }

export type Video = Entity<{
  url: string;
  type: "VIDEO";
  height: number;
  width: number;
  variants: {
    bitRate: number;
    contentType: "video/mp4";
    url: string;
  }[];
  tweet: {
    id: string;
  } | null;
}>;

export type Image = Entity<{
  url: string;
  type: "IMAGE" | "GIF";
  variants: {
    height: number;
    width: number;
    contentType:
      | "image/jpeg"
      | "image/jpg"
      | "image/png"
      | "image/webp"
      | "image/gif";
    url: string;
  }[];
  tweet: {
    id: string;
  } | null;
}>;

export type Media = Video | Image;

type BaseTweet = Entity<{
  content: string | null;
  author: TweetAuthor;
  reposted: boolean;
  liked: boolean;
  media: Media[];
  replyTo: Pick<BaseEntity, "id"> | null;
  updatedAt: string | null;
  isRepost: boolean
  _count: { replies: number; repost:number, likes: number };
}>;

export type Repost = Entity<
  BaseTweet & {isRepost: true, repostId: string, reposter: Reposter }
>;

export type Tweet = Entity<
  BaseTweet & { isRepost: false }
> | Repost;

export type TweetReply = Tweet & {
  replies: (Omit<Tweet, "replyTo"> & { replyTo: { id: string } })[];
};

export type TweetLike = Tweet | TweetReply | TweetReply["replies"][number]

export type Replies = TweetReply["replies"] | Tweet[] | TweetReply[]