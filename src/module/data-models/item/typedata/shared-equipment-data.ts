export function sharedEquipmentData() {
  const fields = foundry.data.fields;

  return {
    equipped: new fields.BooleanField(),
  } as const;
}
