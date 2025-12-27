import { it, expect } from "vitest";
import { act, screen, within } from "@testing-library/react";

import { renderAppWithRouter } from "@/testing/test-utils";
import { SignupCard } from "../signup-card";

const renderSignupCard = () => {
  const utils = renderAppWithRouter(<SignupCard onSuccess={() => {}} />, {
    user: null,
  });

  return utils;
};

it("should render the signup card", async () => {
  await act(() => renderSignupCard());

  expect(screen.getByText(/Join Huginn today/)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /Create Account/ })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /Continue with Google/ })
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Log in/ })).toBeInTheDocument();
});

it("should render the signup form when the user clicked the 'Create Account' button", async () => {
  const { user } = await act(() => renderSignupCard());

  await user.click(screen.getByRole("button", { name: /Create Account/ }));

  const form = screen.getByRole("form");

  expect(form).toBeInTheDocument();

  expect(within(form).getByLabelText(/Display Name/)).toBeInTheDocument();
  expect(within(form).getByLabelText(/Email/)).toBeInTheDocument();
  expect(within(form).getByLabelText(/Password/)).toBeInTheDocument();
  expect(within(form).getByLabelText(/Date of birth/)).toBeInTheDocument();

  expect(screen.getByRole("button", { name: /Submit/ })).toBeInTheDocument();
});

it("should show the tooltip on pointerover and close on pointer leave", async () => {
  const { user } = await act(() => renderSignupCard());

  await user.click(screen.getByRole("button", { name: /Create Account/ }));

  const tooltipTrigger = screen.getByText(/Password requirements/);

  await user.hover(tooltipTrigger);

  expect(screen.getByRole("tooltip")).toBeInTheDocument();
});

it("should close the signup form when the user clicked the 'Close' button", async () => {
  const { user } = await act(() => renderSignupCard());

  await user.click(screen.getByRole("button", { name: /Create Account/ }));

  await user.click(screen.getByRole("button", { name: /Close/ }));

  expect(screen.queryByRole("form")).not.toBeInTheDocument();
});
