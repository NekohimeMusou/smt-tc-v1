import { SMT } from "../../../config/config.js";

export function skillFields() {
  const fields = foundry.data.fields;

  return {
    isAttack: new fields.BooleanField({ initial: true }),
    hasPowerRoll: new fields.BooleanField({ initial: true }),
    cost: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
    costType: new fields.StringField({
      choices: SMT.skillCostTypes,
      initial: "hp",
    }),
    // Inheritance traits (Wing, Breath, etc)
    inheritanceTraits: new fields.StringField(),
    // Phys attack, magic attack, or spell
    skillType: new fields.StringField({
      choices: SMT.skillTypes,
      initial: "phys",
    }),
    target: new fields.StringField({ choices: SMT.targets, initial: "one" }),
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
    ailment: new fields.SchemaField({
      name: new fields.StringField({ choices: SMT.ailments, initial: "none" }),
      rate: new fields.NumberField({ integer: true, initial: 0 }),
    }),
    hasCritBoost: new fields.BooleanField({ initial: false }),
    // To be shown in chat card with rolls
    effect: new fields.StringField(),
    basicStrike: new fields.BooleanField({ initial: false }),
    ammo: new fields.SchemaField({
      min: new fields.NumberField({ integer: true, initial: 0 }),
      // TODO: Actually support ammo tracking
      // max: new fields.NumberField({ integer: true, initial: 0, min: 0 }),
      value: new fields.NumberField({ integer: true, initial: 0 }),
    }),
  } as const;
}
