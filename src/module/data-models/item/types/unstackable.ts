import { SmtBaseItemData } from "./skill.js";

export class SmtUnstackableData extends SmtBaseItemData {
  override get type() {
    return "unstackable" as const;
  }
}
