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
    const data = this.#systemData;

    return data.accuracyStat === "auto"
      ? 100
      : (actor?.system.stats[data.accuracyStat].tn ?? 1) + data.tnMod;
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

  get hasPowerBoost(): boolean {
    const actor = this.parent?.parent as SmtActor;
    const data = this.#systemData;

    const skillType = data.skillType;

    const isPhysicalAttack = skillType === "phys" || skillType === "gun";
    const isMagicAttack = !isPhysicalAttack;

    return (
      (isPhysicalAttack && actor.system.modifiers.powerfulStrikes) ||
      (isMagicAttack && actor.system.modifiers.powerfulSpells)
    );
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
