import { cn } from "@/utils/cn";
import { Card } from "../card";

export interface UserBannerProps {
  banner: string | null;
  className?: string;
}

export function UserBanner({ banner, className }: UserBannerProps) {
  return (
    <Card
      className={cn(
        "bg-background text-foreground h-50 w-full rounded-none border-black bg-size-(--avatar-banner-size) bg-no-repeat",
        className
      )}
      style={{ backgroundImage: `url(${banner})` }}
    />
  );
}
