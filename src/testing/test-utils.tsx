import type { TweetModel, UserModel } from "./mocks/model";
import type { User } from "@/types/api";

import React from "react";

import {
  CatchBoundary,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthStoreProvider, ClientProvider } from "@/lib/provider";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NotFoundError } from "@/lib/errors";
import {
  generateUser,
  createTweet as generateTweet,
  transformTweet,
} from "./data-generators";
import { db } from "./mocks/db";
import { authenticate, hash } from "./mocks/utils";
import { setToken } from "@/lib/provider/auth/store";

export const createUser = async (
  overrides?: Partial<UserModel> & Partial<User>
) => {
  const user = generateUser(overrides);
  try {
    await db.user.create({ ...user, password: hash(user.password) });
  } catch (error) {
    console.log(error, "foo");
  }
  return user;
};

export const createTweet = async ({
  content,
  liked,
  reposted,
  author,
}: {
  content?: string;
  liked?: boolean;
  reposted?: boolean;
  author: UserModel;
}) => {
  const tweet = generateTweet({ content, author });
  const res = await db.tweet.create(tweet);
  return transformTweet(res, { liked, reposted });
};

export const replyTo = async ({
  content,
  liked,
  reposted,
  replyTo,
  author,
}: {
  content?: string;
  liked?: boolean;
  reposted?: boolean;
  author: UserModel;
  replyTo: TweetModel;
}) => {
  const tweet = generateTweet({ content, author });
  const res = await db.reply.create({
    ...tweet,
    replyTo: {
      ...replyTo,
      author: replyTo.author ?? null,
    },
  });
  return transformTweet(res, { liked, reposted });
};

export const followUser = async ({
  user,
  followUser,
}: {
  user: UserModel;
  followUser: UserModel;
}) => {
  const [followedUser, followingUser] = await Promise.all([
    db.user.update((q) => q.where({ id: followUser.id }), {
      data(_user) {
        _user.followedBy = [..._user.followedBy, user];
      },
    }),
    db.user.update((q) => q.where({ id: user.id }), {
      data(_user) {
        _user.following = [..._user.following, followUser];
      },
    }),
  ]);

  return { user: followingUser, followUser: followedUser };
};

export const updateUsername = async (id: string, username: string) => {
  const user = await db.user.update((q) => q.where({ id }), {
    data(_user) {
      _user.username = username;
    },
  });

  return user;
};

export const updateUserProfile = async (
  id: string,
  profile: Partial<UserModel["profile"]>
) => {
  const user = await db.user.update((q) => q.where({ id }), {
    data(_user) {
      const _profile = _user.profile;

      _user.profile = {
        ..._profile,
        displayName: profile.displayName ?? _profile.displayName,
        bio: profile.bio ?? _profile.bio,
        location: profile.location ?? _profile.location,
        birthday: profile.birthday ?? _profile.birthday,
        website: profile.website ?? _profile.website,
        avatar: profile.avatar ?? _profile.avatar,
        banner: profile.banner ?? _profile.banner,
      };
    },
  });

  return user;
};

export const updateUserPassword = async (id: string, password: string) => {
  const user = await db.user.update((q) => q.where({ id }), {
    data(_user) {
      _user.password = password;
    },
  });

  return user;
};

export const getUser = (id: string) => {
  const user = db.user.findFirst((q) => q.where({ id }));

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
};

export const getTweet = (id: string) => {
  const tweet = db.tweet.findFirst((q) => q.where({ id }));

  if (!tweet) {
    throw new NotFoundError("Tweet not found");
  }

  return tweet;
};

export const deleteAccount = (id: string) =>
  db.user.delete((q) => q.where({ id }));

export const unfollowUser = async ({
  user,
  unfollowUser,
}: {
  user: UserModel;
  unfollowUser: UserModel;
}) => {
  const [followedUser, followingUser] = await Promise.all([
    db.user.update((q) => q.where({ id: unfollowUser.id }), {
      data(_user) {
        _user.followedBy = _user.followedBy.filter((u) => u.id !== user.id);
      },
    }),
    db.user.update((q) => q.where({ id: user.id }), {
      data(_user) {
        _user.following = _user.followedBy.filter(
          (u) => u.id !== unfollowUser.id
        );
      },
    }),
  ]);

  return { user: followingUser, unfollowUser: followedUser };
};

export const deleteTweet = (id: string) => {
  const tweet = db.tweet.delete((q) => q.where({ id }));

  if (!tweet) {
    throw new NotFoundError("Tweet not found");
  }

  return tweet;
};

export const loginAsUser = (user: { email: string; password: string }) => {
  const authUser = authenticate(user);

  return authUser;
};

const initializeUser = async (
  user?: Awaited<ReturnType<typeof createUser>> | null
) => {
  if (typeof user === "undefined") {
    const newUser = await createUser();

    const auth = loginAsUser(newUser);

    setToken(auth.accessToken);

    return auth;
  } else if (user) {
    const auth = loginAsUser(user);

    setToken(auth.accessToken);

    return auth;
  } else {
    return null;
  }
};

export const renderApp = async (
  ui: React.ReactElement,
  options?: RenderOptions & {
    user?: Awaited<ReturnType<typeof createUser>> | null;
  }
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const user = options?.user;

  if (options?.user) {
    delete options.user;
  }

  const initializedUser = await initializeUser(user);

  return {
    queryClient,
    initializedUser,
    user: userEvent.setup(),
    ...render(
      <CatchBoundary getResetKey={() => "reset"}>
        <QueryClientProvider client={queryClient}>
          <AuthStoreProvider>
            <ClientProvider>{ui}</ClientProvider>
          </AuthStoreProvider>
        </QueryClientProvider>
      </CatchBoundary>,
      options
    ),
  };
};

export const renderAppWithRouter = async (
  ui: React.ReactElement,
  options?: RenderOptions & {
    user?: Awaited<ReturnType<typeof createUser>> | null;
  }
) => {
  const rootRoute = createRootRoute({
    component: () => ui,
  });
  const router = createRouter({
    routeTree: rootRoute,
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const user = options?.user;

  if (options?.user) {
    delete options.user;
  }

  const initializedUser = await initializeUser(user);

  return {
    queryClient,
    initializedUser,
    user: userEvent.setup(),
    ...render(
      <CatchBoundary getResetKey={() => "reset"}>
        <QueryClientProvider client={queryClient}>
          <AuthStoreProvider>
            <ClientProvider>
              <RouterProvider router={router} />
            </ClientProvider>
          </AuthStoreProvider>
        </QueryClientProvider>
      </CatchBoundary>,
      options
    ),
  };
};
