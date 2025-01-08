export function sharedItemDataFields() {
  const fields = foundry.data.fields;

  return {
    itemType: new fields.StringField({
      choices: CONFIG.SMT.itemTypes,
      initial: "skill",
    }),
    // To be shown in chat card with rolls
    effect: new fields.HTMLField(),
  } as const;
}
