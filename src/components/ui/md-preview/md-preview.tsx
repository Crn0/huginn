import createDOMPurify, { type Config } from "dompurify";
import linkify from "linkify-html";
import { marked } from "marked";

import { cn } from "@/utils/cn";

const linkifyHtml = (value: string) =>
  linkify(value, {
    validate: (_: string, type: string) => {
      if (type === "email") return false;

      return true;
    },
    formatHref: (value: string) => {
      if (/^http:\/\//.test(value)) {
        value = value.replace("http", "https");
      }
      return value;
    },
    format: (value: string) => {
      if (/^http:\/\//.test(value)) {
        value = value.replace("http", "https");
      }
      return value;
    },
    defaultProtocol: "https",
    target: "_blank",
    rel: "noopener",
  });

marked.use({
  renderer: {
    link({ href, title, text }) {
      if (href && href.startsWith("mailto:")) {
        return text;
      }

      return `<a href="${href}"${title ? ` title="${title}"` : ""}>${text}</a>`;
    },
  },
});

const DOMPurify = createDOMPurify(window);

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if ("target" in node) {
    node.setAttribute("target", "_blank");
  }
});

export type MDPreviewProps = {
  value: string;
  className?: string;
  config?: Config;
} & React.ComponentProps<"div">;

export function MDPreview({
  value,
  className,
  config,
  ...props
}: MDPreviewProps) {
  return (
    <div
      {...props}
      className={cn(
        "w-full p-2 whitespace-pre-wrap [&_a]:text-blue-500 [&>p]:text-pretty [&>p]:break-all",
        className
      )}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(marked.parse(linkifyHtml(value)) as string, {
          ...config,
        }),
      }}
    />
  );
}
