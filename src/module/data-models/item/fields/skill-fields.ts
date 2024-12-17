import { SMT } from "../../../config/config.js";

export function skillFields() {
  const fields = foundry.data.fields;

  return {
    // Inheritance traits (Wing, Breath, etc)
    inheritanceTraits: new fields.StringField(),
    // Phys attack, magic attack, or spell
    skillType: new fields.StringField({
      choices: SMT.skillTypes,
      initial: "phys",
    }),
    target: new fields.StringField(),
    cost: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
    costType: new fields.StringField({
      choices: SMT.skillCostTypes,
      initial: "hp",
    }),
    affinity: new fields.StringField({
      choices: SMT.affinities,
      initial: "phys",
    }),
    potency: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
    accuracyStat: new fields.StringField({
      choices: SMT.accuracyStats,
      initial: "st",
    }),
    powerCategory: new fields.StringField({
      choices: SMT.powerCategories,
      initial: "phys",
    }),
    basePower: new fields.NumberField({ integer: true }),
    power: new fields.NumberField({ integer: true }),
    tn: new fields.NumberField({ integer: true }),
    tnMod: new fields.NumberField({ integer: true, initial: 0 }),
    ailment: new fields.StringField({ choices: SMT.ailments, blank: true }),
    ailmentRate: new fields.NumberField({ integer: true, initial: 0 }),
    hasCritBoost: new fields.BooleanField({ initial: false }),
    // To be shown in chat card with rolls
    effect: new fields.HTMLField(),
  } as const;
}
