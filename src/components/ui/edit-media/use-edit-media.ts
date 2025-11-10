import { useObjectUrl } from "@/hooks/use-object-url";
import { useCallback, useState } from "react";

import type { Area } from "react-easy-crop";

export const useEditMedia = (imageFile: File | null) => {
  const [objectUrl, revokeUrl] = useObjectUrl(imageFile);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const reset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setRotation(0);
    setZoom(1);
    setCroppedAreaPixels(null);
    revokeUrl();
  }, [revokeUrl]);

  return {
    objectUrl,
    crop,
    rotation,
    zoom,
    croppedAreaPixels,
    setCrop,
    setRotation,
    setZoom,
    setCroppedAreaPixels,
    reset,
  } as const;
};
