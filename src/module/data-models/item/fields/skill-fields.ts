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
    selfAppliedStatus: new fields.StringField({
      choices: CONFIG.SMT.statusIds,
    }),
    focusEffect: new fields.BooleanField(),
  } as const;
}
