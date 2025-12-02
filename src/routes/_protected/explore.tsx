import z from "zod";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { cn } from "@/utils/cn";

import { ErrorComponent } from "@/components/errors/error-component";
import { ContentLayout } from "@/components/layouts/content-layout";
import { Search } from "@/features/explore/components/search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserList } from "@/features/users/components/user-list";
import { TweetList } from "@/features/tweets/components/tweet-list";

const searchParamSchema = z.object({
  q: z.string().min(1, { error: "Required" }).optional(),
  f: z.enum(["users", "posts"]).default("users").catch("users"),
});

export const Route = createFileRoute("/_protected/explore")({
  validateSearch: (search) => searchParamSchema.parse(search),
  errorComponent: ErrorComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const [isFocus, setIsFocus] = useState(false);

  return (
    <ContentLayout
      headerClassName='flex-1 justify-baseline gap-5 p-1  lg:flex static'
      contentClassName={cn(isFocus && "hidden sm:flex")}
      headerChildren={
        <>
          <Search isFocus={isFocus} focus={setIsFocus} />
        </>
      }
    >
      <Tabs defaultValue={search.f} className='flex-1'>
        <TabsList className='flex w-full rounded-none'>
          <TabsTrigger
            value='users'
            onClick={() => navigate({ search: { q: search.q, f: "users" } })}
          >
            <span className='group-data-[state=active]:border-b-5 group-data-[state=active]:border-b-blue-400'>
              People
            </span>
          </TabsTrigger>
          <TabsTrigger
            value='posts'
            onClick={() => navigate({ search: { q: search.q, f: "posts" } })}
          >
            <span className='group-data-[state=active]:border-b-5 group-data-[state=active]:border-b-blue-400'>
              Latest
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='users'>
          <UserList />
        </TabsContent>

        <TabsContent value='posts'>
          <TweetList filter={{ scope: "all", search: search.q ?? " "}} enabled={!!search.q}/>
        </TabsContent>
      </Tabs>
    </ContentLayout>
  );
}
