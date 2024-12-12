export function sharedItemFields() {
  const fields = foundry.data.fields;

  return {
    notes: new fields.HTMLField(),
  };
}
