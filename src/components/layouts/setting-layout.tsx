import { ContentLayout, type ContentLayoutProps } from "./content-layout";

export function SettingLayout({
  children,
  headerChildren,
}: Pick<ContentLayoutProps, "children" | "headerChildren">) {
  return (
    <ContentLayout
      contentClassName='border-none'
      headerClassName='justify-baseline gap-5 p-1'
      headerChildren={headerChildren}
    >
      {children}
    </ContentLayout>
  );
}
