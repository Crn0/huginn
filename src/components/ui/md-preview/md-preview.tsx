import createDOMPurify, { type Config } from "dompurify";

import type { parse as Parse } from "marked";

import { cn } from "@/utils/cn";

export type MDPreviewProps = {
  value: string;
  parse: typeof Parse;
  className?: string;
  config?: Config;
};

const DOMPurify = createDOMPurify(window);

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if ("target" in node) {
    node.setAttribute("target", "_blank");
  }
});

export function MDPreview({ parse, value, className, config }: MDPreviewProps) {
  return (
    <div
      className={cn("w-full p-2", className)}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(parse(value) as string, { ...config }),
      }}
    />
  );
}
