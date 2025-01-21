export function sharedEquipmentData() {
  const fields = foundry.data.fields;

  return {
    equipped: new fields.BooleanField(),
    equipSlot: new fields.StringField({ choices: CONFIG.SMT.equipSlots }),
  } as const;
}
