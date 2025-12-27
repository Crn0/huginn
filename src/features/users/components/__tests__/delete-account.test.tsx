import { it, expect, vi } from "vitest";
import { act, screen, waitFor, within } from "@testing-library/react";

import { transformAuthUser } from "@/testing/data-generators";
import { createUser, renderAppWithRouter } from "@/testing/test-utils";
import { DeleteAccount } from "@/features/users/components/delete-account";

interface RenderUserOption {
  userOverrides?: {
    accountLevel?: "DEMO" | "USER" | "ADMIN";
  };
}

const { navigate } = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock(import("@tanstack/react-router"), async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    useNavigate: () => navigate,
  };
});

const renderDeleteAccount = async ({
  userOverrides,
}: RenderUserOption = {}) => {
  const fakeAuthUser = await createUser(userOverrides);

  const authUser = transformAuthUser(fakeAuthUser);

  const utils = await renderAppWithRouter(<DeleteAccount user={authUser} />, {
    user: fakeAuthUser,
  });

  return { ...utils };
};

it("should render delete account card", async () => {
  await act(async () => renderDeleteAccount());

  expect(screen.getByText("This will delete your account")).toBeInTheDocument();
  expect(
    screen.getByText(
      "You're about to start the process of deleting your Huginn account."
    )
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
});

it("should show a blocking delete-account dialog for DEMO users", async () => {
  const { user } = await act(async () =>
    renderDeleteAccount({ userOverrides: { accountLevel: "DEMO" } })
  );

  await user.click(screen.getByRole("button", { name: "Delete" }));

  const dialog = screen.getByRole("dialog");

  expect(dialog).toBeInTheDocument();

  expect(within(dialog).getByText("Delete Account")).toBeInTheDocument();
  expect(
    within(dialog).getByText("Demo account cannot delete their account.")
  ).toBeInTheDocument();
  expect(
    within(dialog).getByRole("button", { name: "Cancel" })
  ).toBeInTheDocument();
});

it("should require confirmation before deleting a USER account", async () => {
  const { user } = await act(async () =>
    renderDeleteAccount({ userOverrides: { accountLevel: "USER" } })
  );

  await user.click(screen.getByRole("button", { name: "Delete" }));

  const dialog = screen.getByRole("dialog");

  expect(dialog).toBeInTheDocument();

  expect(within(dialog).getByText("Delete Account")).toBeInTheDocument();
  expect(
    within(dialog).getByText("Are you sure you to delete your account?")
  ).toBeInTheDocument();
  expect(
    within(dialog).getByRole("button", { name: "Confirm" })
  ).toBeInTheDocument();
  expect(
    within(dialog).getByRole("button", { name: "Cancel" })
  ).toBeInTheDocument();
});

it("should call onSuccess after successfully deleting the user's account", async () => {
  const { user } = await act(() => renderDeleteAccount());

  await user.click(screen.getByRole("button", { name: "Delete" }));

  await user.click(screen.getByRole("button", { name: "Confirm" }));

  await waitFor(() => {
    expect(navigate).toHaveBeenCalled();
  });
});
