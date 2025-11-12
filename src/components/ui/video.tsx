import { AspectRatio } from "./aspect-ratio";

import { cn } from "@/utils/cn";

export interface VideoProps extends React.ComponentPropsWithoutRef<"video"> {
  ratio?: number;
  className?: string;
  children?: React.ReactNode;
}

export function Video({ ratio, className, children, ...props }: VideoProps) {
  return (
    <AspectRatio className='rounded-md bg-cover bg-center' ratio={ratio}>
      <video
        className={cn(
          "block aspect-square h-full w-full rounded-md object-fill object-center",
          className
        )}
        {...props}
        controls
      >
        {children}
      </video>
    </AspectRatio>
  );
}

export function Source({ ...props }: React.ComponentPropsWithoutRef<"source">) {
  return <source {...props} />;
}
