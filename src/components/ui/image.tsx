import { useState } from "react";
import * as ImagePrimitive from "@radix-ui/react-avatar";

import { cn } from "@/utils/cn";
import { AspectRatio } from "./aspect-ratio";

export interface ImageProps
  extends React.ComponentProps<typeof ImagePrimitive.Image> {
  ratio?: number;
  className?: string;
  bgImage?: string;
}

export function Image({ ratio, bgImage, className, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <AspectRatio
      className='rounded-md bg-cover bg-center'
      ratio={ratio}
      style={{ backgroundImage: !loaded ? `url(${bgImage})` : "" }}
    >
      <ImagePrimitive.Avatar className='rounded-md'>
        <ImagePrimitive.Image
          className={cn(
            "block aspect-square h-full w-full rounded-md object-cover object-center opacity-0 transition-opacity delay-150 ease-in-out",
            loaded && "opacity-100",
            className
          )}
          onLoadingStatusChange={(status) => {
            if (status === "loaded" && loaded === false) {
              setLoaded(true);
            }
          }}
          {...props}
        />
      </ImagePrimitive.Avatar>
    </AspectRatio>
  );
}
