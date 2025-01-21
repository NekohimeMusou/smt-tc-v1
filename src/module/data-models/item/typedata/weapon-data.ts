import { SmtBaseItemDM } from "../types/base.js";
import { sharedAttackData } from "./shared-attack-data.js";
import { sharedEquipmentData } from "./shared-equipment-data.js";
import { sharedInventoryData } from "./shared-inventory-data.js";

export class SMTWeaponDM extends SmtBaseItemDM {
  override get itemType() {
    return "weapon" as const;
  }

  static override defineSchema() {
    return {
      ...super.defineSchema(),
      ...sharedAttackData(),
      ...sharedInventoryData(),
      ...sharedEquipmentData(),
    } as const;
  }
}
