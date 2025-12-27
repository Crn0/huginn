import type { TweetModel, UserModel } from "./mocks/model";
import type { Tweet, User } from "@/types/api";
import type { AuthUser } from "@/lib/auth";

import {
  randUserName,
  randEmail,
  randPassword,
  randParagraph,
  randUrl,
  randCity,
} from "@ngneat/falso";

import { generateId } from "@/lib/generate-id";

export const generateUser = (overrides?: Partial<UserModel>) =>
  ({
    id: overrides?.id ?? generateId(),
    username: overrides?.username ?? randUserName({ withAccents: false }),
    email: overrides?.email ?? randEmail({ provider: "gmail" }),
    accountLevel: overrides?.accountLevel ?? "USER",
    password: overrides?.password ?? randPassword(),
    createdAt: overrides?.createdAt ?? new Date(),
    updatedAt: overrides?.updatedAt ?? null,
    deletedAt: overrides?.deletedAt ?? null,
    profile: {
      id: overrides?.id ?? generateId(),
      displayName: overrides?.profile?.displayName ?? randUserName(),
      birthday: overrides?.profile?.birthday ?? new Date(),
      bio: overrides?.profile?.bio ?? randParagraph(),
      location: overrides?.profile?.location ?? randCity(),
      website: overrides?.profile?.website ?? randUrl(),
      avatar: overrides?.profile?.avatar ?? null,
      banner: overrides?.profile?.banner ?? null,
    },
    tweets: overrides?.tweets ?? [],
    media: overrides?.media ?? [],
    followedBy: overrides?.followedBy ?? [],
    following: overrides?.following ?? [],
  }) satisfies UserModel;

export const createUser = <T extends Partial<ReturnType<typeof generateUser>>>(
  overrides?: T
) => {
  return { ...generateUser(), ...overrides };
};

export const transformAuthUser = (
  user: UserModel,
  overrides?: AuthUser
): AuthUser => ({
  ...user,
  id: overrides?.id ?? user.id,
  username: overrides?.username ?? user.username,
  profile: {
    bannerUrl: null,
    avatarUrl: null,
    ...user.profile,
    ...overrides?.profile,
  },
  createdAt: overrides?.createdAt ?? user.createdAt.toDateString(),
  openIds: overrides?.openIds ?? [],
  _count: {
    followedBy: 0,
    following: 0,
    tweets: 0,
    ...overrides?._count,
  },
});

export const transformUser = (
  user: UserModel,
  overrides?: Partial<User>
): User => ({
  ...user,
  id: overrides?.id ?? user.id,
  username: overrides?.username ?? user.username,
  followed: Boolean(overrides?.followed),
  profile: {
    bannerUrl: null,
    avatarUrl: null,
    ...user.profile,
    ...overrides?.profile,
  },
  createdAt: overrides?.createdAt ?? user.createdAt.toDateString(),
  _count: {
    followedBy: 0,
    following: 0,
    tweets: 0,
    ...overrides?._count,
  },
});

const generateTweet = () =>
  ({
    id: generateId(),
    content: randParagraph({ maxCharCount: 500 }),
    media: [],

    createdAt: new Date(),
    updatedAt: null,
    replyTo: null,
    replies: [],
  }) satisfies Omit<TweetModel, "author">;

export const createTweet = <
  T extends Partial<ReturnType<typeof generateTweet>>,
>(
  overrides: T &
    Partial<Omit<TweetModel, "author">> & { author: TweetModel["author"] }
): TweetModel => {
  const tweet = generateTweet();

  return {
    id: overrides?.id ?? tweet.id,
    author: overrides.author,
    content: overrides.content ?? tweet.content,
    media: overrides?.media ?? [],
    createdAt: overrides?.createdAt ?? tweet.createdAt,
    updatedAt: overrides?.updatedAt ?? null,
    replyTo: overrides.replyTo ?? null,
    replies: overrides.replies ?? [],
  };
};

export const transformTweet = (
  tweet: ReturnType<typeof createTweet>,
  overrides?: Partial<Omit<Tweet, "isRepost">>
): Tweet => ({
  id: overrides?.id ?? tweet.id,
  reposted: Boolean(overrides?.reposted),
  liked: Boolean(overrides?.liked),
  isRepost: false,
  content: overrides?.content ?? tweet.content,
  media: overrides?.media ?? [],
  replyTo: overrides?.replyTo ?? tweet.replyTo,
  author: {
    ...tweet.author,
    followed: false,
    profile: {
      avatarUrl: null,
      bannerUrl: null,
      ...tweet.author.profile,
      ...overrides?.author?.profile,
    },
  },
  createdAt: overrides?.createdAt ?? new Date().toDateString(),
  updatedAt: null,
  _count: {
    replies: 0,
    likes: 0,
    repost: 0,
    ...overrides?._count,
  },
});
