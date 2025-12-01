import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "@/utils/cn";

export interface UserAvatarProps {
  avatar: string | null;
  fallback: string;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({
  avatar,
  fallback,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  return (
    <Avatar className={cn("text-foreground border-5 border-black", className)}>
      {avatar && <AvatarImage src={avatar} />}
      <AvatarFallback className={cn("bg-teal-600", fallbackClassName)}>
        {fallback[0]?.toUpperCase() ?? "H"}
      </AvatarFallback>
    </Avatar>
  );
}
