import { it, expect, vi } from "vitest";
import { act, screen, waitFor, within } from "@testing-library/react";

import { transformAuthUser } from "@/testing/data-generators";
import { createUser, renderAppWithRouter } from "@/testing/test-utils";
import { UpdatePassword } from "@/features/users/components/update-password";

const renderUpdatePassword = async (onSuccess?: () => void) => {
  const fakeAuthUser = await createUser();

  const authUser = transformAuthUser(fakeAuthUser);

  const utils = await renderAppWithRouter(
    <UpdatePassword user={authUser} onSuccess={onSuccess} />,
    { user: fakeAuthUser }
  );

  return { ...utils, authUser: fakeAuthUser };
};

it("should render update password form", async () => {
  await act(async () => renderUpdatePassword());

  const form = screen.getByRole("form");

  expect(form).toBeInTheDocument();

  expect(
    within(form).getByLabelText((content) => content === "Password")
  ).toBeInTheDocument();
  expect(within(form).getByLabelText(/Current Password/)).toBeInTheDocument();
  expect(within(form).getByLabelText(/Confirm Password/)).toBeInTheDocument();

  expect(screen.getByRole("button", { name: /Save/ })).toBeInTheDocument();
});

it("should call onSuccess after successfully updating the user's password", async () => {
  const onSuccess = vi.fn();

  const { user, authUser } = await act(() => renderUpdatePassword(onSuccess));

  await user.type(
    screen.getByLabelText(/Current Password/),
    authUser?.password as string
  );

  await user.type(
    screen.getByLabelText((content) => content === "Password"),
    "new password"
  );

  await user.type(screen.getByLabelText(/Confirm Password/), "new password");

  await user.click(screen.getByRole("button", { name: /Save/ }));

  await waitFor(() => {
    expect(onSuccess).toHaveBeenCalled();
  });
});
