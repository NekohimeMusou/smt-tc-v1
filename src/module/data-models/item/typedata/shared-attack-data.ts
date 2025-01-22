export function sharedAttackData() {
  const fields = foundry.data.fields;

  // No Support or Unique skill ever requires accuracy/dodge
  return {
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
    damageType: new fields.StringField({ choices: CONFIG.SMT.damageTypes }),
    potency: new fields.NumberField({ integer: true, min: 0 }),
    ailment: new fields.EmbeddedDataField(AilmentDM),
    // Chance to shatter a Stoned target; 30% for Phys, varies for Force
    shatterChance: new fields.NumberField({ integer: true, min: 0 }),
    powerBoostType: new fields.StringField({
      choices: CONFIG.SMT.powerBoostTypes,
    }),
    // Required for Deadly Fury
    innateCritBoost: new fields.BooleanField(),
    // Required for Pinhole
    pinhole: new fields.BooleanField(),
    // Status to apply automatically, e.g. Focused, Defending
    autoStatus: new fields.StringField({ choices: CONFIG.SMT.statusIds }),
  };
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
