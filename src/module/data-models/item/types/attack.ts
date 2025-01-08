import { SmtItem } from "../../../documents/item/item.js";

export class AttackData extends foundry.abstract.TypeDataModel {
  static override defineSchema() {
    const fields = foundry.data.fields;

    return {
      accuracyStat: new fields.StringField({
        choices: CONFIG.SMT.accuracyStats,
        initial: "st",
      }),
      target: new fields.StringField({
        choices: CONFIG.SMT.targets,
        initial: "one",
      }),
      damageType: new fields.StringField({ choices: CONFIG.SMT.damageTypes }),
      affinity: new fields.StringField({
        choices: CONFIG.SMT.affinities,
        initial: "phys",
      }),
      potency: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
      tnMod: new fields.NumberField({ integer: true, initial: 0 }),
      ailment: new fields.SchemaField({
        name: new fields.StringField({
          choices: CONFIG.SMT.ailments,
          initial: "none",
        }),
        rate: new fields.NumberField({ integer: true, initial: 0, min: 0 }),
      }),
      critBoost: new fields.BooleanField(),
      pinhole: new fields.BooleanField(),
      innatePierce: new fields.BooleanField(),
    };
  }
}
