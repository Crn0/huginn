import { it, expect, vi } from "vitest";
import { act, screen, waitFor, within } from "@testing-library/react";

import { transformAuthUser } from "@/testing/data-generators";
import { createUser, renderAppWithRouter } from "@/testing/test-utils";
import { UpdateProfile } from "@/features/users/components/update-profile";

const renderUpdateProfile = async (onSuccess?: () => void) => {
  const fakeAuthUser = await createUser();

  const authUser = transformAuthUser(fakeAuthUser);

  const utils = await renderAppWithRouter(
    <UpdateProfile
      user={authUser}
      onSuccess={onSuccess}
      renderButtonTrigger={({ open }) => (
        <button onClick={open}>
          <span>Edit profile</span>
        </button>
      )}
    />,
    { user: fakeAuthUser }
  );

  return { ...utils };
};

it("should render all editable profile fields after clicking Edit profile", async () => {
  const { user } = await act(async () => renderUpdateProfile());

  await user.click(screen.getByRole("button", { name: "Edit profile" }));

  const form = screen.getByRole("form");

  expect(form).toBeInTheDocument();

  expect(within(form).getByLabelText(/Banner/)).toBeInTheDocument();
  expect(within(form).getByLabelText(/Avatar/)).toBeInTheDocument();
  expect(within(form).getByLabelText(/Display Name/)).toBeInTheDocument();
  expect(within(form).getByLabelText(/Bio/)).toBeInTheDocument();
  expect(within(form).getByLabelText(/Location/)).toBeInTheDocument();
  expect(within(form).getByLabelText(/Website/)).toBeInTheDocument();
  expect(within(form).getByLabelText(/Date of birth/)).toBeInTheDocument();

  expect(screen.getByRole("button", { name: /Save/ })).toBeInTheDocument();
});

it("should call onSuccess after successfully updating the user's profile", async () => {
  const onSuccess = vi.fn();

  const { user } = await act(() => renderUpdateProfile(onSuccess));

  await user.click(screen.getByRole("button", { name: "Edit profile" }));

  const displayName = screen.getByLabelText(/Display Name/);
  const bio = screen.getByLabelText(/Bio/);
  const location = screen.getByLabelText(/Location/);
  const website = screen.getByLabelText(/Website/);

  const inputElements = [displayName, bio, location, website] as const;

  await Promise.all(inputElements.map((input) => user.clear(input)));

  const inputs = [
    {
      input: displayName,
      value: "krno_krno",
    },
    {
      input: bio,
      value: "hello world!",
    },
    {
      input: location,
      value: "i dunno",
    },
    {
      input: website,
      value: "https://example.com",
    },
  ] as const;

  for (const { input, value } of inputs) {
    await user.type(input, value);
  }

  await user.click(screen.getByRole("button", { name: /Save/ }));

  await waitFor(() => {
    expect(onSuccess).toHaveBeenCalled();
  });
});
