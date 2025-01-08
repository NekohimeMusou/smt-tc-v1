import { SmtActor } from "../../../documents/actor/actor.js";
import { SmtItem } from "../../../documents/item/item.js";
import { attackDataFields } from "../fields/attack-fields.js";

export class ActionData extends foundry.abstract.TypeDataModel {
  get type() {
    return "action" as const;
  }
  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      ...attackDataFields(),
      basicStrike: new fields.BooleanField({ initial: false }),
      actionType: new fields.StringField({
        choices: CONFIG.SMT.actionTypes,
        initial: "phys",
      }),
    }
  }

  override prepareBaseData() {
    const data = this.#systemData;

    data.damageType = data.actionType === "phys" || data.actionType === "gun" ? "phys" : "mag";
  }

  // TODO: Make this more specific + overridable?
  get pierce(): boolean {
    const data = this.#systemData;
    const actor = this.parent?.parent as SmtActor | undefined;

    return (
      data.innatePierce ||
      (data.affinity === "phys" && (actor?.system.pierce ?? false))
    );
  }

  // TODO: Make this more specific + overridable
  get powerBoostType(): PowerBoostType {
    const data = this.#systemData;

    if (data.actionType === "gun" || data.actionType === "phys") {
      return "phys";
    }

    if (data.actionType === "mag" || data.actionType === "spell") {
      return "mag";
    }

    return "item";
  }

  get tn(): number {
      const actor = this.parent?.parent as SmtActor | undefined;
      if (!actor) return 1;
  
      const data = this.#systemData;
  
      if (data.actionType === "talk") {
        return actor.system.tn.negotiation + 20;
      }
  
      return data.accuracyStat === "auto"
        ? 100
        : actor.system.tn[data.accuracyStat] +
            data.tnMod +
            actor.system.buffs.accuracy -
            actor.system.debuffs.accuracy +
            (data.actionType === "gun" ? actor.system.gunAttackBonus : 0);
    }

    get power(): number {
      const actor = this.parent?.parent as SmtActor | undefined;
      const data = this.#systemData;
  
      const basePower =
        actor?.system.power[data.actionType === "gun" ? "gun" : data.damageType] ??
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
  
      const actionType = data.actionType;
  
      return actionType === "phys" ? "hp" : "mp";
    }

  // Typescript-related hack
    get #systemData() {
      return this as SmtItem["system"];
    }
}