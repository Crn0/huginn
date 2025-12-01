import { useCallback, useEffect, useRef, useState } from "react";

export interface UseInfiniteScrollOptions extends IntersectionObserverInit {
  canLoadMore: boolean;
  isLoading: boolean;
  delay?: number;
}

export const useInfiniteScroll = (
  loadMore: () => void,
  options: UseInfiniteScrollOptions = {
    isLoading: false,
    canLoadMore: false,
    root: null,
    rootMargin: "0px",
    threshold: 0,
    delay: 0,
  }
) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const [nodeRef, setNode] = useState<HTMLElement | null>(null);

  const setNodeRef = useCallback((node: HTMLElement | null) => {
    setNode(node);
  }, []);

  useEffect(() => {
    if (options.isLoading || !options.canLoadMore || !nodeRef) return () => {};

    const { root, rootMargin, threshold, delay } = options;

    observer.current = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          if (delay) {
            if (timeoutId.current) clearTimeout(timeoutId.current);

            timeoutId.current = setTimeout(() => {
              loadMore();
            }, delay);
          } else {
            loadMore();
          }
        }
      },
      { root, rootMargin, threshold }
    );

    observer.current.observe(nodeRef);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loadMore, options, nodeRef]);

  return setNodeRef;
};
