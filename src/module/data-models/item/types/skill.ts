import { sharedItemFields } from "../fields/shared.js";
import { skillFields } from "../fields/skill.js";

export class SkillDataModel extends foundry.abstract.TypeDataModel {
  get type() {
    return "skill" as const;
  }

  static override defineSchema() {
    // const fields = foundry.data.fields;

    return {
      ...skillFields(),
      ...sharedItemFields(),
    } as const;
  }
}