import { SmtBaseItemData } from "./skill.js";

export class SmtStackableData extends SmtBaseItemData {
  override get type() {
    return "stackable" as const;
  }
}
