import { SmtActor } from "../../../documents/actor/actor.js";
import { SmtItem } from "../../../documents/item/item.js";
import { attackDataFields } from "../fields/attack-fields.js";
import { consumableDataFields } from "../fields/consumable-fields.js";
import { sharedItemDataFields } from "../fields/shared-fields.js";
import { skillDataFields } from "../fields/skill-fields.js";
import { BaseItemData } from "./base.js";

export class SmtSkillDataModel extends BaseItemData {
  get type() {
    return "skill" as const;
  }

  static override defineSchema() {
    return {
      ...super.defineSchema(),
      ...attackDataFields(),
      ...skillDataFields(),
      ...consumableDataFields(),
      ...sharedItemDataFields(),
    };
  }

  override prepareBaseData() {
    const data = this.#systemData;
    if (data.itemType === "weapon") {
      data.hasPowerRoll = true;
    }

    if (data.itemType === "equipment") {
      data.hasPowerRoll = false;
    }

    if (data.itemType === "item") {
      data.accuracyStat = "auto";
    }

    data.damageType =
      data.skillType === "phys" || data.skillType === "gun" ? "phys" : "mag";
  }

  get pierce(): boolean {
    const data = this.#systemData;
    const actor = this.parent?.parent as SmtActor | undefined;

    return (
      data.innatePierce ||
      (data.affinity === "phys" && (actor?.system.pierce ?? false))
    );
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
          actor.system.buffs.accuracy -
          actor.system.debuffs.accuracy +
          (data.skillType === "gun" ? actor.system.gunAttackBonus : 0);
  }

  get power(): number {
    const actor = this.parent?.parent as SmtActor | undefined;
    const data = this.#systemData;

    const basePower =
      actor?.system.power[data.skillType === "gun" ? "gun" : data.damageType] ??
      0;

    return data.potency + basePower;
  }

  get autoFailThreshold(): number {
    const actor = this.parent?.parent as SmtActor | undefined;
    return (
      actor?.system.autoFailThreshold ?? CONFIG.SMT.defaultAutofailThreshold
    );
  }

  get costType(): SkillCostType {
    const data = this.#systemData;

    const skillType = data.skillType;

    return skillType === "phys" ? "hp" : "mp";
  }

  // Typescript-related hack
  get #systemData() {
    return this as SmtItem["system"];
  }
}
