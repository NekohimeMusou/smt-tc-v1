import { SmtItem } from "../../../documents/item/item.js";

export abstract class SmtBaseItemDM extends foundry.abstract.TypeDataModel {
  abstract get itemType(): ItemType;

  static override defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      itemType: new fields.StringField({
        choices: CONFIG.SMT.itemTypes,
        initial: "skill",
      }),
      effect: new fields.HTMLField(),
    } as const;
  }

  // Typescript-related hack
  protected get systemData() {
    return this as this & SmtItem["system"];
  }
}
