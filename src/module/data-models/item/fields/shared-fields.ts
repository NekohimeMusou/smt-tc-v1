export function sharedItemFields() {
  const fields = foundry.data.fields;

  return {
    itemType: new fields.StringField({
      choices: CONFIG.SMT.itemTypes,
      initial: "skill",
    }),
    notes: new fields.HTMLField(),
  } as const;
}
