export const buildQueryParam = <T extends Record<string, string>>(
  param: T | undefined
) => {
  const search = new URLSearchParams();

  Object.entries(param ?? {}).forEach(([key, value]) => {
    if (value) {
      search.set(key, value);
    }
  });

  return search.toString();
};
