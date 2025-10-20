import type { AuthUser } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

export interface UserAvatarProps {
  user: AuthUser;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const small = user.profile.avatar?.sizes.small.url;
  const large = user.profile.avatar?.sizes.large.url;
  const fallback = user.username[0].toUpperCase();

  return (
    <Avatar className={className}>
      <AvatarImage
        src={large}
        onLoadingStatusChange={(status) => {
          console.log(status);
          if (status === "loading") return small;
          if (status === "error") return fallback;
        }}
      />
      <AvatarFallback className='bg-inherit'>{fallback}</AvatarFallback>
    </Avatar>
  );
}
