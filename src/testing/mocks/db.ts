import * as model from "./model";

export const db = {
  ...model,
};

export type Model = keyof typeof db;
