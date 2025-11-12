import { marked } from "marked";

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

export const parse = marked.parse;
