import type { Media } from "@/types/api";

import { Image } from "@/components/ui/image";
import { Video } from "@/components/ui/video";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export interface TweetMediaProps {
  media: Media[];
}

function TweetImage({ image }: { image: Media & { type: "IMAGE" | "GIF" } }) {
  const [lowRes, , highRes] = image.variants.sort((a, b) => a.width - b.width);

  return <Image bgImage={lowRes.url} src={highRes.url} />;
}

function TweetVideo({ video }: { video: Media & { type: "VIDEO" } }) {
  const [, , highRes] = video.variants.sort((a, b) => a.bitRate - b.bitRate);

  return <Video src={highRes.url} autoPlay loop />;
}

function Default({ media }: TweetMediaProps) {
  if (media.length > 2) return null;

  return (
    <>
      {media.map((m) => (
        <ResizablePanel key={m.id} defaultSize={50}>
          {m.type === "VIDEO" ? (
            <TweetVideo video={m} />
          ) : (
            <TweetImage image={m} />
          )}
        </ResizablePanel>
      ))}
    </>
  );
}

function LenThree({ media }: TweetMediaProps) {
  if (media.length !== 3) return null;

  const [item, ...rest] = media;

  return (
    <>
      <ResizablePanel defaultSize={50}>
        {item.type === "VIDEO" ? (
          <TweetVideo video={item} />
        ) : (
          <TweetImage image={item} />
        )}
      </ResizablePanel>

      <ResizablePanel defaultSize={25}>
        <ResizablePanelGroup direction='vertical' className='gap-1'>
          {rest.map((m) => (
            <ResizablePanel key={m.id} defaultSize={25}>
              {m.type === "VIDEO" ? (
                <TweetVideo video={m} />
              ) : (
                <TweetImage image={m} />
              )}
            </ResizablePanel>
          ))}
        </ResizablePanelGroup>
      </ResizablePanel>
    </>
  );
}

function LenFour({ media }: TweetMediaProps) {
  if (media.length !== 4) return null;
  const [item, item2, ...group2] = media;

  return (
    <>
      <ResizablePanel defaultSize={25}>
        <ResizablePanelGroup direction='vertical' className='flex h-full gap-1'>
          <div className='grid h-full gap-1'>
            {[item, item2].map((m) => (
              <ResizablePanel key={m.id} defaultSize={25}>
                {m.type === "VIDEO" ? null : <TweetImage image={m} />}
              </ResizablePanel>
            ))}
          </div>
        </ResizablePanelGroup>
      </ResizablePanel>

      <ResizablePanel defaultSize={25}>
        <ResizablePanelGroup direction='vertical'>
          <div className='grid h-full gap-1'>
            {group2.map((m) => (
              <ResizablePanel key={m.id} defaultSize={25}>
                {m.type === "VIDEO" ? (
                  <TweetVideo video={m} />
                ) : (
                  <TweetImage image={m} />
                )}
              </ResizablePanel>
            ))}
          </div>
        </ResizablePanelGroup>
      </ResizablePanel>
    </>
  );
}

export function TweetMedia({ media }: TweetMediaProps) {
  if (!media.length) return null;

  return (
    <ResizablePanelGroup direction='horizontal' className='gap-1'>
      <Default media={media} />
      <LenThree media={media} />
      <LenFour media={media} />
    </ResizablePanelGroup>
  );
}
