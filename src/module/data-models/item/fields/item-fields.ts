export function itemDataFields() {
  const fields = foundry.data.fields;

  return {
    qty: new fields.NumberField({ integer: true, positive: true }),
    equipSlot: new fields.StringField({
      choices: CONFIG.SMT.equipSlots,
      initial: "none",
    }),
    equipped: new fields.BooleanField(),
  };
}
