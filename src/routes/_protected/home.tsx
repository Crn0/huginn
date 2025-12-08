import { createFileRoute } from "@tanstack/react-router";

import { useAuthUser } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tweets } from "@/features/tweets/components/tweets";
import { ContentLayout } from "@/components/layouts/content-layout";
import { ErrorComponent } from "@/components/errors/error-component";

export const Route = createFileRoute("/_protected/home")({
  errorComponent: ErrorComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const userQuery = useAuthUser();

  if (!userQuery.isSuccess) return null;

  const user = userQuery.data;

  return (
    <ContentLayout>
      <Tabs defaultValue='all' className='p-5'>
        <TabsList className='sticky top-10 z-30 w-full sm:top-0'>
          <TabsTrigger value='all'>
            <span className='group-data-[state=active]:border-b-5 group-data-[state=active]:border-b-blue-400'>
              For you
            </span>
          </TabsTrigger>
          <TabsTrigger value='following'>
            <span className='group-data-[state=active]:border-b-5 group-data-[state=active]:border-b-blue-400'>
              Following
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='all'>
          <Tweets username={user.username} filter={{ scope: "all" }} />
        </TabsContent>

        <TabsContent value='following'>
          <Tweets username={user.username} filter={{ scope: "following" }} />
        </TabsContent>
      </Tabs>
    </ContentLayout>
  );
}
