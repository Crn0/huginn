import { buildQueryParam } from "./build-query-param";

export const buildResourcePath = <Filter extends Record<string, string>>(
  resource: string,
  page: string,
  filter?: Filter
) => {
  const query = buildQueryParam(filter);
  const _resource = !page ? resource : page;

  if (!query || page.includes(query)) return _resource;

  const separator = _resource.includes("?") ? "&" : "?";

  return `${_resource}${separator}${query}`;
};
