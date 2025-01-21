export function sharedItemData() {
  const fields = foundry.data.fields;

  return {
    itemType: new fields.StringField({
      choices: CONFIG.SMT.itemTypes,
      initial: "skill",
    }),
  } as const;
}
