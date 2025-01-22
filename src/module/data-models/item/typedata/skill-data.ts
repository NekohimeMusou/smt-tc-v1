import { SmtBaseItemDM } from "../types/base.js";
import { sharedAttackData } from "./shared-attack-data.js";

export class SMTSkillDM extends SmtBaseItemDM {
  override get itemType() {
    return "skill" as const;
  }

  static override defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      ...sharedAttackData(),
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

  get costType(): CostType {
    const data = this.systemData;

    return data.skillType === "phys" ? "hp" : "mp";
  }
}
