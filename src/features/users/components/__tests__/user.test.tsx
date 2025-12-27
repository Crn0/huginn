import { it, expect, vi } from "vitest";
import { act, screen } from "@testing-library/react";

import { transformAuthUser, transformUser } from "@/testing/data-generators";
import { createUser, renderAppWithRouter } from "@/testing/test-utils";
import * as followApi from "@/features/follow/api/follow";
import { User } from "@/features/users/components/user";

type UseToggleFollowUser = ReturnType<typeof followApi.useToggleFollowUser>;

interface RenderUserOption {
  isAuthUser?: boolean;
  userOverrides?: {
    followed?: boolean;
  };
}

const { mockedMutate } = vi.hoisted(() => ({
  mockedMutate: vi
    .fn()
    .mockResolvedValue(new Response()) as UseToggleFollowUser["mutate"],
}));

vi.mock(import("@/features/follow/api/follow"), async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    useToggleFollowUser: () => {
      return {
        mutate: mockedMutate,
      } as UseToggleFollowUser;
    },
  };
});

const renderUser = async ({
  isAuthUser,
  userOverrides,
}: RenderUserOption = {}) => {
  const fakeAuthUser = await createUser();
  const fakeUser = transformUser(await createUser(), userOverrides);

  const utils = await renderAppWithRouter(
    <User
      authUser={transformAuthUser(fakeAuthUser)}
      user={isAuthUser ? transformUser(fakeAuthUser) : fakeUser}
    />,
    { user: fakeAuthUser }
  );

  return { ...utils, viewUser: fakeUser };
};

it("should render username, displayname, bio and avatar fallback", async () => {
  const { viewUser } = await act(async () => renderUser());

  expect(
    screen.getByText(viewUser.profile.displayName as string)
  ).toBeInTheDocument();
  expect(screen.getByText(`@${viewUser.username}`)).toBeInTheDocument();
  expect(screen.getByText(viewUser.profile.bio as string)).toBeInTheDocument();
  expect(
    screen.getByText(viewUser.username[0]?.toUpperCase() as string)
  ).toBeInTheDocument();
});

it("should render follow button", async () => {
  await act(() => renderUser());

  expect(screen.getByRole("button", { name: /follow/i })).toBeInTheDocument();
});

it("should not render follow button when the authUser and use are the sa,e", async () => {
  await act(() =>
    renderUser({
      isAuthUser: true,
    })
  );

  expect(
    screen.queryByRole("button", { name: /follow/i })
  ).not.toBeInTheDocument();
});

it("renders unfollowed state", async () => {
  await act(() => renderUser({}));

  expect(screen.getByText(/follow/i)).toBeInTheDocument();
});

it("renders followed state", async () => {
  await act(() =>
    renderUser({
      userOverrides: { followed: true },
    })
  );

  expect(screen.getByText(/unfollow/i)).toBeInTheDocument();
});

it("allows user to follow and unfollow", async () => {
  const { user } = await act(() =>
    renderUser({
      userOverrides: { followed: false },
    })
  );

  await user.click(screen.getByRole("button", { name: /follow/i }));

  expect(mockedMutate).toHaveBeenCalledTimes(1);

  await act(() =>
    renderUser({
      userOverrides: { followed: true },
    })
  );

  await user.click(screen.getByRole("button", { name: /unfollow/i }));

  expect(mockedMutate).toHaveBeenCalledTimes(2);
});
