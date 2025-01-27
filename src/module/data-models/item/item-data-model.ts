import { SmtItem } from "../../documents/item/item.js";
import { SmtStackableData } from "./types/stackable.js";
import { SmtUnstackableData } from "./types/unstackable.js";

export type StackableItem = Subtype<SmtItem, "stackable">;
export type UnstackableItem = Subtype<SmtItem, "unstackable">;

export const ITEMMODELS = {
  unstackable: SmtUnstackableData,
  stackable: SmtStackableData,
} as const;
