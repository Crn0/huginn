import {
  format,
  formatDistanceStrict as originalFormatDistanceStrict,
  type DateArg,
  type FormatOptions,
  type FormatDistanceStrictOptions,
} from "date-fns";

type D = (DateArg<Date> & {}) | string;

export const formatDate = (
  date: D,
  formatStr: string,
  options?: FormatOptions
) => format(date, formatStr, options);

export const formatDistance = (
  laterDate: D,
  earlierDate: D,
  options?: FormatDistanceStrictOptions & { isUnitFirstChar: boolean }
) => {
  const distance = originalFormatDistanceStrict(
    laterDate,
    earlierDate,
    options
  );

  if (!options?.isUnitFirstChar) {
    return distance;
  }

  const time = distance
    .split(" ")
    .filter((_, i) => i <= 1)
    .map((v, i) => (Number.isNaN(Number(v)) && i <= 1 ? v[0] : v))
    .join("");

  if (!options.addSuffix) {
    return time;
  }

  const suffix = distance.split(" ")[2];

  return `${time} ${suffix}`;
};
