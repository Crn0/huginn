import { it, expect } from "vitest";
import { act, screen } from "@testing-library/react";

import { transformAuthUser } from "@/testing/data-generators";
import {
  createTweet,
  createUser,
  getUser,
  renderAppWithRouter,
} from "@/testing/test-utils";
import { Tweet } from "@/features/tweets/components/tweet";

interface RenderCreateTweetOption {
  tweetOverrides?: {
    liked?: boolean;
    reposted?: boolean;
  };
}

const renderCreateTweet = async ({
  tweetOverrides,
}: RenderCreateTweetOption = {}) => {
  const fakeUser = await createUser();

  const author = getUser(fakeUser.id);

  const tweet = await createTweet({ author, ...tweetOverrides });

  const utils = await renderAppWithRouter(
    <Tweet user={transformAuthUser(fakeUser)} tweet={tweet} />,
    { user: fakeUser }
  );

  return { ...utils, tweet };
};

it("should render tweet author and content", async () => {
  const { tweet } = await act(async () => renderCreateTweet());

  const author = tweet.author;

  expect(
    screen.getByText(author.profile.displayName as string)
  ).toBeInTheDocument();
  expect(screen.getByText(`@${author.username}`)).toBeInTheDocument();

  expect(
    await screen.findByText((content) =>
      content.includes(tweet.content as string)
    )
  ).toBeInTheDocument();
});

it("should show tweet actions", async () => {
  await act(async () => renderCreateTweet());

  expect(screen.getByTestId("reply")).toBeInTheDocument();
  expect(screen.getByTestId("repost")).toBeInTheDocument();
  expect(screen.getByTestId("like")).toBeInTheDocument();
  expect(screen.getByTestId("more")).toBeInTheDocument();
  expect(screen.getByTestId("view")).toBeInTheDocument();
  expect(screen.getByTestId("share")).toBeInTheDocument();
});

it("renders liked state", async () => {
  const { tweet } = await act(() =>
    renderCreateTweet({
      tweetOverrides: { liked: true },
    })
  );

  const likeButton = screen.getByTestId("like");

  expect(tweet.liked).toBe(true);
  expect(likeButton).toHaveClass("text-rose-400");
});

it("renders reposted state", async () => {
  const { tweet } = await act(() =>
    renderCreateTweet({
      tweetOverrides: { reposted: true },
    })
  );

  const repostButton = screen.getByTestId("repost");

  expect(tweet.reposted).toBe(true);
  expect(repostButton).toHaveClass("text-teal-400");
});

it("shows delete button when user is the author", async () => {
  const { user } = await act(async () => renderCreateTweet());

  await user.click(screen.getByTestId("more"));

  expect(screen.getByRole("button", { name: /Delete/i })).toBeInTheDocument();

  expect(
    screen.queryByRole("button", { name: /Follow/i })
  ).not.toBeInTheDocument();
});
