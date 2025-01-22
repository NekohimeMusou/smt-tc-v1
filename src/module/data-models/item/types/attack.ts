import { SmtActor } from "../../../documents/actor/actor.js";
import { SmtBaseItemDM } from "./base.js";

export abstract class SMTBaseAttackDM extends SmtBaseItemDM {
  static override defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      auto: new fields.BooleanField(),
      target: new fields.StringField({
        choices: CONFIG.SMT.targets,
        initial: "one",
      }),
      affinity: new fields.StringField({
        choices: CONFIG.SMT.skillAffinities,
        initial: "phys",
      }),
      powerRoll: new fields.BooleanField(),
      analyzeRoll: new fields.BooleanField(),
      potency: new fields.NumberField({ integer: true, min: 0 }),
      ailment: new fields.EmbeddedDataField(AilmentDM),
      // Chance to shatter a Stoned target; 30% for Phys, varies for Force
      shatterChance: new fields.NumberField({ integer: true, min: 0 }),
      // Required for Deadly Fury
      innateCritBoost: new fields.BooleanField(),
      // Required for Pinhole
      pinhole: new fields.BooleanField(),
      // Status to apply automatically, e.g. Focused, Defending
      autoStatus: new fields.StringField({ choices: CONFIG.SMT.statusIds }),
    };
  }

  override prepareDerivedData() {
    super.prepareDerivedData();
    const data = this.systemData as {
      shatterChance: number;
      affinity: Affinity;
    };

    if (data.affinity === "phys") {
      data.shatterChance = 30;
    }
  }

  get autoFailThreshold(): number {
    const actor = this.parent?.parent as SmtActor;

    return actor.system.autoFailThreshold;
  }

  get pierce(): boolean {
    const data = this.systemData as { affinity?: Affinity };
    const actor = this.parent?.parent as SmtActor | undefined;

    return data?.affinity === "phys" && (actor?.system.pierce ?? false);
  }

  abstract get accuracyStat(): TargetNumber;

  abstract get tn(): number;

  abstract get damageType(): DamageType;

  abstract get power(): number;

  abstract get powerBoostType(): PowerBoostType;

  abstract get powerBoost(): boolean;

  abstract get critBoost(): boolean;
}

class AilmentDM extends foundry.abstract.DataModel {
  static override defineSchema() {
    const fields = foundry.data.fields;

    return {
      id: new fields.StringField({
        choices: CONFIG.SMT.ailments,
        initial: "none",
      }),
      rate: new fields.NumberField({ integer: true, initial: 0 }),
    } as const;
  }
}
