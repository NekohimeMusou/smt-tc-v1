export function skillDataFields() {
  const fields = foundry.data.fields;

  return {
    basicStrike: new fields.BooleanField({ initial: false }),
    expended: new fields.BooleanField({ initial: false }),
    // Inheritance traits (Wing, Breath, etc)
    inheritanceTraits: new fields.StringField(),
    // Phys attack, magic attack, or spell
    skillType: new fields.StringField({
      choices: CONFIG.SMT.skillTypes,
      initial: "phys",
    }),
    focusEffect: new fields.BooleanField(),
    // To be shown in chat card with rolls
    effect: new fields.HTMLField(),
  } as const;
}
