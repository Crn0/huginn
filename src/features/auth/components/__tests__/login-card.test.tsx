import type { Route as BaseRoute } from "@tanstack/react-router";
import { it, expect } from "vitest";
import { act, screen, within } from "@testing-library/react";
import { initRootRoute, renderAppWithRouter } from "@/testing/test-utils";
import { LoginCard } from "@/features/auth/components/login-card";

export declare const Route: BaseRoute;

const renderLoginCard = () => {
  const routes = [{ path: "/login", component: () => <LoginCard /> }] as const;

  const routeRoot = initRootRoute(routes);

  const utils = renderAppWithRouter(routeRoot, ["/login/"]);

  return utils;
};

it("should render the login card", async () => {
  await act(async () => renderLoginCard());

  expect(screen.getByText(/Sign in to Huginn/)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /Continue with Huginn/ })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /Continue with Google/ })
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Sign up/ })).toBeInTheDocument();
});

it("should render the login form when the user clicked the 'Continue with Huginn' button", async () => {
  const { user } = await act(async () => renderLoginCard());

  await user.click(
    screen.getByRole("button", { name: /Continue with Huginn/ })
  );

  const form = screen.getByRole("form");

  expect(form).toBeInTheDocument();

  expect(within(form).getByLabelText(/Email/)).toBeInTheDocument();
  expect(within(form).getByLabelText(/Password/)).toBeInTheDocument();

  expect(screen.getByRole("button", { name: /Submit/ })).toBeInTheDocument();
});

it("should close the login form when the user clicked the 'Close' button", async () => {
  const { user } = await act(async () => renderLoginCard());

  await user.click(
    screen.getByRole("button", { name: /Continue with Huginn/ })
  );

  await user.click(screen.getByRole("button", { name: /Close/ }));

  expect(screen.queryByRole("form")).not.toBeInTheDocument();
});
