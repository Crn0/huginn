import z from "zod";

import { createFileRoute, Outlet } from "@tanstack/react-router";

const searchParamSchema = z.object({
  replyTo: z.uuidv7().optional().catch(undefined),
});

export type ComposeSearchParam = z.infer<typeof searchParamSchema>;

export const Route = createFileRoute("/_protected/compose")({
  validateSearch: (search) => searchParamSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div>Hello "/_protected/_compose"!</div>
      <Outlet />
    </>
  );
}
