import { SMT } from "../../../config/config.js";

export function skillFields() {
  const fields = foundry.data.fields;

  return {
    // Inheritance traits (Wing, Breath, etc)
    inheritanceTraits: new fields.StringField(),
    // Phys attack, magic attack, or spell
    skillType: new fields.StringField({ choices: SMT.skillTypes }),
    target: new fields.StringField(),
    cost: new fields.NumberField({ integer: true, min: 0 }),
    costType: new fields.StringField({ choices: SMT.skillCostTypes }),
    affinity: new fields.StringField({ choices: SMT.affinities }),
    potency: new fields.NumberField({ integer: true, min: 0 }),
    accuracyStat: new fields.StringField({ choices: SMT.accuracyStats }),
    powerCategory: new fields.StringField({ choices: SMT.powerCategories }),
    basePower: new fields.NumberField({ integer: true }),
    power: new fields.NumberField({ integer: true }),
    tn: new fields.NumberField({ integer: true }),
    tnMod: new fields.NumberField({ integer: true }),
    ailment: new fields.StringField({ choices: SMT.ailments, blank: true }),
    ailmentRate: new fields.NumberField({ integer: true, initial: 0 }),
    hasCritBoost: new fields.BooleanField({ initial: false }),
    // To be shown in chat card with rolls
    effect: new fields.HTMLField(),
  } as const;
}
