export function skillFields() {
  const fields = foundry.data.fields;

  return {
    basicStrike: new fields.BooleanField({ initial: false }),
    // TODO: Factor out
    hasAttack: new fields.BooleanField({ initial: true }),
    // Inheritance traits (Wing, Breath, etc)
    inheritanceTraits: new fields.StringField(),
    // Phys attack, magic attack, or spell
    skillType: new fields.StringField({
      choices: CONFIG.SMT.skillTypes,
      initial: "phys",
    }),
    // To be shown in chat card with rolls
    effect: new fields.HTMLField(),
  } as const;
}
