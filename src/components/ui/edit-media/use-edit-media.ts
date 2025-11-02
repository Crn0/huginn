import { useCallback, useEffect, useRef, useState } from "react";

import type { Area } from "react-easy-crop";

export const useEditMedia = (imageFile: File | null) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(() =>
    imageFile ? URL.createObjectURL(imageFile) : null
  );

  const prevUrlRef = useRef<string | null>(objectUrl);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const reset = useCallback(() => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }

    setCrop({ x: 0, y: 0 });
    setRotation(0);
    setZoom(1);
    setCroppedAreaPixels(null);
    setObjectUrl(null);
  }, []);

  useEffect(() => {
    const previousUrl = prevUrlRef.current;

    if (!imageFile) {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }

      prevUrlRef.current = null;
      setObjectUrl(null);

      return;
    }

    const newUrl = URL.createObjectURL(imageFile);

    prevUrlRef.current = newUrl;
    setObjectUrl(newUrl);

    return () => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }
    };
  }, [imageFile]);

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
