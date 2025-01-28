export function itemDataFields() {
  const fields = foundry.data.fields;

  return {
    qty: new fields.NumberField({ integer: true, positive: true, initial: 1 }),
    equipSlot: new fields.StringField({
      choices: CONFIG.SMT.equipSlots,
      initial: "none",
    }),
    resistBonus: new fields.SchemaField({
      phys: new fields.NumberField({ integer: true, initial: 0 }),
      mag: new fields.NumberField({ integer: true, initial: 0 }),
    }),
    equipped: new fields.BooleanField(),
    price: new fields.NumberField({ integer: true, initial: 0 }),
    consume: new fields.BooleanField(),
  };
}
