import { ActionData } from "./action.js";

export class SkillData extends ActionData {
  override get type() {
    return "skill" as const;
  }

  static override defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      expended: new fields.BooleanField({ initial: false }),
    // Inheritance traits (Wing, Breath, etc)
    inheritanceTraits: new fields.StringField(),
    // Phys attack, magic attack, or spell
    actionType: new fields.StringField({
      choices: CONFIG.SMT.actionTypes,
      initial: "phys",
    }),
    selfAppliedStatus: new fields.StringField({
      choices: CONFIG.SMT.statusIds,
    }),
    focusEffect: new fields.BooleanField(),
    }
  }
}