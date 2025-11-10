import { XIcon } from "lucide-react";

import { useObjectUrl } from "@/hooks/use-object-url";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar/avatar";

export interface MediaPreviewProps {
  media: InstanceType<typeof File>;
  onRemove: () => void;
}

export function MediaPreview({ media, onRemove }: MediaPreviewProps) {
  const [objectUrl, revokeUrl] = useObjectUrl(media);

  if (!objectUrl) return null;

  return (
    <>
      {media.type === "video/mp4" ? (
        <Card className='max-w-md flex-1 p-0'>
          <CardContent className='relative flex flex-1 p-0'>
            <CardAction className='absolute right-0 z-50 p-1'>
              <Button
                className='bg-background hover:bg-background/40 rounded-full'
                type='button'
                variant='destructive'
                size='icon'
                onClick={() => {
                  onRemove();
                  revokeUrl();
                }}
              >
                <XIcon color='white' />
              </Button>
            </CardAction>
            <video
              className='block aspect-square h-full w-full rounded-md object-fill'
              controls
            >
              <source src={objectUrl} type='video/mp4' />
            </video>
          </CardContent>
        </Card>
      ) : (
        <Card className='max-w-md flex-1 p-0'>
          <CardContent className='relative flex flex-1 p-0'>
            <CardAction className='absolute right-0 z-50 rounded-full p-1'>
              <Button
                className='bg-background hover:bg-background/40 rounded-full'
                type='button'
                variant='ghost'
                size='icon'
                onClick={onRemove}
              >
                <XIcon color='white' />
              </Button>
            </CardAction>
            <Avatar className='h-auto w-full rounded-md'>
              <AvatarImage src={objectUrl} alt={media.name} />
            </Avatar>
          </CardContent>
        </Card>
      )}
    </>
  );
}
