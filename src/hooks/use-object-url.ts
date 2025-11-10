import { useCallback, useEffect, useRef, useState } from "react";

export const useObjectUrl = (media: File | null) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const prevUrlRef = useRef<string | null>(objectUrl);

  const revokeUrl = useCallback(() => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }

    setObjectUrl(null);
  }, []);

  useEffect(() => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }

    if (!media) {
      setObjectUrl(null);
      return;
    }

    const newUrl = URL.createObjectURL(media);

    prevUrlRef.current = newUrl;
    setObjectUrl(newUrl);

    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
    };
  }, [media]);

  return [objectUrl, revokeUrl] as const;
};
