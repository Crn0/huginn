import linkify from "linkify-html";

const validate = (_: string, type: string) => {
  if (type === "email") return false;

  return true;
};

const formatHref = (value: string) => {
  if (/^http:\/\//.test(value)) {
    value = value.replace("http", "https");
  }
  return value;
};

const format = (value: string) => {
  if (/^http:\/\//.test(value)) {
    value = value.replace("http", "https");
  }
  return value;
};

export const linkifyHtml = (value: string) =>
  linkify(value, {
    validate,
    formatHref,
    format,
    defaultProtocol: "https",
    target: "_blank",
    rel: "noopener",
  });
