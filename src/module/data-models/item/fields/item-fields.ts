export function itemDataFields() {
  const fields = foundry.data.fields;

  return {
    qty: new fields.NumberField({ integer: true, positive: true }),
    equipSlot: new fields.StringField({
      choices: CONFIG.SMT.equipSlots,
      initial: "none",
    }),
    resistBonus: new fields.SchemaField({
      phys: new fields.NumberField({ integer: true }),
      mag: new fields.NumberField({ integer: true }),
    }),
    equipped: new fields.BooleanField(),
  };
}
