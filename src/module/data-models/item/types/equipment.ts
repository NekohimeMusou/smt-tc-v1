import { BaseItemData } from "./base.js";

export abstract class Equipment extends BaseItemData {
  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      equipped: new fields.BooleanField(),
    };
  }
}