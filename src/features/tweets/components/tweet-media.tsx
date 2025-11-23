import type { Media } from "@/types/api";

import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Media as MediaComponent } from "@/components/ui/media";

export interface TweetMediaProps {
  media: Media[];
}

function Default({ media }: TweetMediaProps) {
  if (media.length > 2) return null;

  return (
    <>
      {media.map((m) => (
        <ResizablePanel key={m.id} defaultSize={50}>
          {m.type === "VIDEO" ? <MediaComponent media={m} /> : <MediaComponent media={m} />}
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
          <MediaComponent media={item} />
        ) : (
          <MediaComponent media={item} />
        )}
      </ResizablePanel>

      <ResizablePanel defaultSize={25}>
        <ResizablePanelGroup direction='vertical' className='gap-1'>
          {rest.map((m) => (
            <ResizablePanel key={m.id} defaultSize={25}>
              {m.type === "VIDEO" ? <MediaComponent media={m} /> : <MediaComponent media={m} />}
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
                {m.type === "VIDEO" ? null : <MediaComponent media={m} />}
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
                {m.type === "VIDEO" ? <MediaComponent media={m} /> : <MediaComponent media={m} />}
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

  return <div className="grid w-lg">
    <ResizablePanelGroup direction='horizontal' className='gap-1'>
      <Default media={media} />
      <LenThree media={media} />
      <LenFour media={media} />
    </ResizablePanelGroup>
  </div>;
}
