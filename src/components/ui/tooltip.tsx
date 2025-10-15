import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/utils/cn";

const useHasHover = () => {
  try {
    return matchMedia("(hover: hover)").matches;
  } catch {
    // Assume that if browser too old to support matchMedia it's likely not a touch device
    return true;
  }
};

type TooltipTriggerContextType = {
  supportMobileTap: boolean;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const TooltipTriggerContext = React.createContext<TooltipTriggerContextType>({
  supportMobileTap: false,
  open: false,
  setOpen: () => {},
});

export function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot='tooltip-provider'
      delayDuration={delayDuration}
      {...props}
    />
  );
}

export function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root> & {
  supportMobileTap?: boolean;
}) {
  const [open, setOpen] = React.useState<boolean>(props.defaultOpen ?? false);

  const hasHover = useHasHover();

  return (
    <TooltipProvider>
      <TooltipTriggerContext.Provider
        value={{
          open,
          setOpen,
          supportMobileTap: props.supportMobileTap ?? false,
        }}
      >
        <TooltipPrimitive.Root
          data-slot='tooltip'
          delayDuration={
            !hasHover && props.supportMobileTap ? 0 : props.delayDuration
          }
          onOpenChange={setOpen}
          open={open}
          {...props}
        />
      </TooltipTriggerContext.Provider>
    </TooltipProvider>
  );
}

export function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  const hasHover = useHasHover();
  const { setOpen, supportMobileTap } = React.useContext(TooltipTriggerContext);

  const { onClick: onClickProp } = props;

  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!hasHover && supportMobileTap) {
        e.preventDefault();
        setOpen(true);
      } else {
        onClickProp?.(e);
      }
    },
    [setOpen, hasHover, supportMobileTap, onClickProp]
  );

  return (
    <TooltipPrimitive.Trigger
      data-slot='tooltip-trigger'
      {...props}
      onClick={onClick}
    />
  );
}

export function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot='tooltip-content'
        sideOffset={sideOffset}
        className={cn(
          "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className='bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]' />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
