import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/utils/cn";

import {
  useInfiniteScroll,
  type UseInfiniteScrollOptions,
} from "@/hooks/use-infinite-scroll";

export interface InfiniteScrollProps
  extends React.ComponentProps<"div">,
    UseInfiniteScrollOptions {
  testId?: string;
  loadMore: () => void;
  className?: string;
  canLoadMore: boolean;
  asChild?: boolean;
}

export function InfiniteScroll({
  testId,
  loadMore,
  asChild,
  className = "",
  ...props
}: InfiniteScrollProps) {
  const {
    canLoadMore,
    isLoading,
    delay,
    root,
    rootMargin,
    threshold,
    ...rest
  } = props;

  const Comp = asChild ? Slot : "div";

  const setRef = useInfiniteScroll(loadMore, {
    canLoadMore,
    isLoading,
    delay,
    root,
    rootMargin,
    threshold,
  });

  return (
    <Comp
      {...rest}
      data-testid={testId}
      ref={setRef}
      className={cn("flex h-px justify-center-safe", className)}
    />
  );
}
