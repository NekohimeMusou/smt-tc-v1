import { SmtStackableData } from "./types/stackable.js";
import { SmtUnstackableData } from "./types/unstackable.js";

export const ITEMMODELS = {
  unstackable: SmtUnstackableData,
  stackable: SmtStackableData,
} as const;
