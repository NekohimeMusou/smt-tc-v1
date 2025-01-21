import { SmtBaseItemDM } from "../types/base.js";
import { sharedAttackData } from "./shared-attack-data.js";
import { sharedEquipmentData } from "./shared-equipment-data.js";
import { sharedInventoryData } from "./shared-inventory-data.js";

export class SMTGunDM extends SmtBaseItemDM {
  override get itemType() {
    return "gun" as const;
  }

  static override defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      ...sharedAttackData(),
      ...sharedInventoryData(),
      ...sharedEquipmentData(),
      ammo: new fields.SchemaField({
        min: new fields.NumberField({ integer: true, initial: 0 }),
        max: new fields.NumberField({ integer: true, initial: 0, min: 1 }),
        value: new fields.NumberField({ integer: true, initial: 0 }),
      }),
    } as const;
  }
}
