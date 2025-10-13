import type { LinkComponent } from "@tanstack/react-router";
import type { VariantProps } from "class-variance-authority";
import { forwardRef, type AnchorHTMLAttributes } from "react";

import { createLink } from "@tanstack/react-router";

import { cn } from "@/utils/cn";
import { linkVariants } from "./variants/link";

export interface LinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  className?: string;
}

const BasicLinkComponent = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ variant = "link", size = "auto", className = "", ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(linkVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

const CreatedLinkComponent = createLink(BasicLinkComponent);

export const Link: LinkComponent<typeof BasicLinkComponent> = (props) => {
  return <CreatedLinkComponent {...props} />;
};
