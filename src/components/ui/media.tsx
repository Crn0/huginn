import type { Media } from "@/types/api";

import { ImageZoom } from "./image-zoom";
import { Image } from "./image";
import { Video } from "./video";

export function Media({ media }: { media: Media }) {

  const [lowRes, , highRes] = media.type !== "VIDEO" ? media.variants.sort((a, b) => a.width - b.width) : media.variants.sort((a, b) => a.bitRate - b.bitRate);

  return media.type !== "VIDEO" ? <ImageZoom><Image bgImage={lowRes.url} src={highRes.url} /></ImageZoom> : <Video src={highRes.url} loop />
}