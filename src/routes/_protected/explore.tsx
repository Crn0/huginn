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
import { MediaList } from "@/features/media/components/media-list";

const searchParamSchema = z.object({
  q: z.string().min(1, { error: "Required" }).optional(),
  f: z.enum(["users", "posts", "media"]).default("users").catch("users"),
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

  const triggerButtons = [
    {
      value: "users",
      name: "People",
    },
    {
      value: "posts",
      name: "Latest",
    },
    {
      value: "media",
      name: "Media",
    },
  ] as const;

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
          {triggerButtons.map(({ value, name }) => (
            <TabsTrigger
              key={value}
              value={value}
              onClick={() => navigate({ search: { q: search.q, f: value } })}
            >
              <span className='group-data-[state=active]:border-b-5 group-data-[state=active]:border-b-blue-400'>
                {name}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value='users'>
          <UserList />
        </TabsContent>

        <TabsContent value='posts'>
          <TweetList
            filter={{ scope: "all", search: search.q ?? " " }}
            enabled={!!search.q}
          />
        </TabsContent>

        <TabsContent value='media'>
          <MediaList search={search.q ?? ""} />
        </TabsContent>
      </Tabs>
    </ContentLayout>
  );
}
