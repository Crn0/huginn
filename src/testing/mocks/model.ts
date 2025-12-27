import z from "zod";
import { Collection } from "@msw/data";

const baseModel = z.object({
  id: z.uuidv7(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable().default(null),
  deletedAt: z.coerce.date().nullable().default(null),
});

const mediaModel = baseModel.extend({
  type: z.enum(["IMAGE", "GIF", "VIDEO"]),
  filePath: z.string(),
  bytes: z.coerce.number(),
  url: z.string(),

  get userProfileAvatar() {
    return userModel.shape.profile.nullable().default(null);
  },
  get userProfileBanner() {
    return userModel.shape.profile.nullable().default(null);
  },
  get tweet() {
    return tweetModel.nullable().default(null);
  },
  get uploader() {
    return userModel.nullable().default(null);
  },
});

export type MediaModel = z.infer<typeof mediaModel>;

const tweetModel = baseModel
  .extend({
    content: z.string(),

    get author() {
      return userModel;
    },
    get media() {
      return z.array(mediaModel);
    },
    get replyTo() {
      return tweetModel.nullable();
    },
    get replies() {
      return z.array(tweetModel);
    },
  })
  .omit({ deletedAt: true });

export type TweetModel = z.infer<typeof tweetModel>;

const userProfileModel = baseModel
  .extend({
    displayName: z.string(),
    bio: z.string().nullable(),
    location: z.string().nullable(),
    birthday: z.coerce.date(),
    website: z.string().nullable(),

    get avatar() {
      return mediaModel.nullable();
    },
    get banner() {
      return mediaModel.nullable();
    },
  })
  .omit({ createdAt: true, updatedAt: true, deletedAt: true });

const userModel = baseModel.extend({
  email: z.email(),
  username: z.string(),
  password: z.string(),
  accountLevel: z.enum(["DEMO", "USER", "ADMIN"]).default("USER"),

  get profile() {
    return userProfileModel;
  },
  get tweets() {
    return z.array(tweetModel);
  },
  get media() {
    return z.array(mediaModel);
  },
  get followedBy() {
    return z.array(userModel);
  },
  get following() {
    return z.array(userModel);
  },
});

export type UserModel = z.infer<typeof userModel>;

const media = new Collection({ schema: mediaModel });

const tweet = new Collection({ schema: tweetModel });

const reply = new Collection({ schema: tweetModel });

const userProfile = new Collection({ schema: userProfileModel });

const user = new Collection({ schema: userModel });

media.defineRelations(({ one }) => ({
  userProfileAvatar: one(userProfile, { unique: true }),
  userProfileBanner: one(userProfile, { unique: true }),

  tweet: one(tweet, { unique: true }),
  uploader: one(user),
}));

tweet.defineRelations(({ one, many }) => ({
  author: one(user),
  media: many(media),
  replyTo: one(tweet, { role: "reply" }),
  replies: many(reply, { role: "reply" }),
}));

userProfile.defineRelations(({ one, many }) => ({
  user: one(user, { unique: true }),
  avatar: one(media),
  banner: one(media),
  media: many(media),
}));

user.defineRelations(({ many }) => ({
  tweets: many(tweet),
  replies: many(reply),
  followedBy: many(user),
  following: many(user),
}));

export { media, user, tweet, reply };
