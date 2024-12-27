import { SmtActor } from "../../../documents/actor/actor.js";
import { SmtItem } from "../../../documents/item/item.js";
import { attackDataFields } from "../fields/attack.js";
import { sharedItemFields } from "../fields/shared-fields.js";
import { skillFields } from "../fields/skill-fields.js";

export class SmtSkillDataModel extends foundry.abstract.TypeDataModel {
  get type() {
    return "skill" as const;
  }

  static override defineSchema() {
    return {
      ...attackDataFields(),
      ...skillFields(),
      ...sharedItemFields(),
    } as const;
  }

  get damageType(): DamageType {
    const data = this.#systemData;

    const skillType = data.skillType;

    return skillType === "phys" || skillType === "gun" ? "phys" : "mag";
  }

  get tn(): number {
    const actor = this.parent?.parent as SmtActor;
    if (!actor) return 1;

    const data = this.#systemData;

    const sureShotMod = data.isGun && actor.system.sureShot ? 10 : 0;

    return data.accuracyStat === "auto"
      ? 100
      : actor.system.stats[data.accuracyStat].tn +
          data.tnMod +
          actor.system.buffs.accuracy +
          sureShotMod;
  }

  get power(): number {
    const actor = this.parent?.parent as SmtActor;
    const data = this.#systemData;

    const basePower = actor.system.power[data.damageType];

    return data.potency + basePower;
  }

  get autoFailThreshold(): number {
    const actor = this.parent?.parent as SmtActor;
    return actor?.system.autoFailThreshold;
  }

  get costType(): SkillCostType {
    const data = this.#systemData;

    const skillType = data.skillType;

    return skillType === "phys" ? "hp" : "mp";
  }

  // Typescript-related hack
  get #systemData() {
    return this as this & SmtItem["system"];
  }
}
