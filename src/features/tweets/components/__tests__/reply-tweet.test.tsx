import { it, expect, vi } from "vitest";
import { act, screen, waitFor, within } from "@testing-library/react";
import {
  createTweet,
  createUser,
  getUser,
  renderAppWithRouter,
} from "@/testing/test-utils";
import { ReplyTweet } from "@/features/tweets/components/reply-tweet";

const renderCreateTweet = async (onSuccess?: () => void) => {
  const fakeUser = await createUser();

  const createdAuthor = await createUser();

  const author = getUser(createdAuthor.id);

  const tweet = await createTweet({ author });

  const utils = await renderAppWithRouter(
    <ReplyTweet
      tweet={tweet}
      username={fakeUser.username}
      formId='test-create-tweet-form'
      onSuccess={onSuccess}
    />,
    { user: fakeUser }
  );

  return { ...utils, tweet };
};

it("should render reply tweet form", async () => {
  await act(async () => renderCreateTweet());

  const form = screen.getByRole("form");

  expect(form).toBeInTheDocument();

  expect(within(form).getByLabelText(/Content/)).toBeInTheDocument();
  expect(within(form).getByLabelText(/Media/)).toBeInTheDocument();

  expect(screen.getByRole("button", { name: /Post/ })).toBeInTheDocument();
});

it("should call onSuccess after successfully replying to a tweet", async () => {
  const onSuccess = vi.fn();
  const { user } = await act(async () => renderCreateTweet(onSuccess));

  const form = screen.getByRole("form");

  await user.type(within(form).getByLabelText(/Content/), "test tweet");

  await user.click(screen.getByRole("button", { name: /Post/ }));

  await waitFor(() => expect(onSuccess).toHaveBeenCalled());
});
