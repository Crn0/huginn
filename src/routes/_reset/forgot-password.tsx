import { RequestResetPasswordForm } from "@/features/auth/components/request-reset-password-form";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { ContentLayout } from "@/components/layouts/content-layout";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_reset/forgot-password")({
  component: RouteComponent,
});

function RouteComponent() {
  const onSuccess = () => {
    toast.success("Email has been sent");
  };

  return (
    <ContentLayout contentClassName='justify-center-safe items-center-safe'>
      <Toaster position='top-center' richColors />
      <RequestResetPasswordForm onSuccess={onSuccess} />
    </ContentLayout>
  );
}
