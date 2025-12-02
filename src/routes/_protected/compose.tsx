import z from "zod";

import { Undo2Icon } from "lucide-react";

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ContentLayout } from "@/components/layouts/content-layout";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { ErrorComponent } from "@/components/errors/error-component";

const searchParamSchema = z.object({
  replyTo: z.uuidv7().optional().catch(undefined),
});

export type ComposeSearchParam = z.infer<typeof searchParamSchema>;

export const Route = createFileRoute("/_protected/compose")({
  validateSearch: (search) => searchParamSchema.parse(search),
  errorComponent: ErrorComponent,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ContentLayout
      headerChildren={
        <>
          <Button variant='outline' asChild>
            <Link
              to={"/home"}
              className='text-foreground border-none bg-none sm:hidden'
            >
              <Undo2Icon />
            </Link>
          </Button>
        </>
      }
    >
      <Outlet />
    </ContentLayout>
  );
}
