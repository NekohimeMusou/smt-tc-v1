import { SmtBaseItemDM } from "../types/base.js";
import { sharedEquipmentData } from "./shared-equipment-data.js";
import { sharedInventoryData } from "./shared-inventory-data.js";

export class SmtArmorDM extends SmtBaseItemDM {
  override get itemType() {
    return "armor" as const;
  }

  // Elemental affinities can be an AE
  static override defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      ...sharedInventoryData(),
      ...sharedEquipmentData(),
      armorSlot: new fields.StringField({ choices: CONFIG.SMT.armorSlots }),
      resistBonus: new fields.SchemaField({
        phys: new fields.NumberField({ integer: true, initial: 0 }),
        mag: new fields.NumberField({ integer: true, initial: 0 }),
      }),
    } as const;
  }
}
