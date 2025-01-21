import { SmtBaseItemDM } from "../types/base.js";
import { sharedAttackData } from "./shared-attack-data.js";
import { sharedEquipmentData } from "./shared-equipment-data.js";
import { sharedInventoryData } from "./shared-inventory-data.js";

export class SMTSkillDM extends SmtBaseItemDM {
  override get itemType() {
    return "skill" as const;
  }

  static override defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      ...sharedAttackData(),
      ...sharedInventoryData(),
      ...sharedEquipmentData(),
      basicStrike: new fields.BooleanField(),
      // Is this an expendable skill (e.g. Luck Smiles)?
      expendable: new fields.BooleanField(),
      expended: new fields.BooleanField(),
      skillType: new fields.StringField({
        choices: CONFIG.SMT.skillTypes,
        initial: "phys",
      }),
      // Replace this with an array of strings w/ choices
      inheritanceTraits: new fields.StringField(),
    } as const;
  }
}
