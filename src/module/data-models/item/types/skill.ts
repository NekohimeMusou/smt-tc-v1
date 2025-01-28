import { SmtActor } from "../../../documents/actor/actor.js";
import { SmtItem } from "../../../documents/item/item.js";
import { attackDataFields } from "../fields/attack-fields.js";
import { itemDataFields } from "../fields/item-fields.js";
import { sharedItemDataFields } from "../fields/shared-fields.js";
import { skillDataFields } from "../fields/skill-fields.js";

export abstract class SmtBaseItemData extends foundry.abstract.TypeDataModel {
  abstract get type(): "stackable" | "unstackable";
  get stackable(): boolean {
    return this.type === "stackable";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static override migrateData(source: Record<string, any>) {
    const data = source as SmtBaseItemData & SmtItem["system"];
    // @ts-expect-error "auto" is gone as an accuracy stat
    if (data?.accuracyStat === "auto") {
      // @ts-expect-error This field isn't readonly
      data.auto = true;
    }

    // This is an automatic getter now
    if (data.accuracyStat) {
      // @ts-expect-error This field isn't readonly
      delete data.accuracyStat;
    }

    return source;
  }

  static override defineSchema() {
    return {
      ...attackDataFields(),
      ...skillDataFields(),
      ...itemDataFields(),
      ...sharedItemDataFields(),
    } as const;
  }

  override prepareBaseData() {
    const data = this.#systemData;
    if (data.itemType === "weapon") {
      // @ts-expect-error This field isn't readonly and its type should be boolean
      data.hasPowerRoll = true;
    }

    if (data.itemType === "equipment") {
      // @ts-expect-error This field isn't readonly and its type should be boolean
      data.hasPowerRoll = false;
    }
    if (data.itemType === "item") {
      // @ts-expect-error This field isn't readonly
      data.auto = true;
    }
  }

  get accuracyStat(): TargetNumber {
    const skillType = this.#systemData.skillType;

    switch (skillType) {
      case "phys":
        return "st";
      case "spell":
      case "mag":
        return "ma";
      case "gun":
        return "ag";
      case "talk":
        return "negotiation";
      default:
        return "lu";
    }
  }

  get pierce(): boolean {
    const data = this.#systemData;
    const actor = this.parent?.parent as SmtActor | undefined;

    return (
      data.innatePierce ||
      (data.affinity === "phys" && (actor?.system.pierce ?? false))
    );
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

  get powerBoost(): boolean {
    const data = this.#systemData;
    const actor = this.parent?.parent as SmtActor;

    return actor.system.powerBoost[data.powerBoostType];
  }

  get tn(): number {
    const actor = this.parent?.parent as SmtActor;
    // This should never happen
    if (!actor) return 1;

    const data = this.#systemData;

    const talkSkill = data.skillType === "talk";

    return (
      actor.system.tn[data.accuracyStat] +
      (talkSkill ? 20 : 0) +
      actor.system.buffs.sukukaja -
      actor.system.buffs.sukunda +
      (data.skillType === "gun" ? actor.system.gunAttackBonus : 0)
    );
  }

  get power(): number {
    const actor = this.parent?.parent as SmtActor;
    const data = this.#systemData;

    const basePower =
      actor?.system.power[data.skillType === "gun" ? "gun" : data.damageType] ??
      0;

    return data.potency + basePower;
  }

  get autoFailThreshold(): number {
    const actor = this.parent?.parent as SmtActor;
    return (
      actor?.system.autoFailThreshold ?? CONFIG.SMT.defaultAutofailThreshold
    );
  }

  get costType(): CostType {
    const data = this.#systemData;

    const skillType = data.skillType;

    return skillType === "phys" ? "hp" : "mp";
  }

  get critBoost(): boolean {
    const data = this.#systemData;
    const actor = this.parent?.parent as SmtActor;

    return (
      data.innateCritBoost || (data.damageType === "phys" && actor.system.might)
    );
  }

  // Typescript-related hack
  get #systemData() {
    return this as this & SmtItem["system"];
  }
}
