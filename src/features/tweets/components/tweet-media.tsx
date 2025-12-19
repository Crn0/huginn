import type { Media } from "@/types/api";

import { cn } from "@/utils/cn";

import { Media as MediaComponent } from "@/components/ui/media";

export interface TweetMediaProps {
  media: Media[];
  className?: string;
}

export function TweetMedia({ media, className }: TweetMediaProps) {
  if (!media.length) return null;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-1 w-xs self-center-safe",
        media.length > 1 && "grid-cols-2",
        media.length > 2 && "w-3xs",
        className
      )}
    >
      {media.map((m, i) => (
        <MediaComponent
          key={m.id}
          media={m}
          className={cn(media.length === 3 && i === 2 && "col-span-2")}
        />
      ))}
    </div>
  );
}
