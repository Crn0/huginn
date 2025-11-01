import { format, type DateArg, type FormatOptions } from "date-fns";

export const formatDate = (
  date: DateArg<Date> & {} | string,
  formatStr: string,
  options?: FormatOptions
) => format(date, formatStr, options);
