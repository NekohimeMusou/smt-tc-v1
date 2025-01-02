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

  get powerBoostType(): PowerBoostType {
    const data = this.#systemData;

    if (data.skillType === "gun" || data.skillType === "phys") {
      return "phys";
    }

    if (data.skillType === "mag" || data.skillType === "spell") {
      return "mag";
    }

    return "item";
  }

  get tn(): number {
    const actor = this.parent?.parent as SmtActor | undefined;
    if (!actor) return 1;

    const data = this.#systemData;

    if (data.skillType === "talk") {
      return actor.system.tn.negotiation + 20;
    }

    return data.accuracyStat === "auto"
      ? 100
      : actor.system.tn[data.accuracyStat] +
          data.tnMod +
          actor.system.buffs.accuracy +
          // TODO: See if this is necessary
          // actor.system.tnBoosts * 20 +
          (data.skillType === "gun" ? actor.system.gunAttackBonus : 0);
  }

  get power(): number {
    const actor = this.parent?.parent as SmtActor | undefined;
    const data = this.#systemData;

    const basePower =
      actor?.system.power[data.skillType === "gun" ? "gun" : data.damageType] ?? 0;

    return data.potency + basePower;
  }

  get autoFailThreshold(): number {
    const actor = this.parent?.parent as SmtActor | undefined;
    return actor?.system.autoFailThreshold ?? CONFIG.SMT.defaultAutofailThreshold;
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
