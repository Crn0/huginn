import { it, expect, vi } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";

import {
  createTweet,
  createUser,
  getUser,
  renderAppWithRouter,
} from "@/testing/test-utils";
import { DeleteTweet } from "@/features/tweets/components/delete-tweet";

const renderCreateTweet = async (onSuccess?: () => void) => {
  const fakeUser = await createUser();

  const author = getUser(fakeUser.id);

  const tweet = await createTweet({ author });

  const utils = await renderAppWithRouter(
    <DeleteTweet tweet={tweet} onSuccess={onSuccess} />,
    { user: fakeUser }
  );

  return { ...utils, tweet };
};

it("should render delete tweet dialog", async () => {
  const { user } = await act(async () => renderCreateTweet());

  await user.click(screen.getByRole("button", { name: /Delete/ }));

  expect(screen.getByRole("dialog")).toBeInTheDocument();
});

it("should call onSuccess after successfully deleting a tweet", async () => {
  const onSuccess = vi.fn();
  const { user } = await act(async () => renderCreateTweet(onSuccess));

  await user.click(screen.getByRole("button", { name: /Delete/ }));

  await user.click(screen.getByRole("button", { name: /Delete/ }));

  await waitFor(() => expect(onSuccess).toHaveBeenCalled());
});
