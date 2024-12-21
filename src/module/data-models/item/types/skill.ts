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

    const basePower = actor.system.power[data.powerStatType];

    return data.potency + basePower;
  }

  get autoFailThreshold(): number {
    const actor = this.parent?.parent as SmtActor;
    return actor?.system.autoFailThreshold;
  }

  get physMagCategory(): PhysMagCategory {
    return this.#systemData.attackType === "mag" ? "mag" : "phys";
  }

  get hasPowerBoost(): boolean {
    const actor = this.parent?.parent as SmtActor;
    const data = this.#systemData;

    const isPhysicalAttack: boolean = data.attackType !== "mag";
    const isMagicAttack = !isPhysicalAttack;

    return (
      (isPhysicalAttack && actor.system.mods.powerfulStrikes) ||
      (isMagicAttack && actor.system.mods.powerfulSpells)
    );
  }

  // Typescript-related hack
  get #systemData() {
    return this as this & SmtItem["system"];
  }
}
