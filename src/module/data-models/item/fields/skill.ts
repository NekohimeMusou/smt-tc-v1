import { SMT } from "../../../config/config.js";

export function skillFields() {
  const fields = foundry.data.fields;

  return {
    // Inheritance traits (Wing, Breath, etc)
    inheritanceTraits: new fields.StringField({ choices: SMT.inheritanceTraits}),
    // Phys attack, magic attack, or spell
    skillType: new fields.StringField({ choices: SMT.skillTypes }),
    target: new fields.StringField(),
    cost: new fields.NumberField({ integer: true, min: 0 }),
    costType: new fields.StringField({ choices: SMT.skillCostTypes }),
    element: new fields.StringField({ choices: SMT.affinities }),
    potency: new fields.NumberField({ integer: true, min: 0 }),
    autoSuccess: new fields.BooleanField(),
    associatedStat: new fields. StringField({ choices: SMT.stats }),
  };
}
