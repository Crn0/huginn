import { env } from "@/configs/env";
import log from "loglevel";

if (env.NODE_ENV !== "prod") {
  log.enableAll();
} else {
  log.disableAll();
}

export const debug = (...args: unknown[]) => {
  log.debug(...args);
  log.trace();
};

export const debugWarn = (...args: unknown[]) => {
  log.warn(...args);
  log.trace();
};

export const debugError = (...args: unknown[]) => {
  log.error(...args);
  log.trace();
};

export const debugInfo = (...args: unknown[]) => {
  log.info(...args);
  log.trace();
};
