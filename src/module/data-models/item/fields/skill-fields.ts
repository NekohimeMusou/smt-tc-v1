import { SMT } from "../../../config/config.js";

export function skillFields() {
  const fields = foundry.data.fields;

  return {
    // Inheritance traits (Wing, Breath, etc)
    inheritanceTraits: new fields.ArrayField(
      new fields.StringField({ choices: SMT.inheritanceTraits }),
    ),
    // Phys attack, magic attack, or spell
    skillType: new fields.StringField({ choices: SMT.skillTypes }),
    target: new fields.StringField(),
    cost: new fields.NumberField({ integer: true, min: 0 }),
    costType: new fields.StringField({ choices: SMT.skillCostTypes }),
    element: new fields.StringField({ choices: SMT.affinities }),
    potency: new fields.NumberField({ integer: true, min: 0 }),
    autoSuccess: new fields.BooleanField(),
    accuracyStat: new fields.StringField({ choices: SMT.stats }),
    powerStat: new fields.StringField({ choices: SMT.powerStats }),
    basePower: new fields.NumberField({ integer: true }),
    power: new fields.NumberField({ integer: true }),
    tn: new fields.NumberField({ integer: true }),
    // Workaround for the lack of a multi-attack mechanic
    tnMod: new fields.NumberField({ integer: true }),
  } as const;
}
