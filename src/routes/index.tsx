import { Await, createFileRoute, redirect } from "@tanstack/react-router";

import { tryCatch } from "@/lib/try-catch";
import { refreshToken as silentLogin } from "@/lib/auth";

import { SilentLogin } from "@/features/auth/components/silent-login";
import { LogoSplash } from "@/components/ui/logo-splash";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      const redirectTo = search.redirectTo ?? "/home";

      throw redirect({ to: redirectTo, replace: true });
    }
  },
  loader: async ({
    context: {
      auth: { isSilentLogin },
    },
  }) => {
    const refreshToken = (
      !isSilentLogin ? tryCatch(silentLogin()) : Promise.resolve({ data: null })
    ) as Promise<{ data: string | null }>;

    return { refreshToken };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { refreshToken } = Route.useLoaderData();

  return (
    <Await promise={refreshToken} fallback={<LogoSplash />}>
      {({ data: token }) => (
        <SilentLogin token={token}>{<LogoSplash />}</SilentLogin>
      )}
    </Await>
  );
}
