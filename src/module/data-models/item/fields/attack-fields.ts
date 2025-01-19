export function attackDataFields() {
  const fields = foundry.data.fields;

  // Handle chance to IK stoned targets
  // Handle fixed HP reduction (HP to 1, reduced to 20%, etc)
  // Handle random ailment chance (God's Curse, a Samael-only skill)
  return {
    cost: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
    ammo: new fields.SchemaField({
      min: new fields.NumberField({ integer: true, initial: 0 }),
      max: new fields.NumberField({ integer: true, initial: 0, min: 0 }),
      value: new fields.NumberField({ integer: true, initial: 0 }),
    }),
    auto: new fields.BooleanField(),
    target: new fields.StringField({
      choices: CONFIG.SMT.targets,
      initial: "one",
    }),
    affinity: new fields.StringField({
      choices: CONFIG.SMT.affinities,
      initial: "phys",
    }),
    hasPowerRoll: new fields.BooleanField(),
    potency: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
    ailment: new fields.SchemaField({
      name: new fields.StringField({
        choices: CONFIG.SMT.ailments,
        initial: "none",
      }),
      rate: new fields.NumberField({ integer: true, initial: 0 }),
    }),
    // Exclusively required for Deadly Fury. Doesn't stack with Might
    innateCritBoost: new fields.BooleanField(),
    pinhole: new fields.BooleanField(),
    innatePierce: new fields.BooleanField(),
  } as const;
}
