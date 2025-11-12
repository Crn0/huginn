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
  avatarUrl: string | null;
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
  updatedAt: string | null;
}>;

export type TweetAuthor = Pick<User, "id" | "username"> & {
  profile: Pick<User["profile"], "displayName" | "avatarUrl" | "bannerUrl">;
};

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

export type Tweet = Entity<{
  content: string | null;
  author: TweetAuthor;
  liked: boolean;
  media: Media[];
  replyTo: { id: string } | null;
  updatedAt: string | null;
  _count: { replies: number; likes: number };
}>;
