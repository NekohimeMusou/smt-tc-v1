import { SmtActor } from "../../../documents/actor/actor.js";
import { SmtItem } from "../../../documents/item/item.js";
import { sharedItemFields } from "../fields/shared-fields.js";
import { skillFields } from "../fields/skill-fields.js";

export class SmtSkillDataModel extends foundry.abstract.TypeDataModel {
  get type() {
    return "skill" as const;
  }

  static override defineSchema() {
    return {
      ...skillFields(),
      ...sharedItemFields(),
    } as const;
  }

  override prepareBaseData() {
    const data = this.#systemData;

    const actor = this.parent.parent as SmtActor;

    // @ts-expect-error This field isn't readonly
    data.tn =
      data.accuracyStat === "auto"
        ? 100
        : (actor?.system.stats[data.accuracyStat].tn ?? 1) + data.tnMod;

    // @ts-expect-error This field isn't readonly
    data.basePower = actor?.system.power[data.powerCategory] ?? 0;

    // @ts-expect-error This field isn't readonly
    data.power = data.potency + data.basePower;
  }

  // Typescript-related hack
  get #systemData() {
    return this as this & SmtItem["system"];
  }
}
