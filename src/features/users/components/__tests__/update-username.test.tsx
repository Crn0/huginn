import { it, expect, vi } from "vitest";
import { act, screen, waitFor, within } from "@testing-library/react";

import { transformAuthUser } from "@/testing/data-generators";
import { createUser, renderAppWithRouter } from "@/testing/test-utils";
import { UpdateUsername } from "@/features/users/components/update-username";

const renderUpdateUsername = async (onSuccess?: () => void) => {
  const fakeAuthUser = await createUser();

  const authUser = transformAuthUser(fakeAuthUser);

  const utils = await renderAppWithRouter(
    <UpdateUsername user={authUser} onSuccess={onSuccess} />,
    { user: fakeAuthUser }
  );

  return { ...utils };
};

it("should render update username form", async () => {
  await act(async () => renderUpdateUsername());

  const form = screen.getByRole("form");

  expect(form).toBeInTheDocument();
  expect(within(form).getByLabelText(/Username/)).toBeInTheDocument();

  expect(screen.getByRole("button", { name: /Save/ })).toBeInTheDocument();
});

it("should call onSuccess after successfully updating the user's profile", async () => {
  const onSuccess = vi.fn();

  const { user } = await act(() => renderUpdateUsername(onSuccess));

  await user.clear(screen.getByLabelText(/Username/));

  await user.type(screen.getByLabelText(/Username/), "krno");

  await user.click(screen.getByRole("button", { name: /Save/ }));

  await waitFor(() => {
    expect(onSuccess).toHaveBeenCalled();
  });
});
